import request from "supertest";
import { app } from "../index";
import path from "path";
import fs from "fs";

// Mocking dependencies to avoid external service connections during tests
jest.mock("ioredis", () => {
  return jest.fn().mockImplementation(() => ({
    on: jest.fn(),
    ping: jest.fn().mockResolvedValue("PONG"),
    quit: jest.fn().mockResolvedValue(undefined),
    status: "ready",
  }));
});

jest.mock("bullmq", () => {
  return {
    Queue: jest.fn().mockImplementation(() => ({
      add: jest.fn().mockResolvedValue({ id: "mock-job-id" }),
    })),
    Worker: jest.fn().mockImplementation(() => ({
      on: jest.fn(),
      close: jest.fn(),
    })),
  };
});

jest.mock("../db/mongo", () => ({
  connectMongo: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("../models/assignment.model", () => {
  const queryFind = {
    sort: jest.fn().mockReturnThis(),
    lean: jest.fn().mockResolvedValue([
      {
        _id: "665f9bf28ce9bb96ef2d1234",
        title: "Mid-Term Physics Paper",
        subject: "Physics",
        grade: "10th",
        dueDate: new Date(Date.now() + 86400000).toISOString(),
        additionalInstructions: "",
        questionTypes: [{ type: "MCQ", count: 5, marks: 2 }],
        status: "pending",
        jobId: "mock-job-id",
      },
    ]),
  };

  const queryFindById = {
    lean: jest.fn().mockResolvedValue({
      _id: "665f9bf28ce9bb96ef2d1234",
      title: "Mid-Term Physics Paper",
      subject: "Physics",
      grade: "10th",
      dueDate: new Date(Date.now() + 86400000).toISOString(),
      additionalInstructions: "",
      questionTypes: [{ type: "MCQ", count: 5, marks: 2 }],
      status: "pending",
      jobId: "mock-job-id",
    }),
  };

  class MockAssignment {
    _id = "665f9bf28ce9bb96ef2d1234";
    title: string;
    subject: string;
    grade: string;
    dueDate: any;
    additionalInstructions: string;
    questionTypes: any;
    status = "pending";
    jobId = "";
    materialPath?: string;

    constructor(data: any) {
      this.title = data?.title || "Mid-Term Physics Paper";
      this.subject = data?.subject || "Physics";
      this.grade = data?.grade || "10th";
      this.dueDate = data?.dueDate || new Date(Date.now() + 86400000);
      this.additionalInstructions = data?.additionalInstructions || "";
      this.questionTypes = data?.questionTypes || [{ type: "MCQ", count: 5, marks: 2 }];
      this.materialPath = data?.materialPath;
    }

    save = jest.fn().mockImplementation(function (this: any) {
      this.jobId = "mock-job-id";
      return Promise.resolve(this);
    });

    static find = jest.fn().mockReturnValue(queryFind);
    static findById = jest.fn().mockReturnValue(queryFindById);
    static findByIdAndDelete = jest.fn().mockResolvedValue({ _id: "665f9bf28ce9bb96ef2d1234" });
  }

  return {
    Assignment: MockAssignment,
  };
});

jest.mock("../models/questionPaper.model", () => {
  const queryFindOne = {
    lean: jest.fn().mockResolvedValue({
      _id: "665f9bf28ce9bb96ef2d5678",
      assignmentId: "665f9bf28ce9bb96ef2d1234",
      schoolName: "Delhi Public School",
      subject: "Physics",
      grade: "10th",
      section: "",
      timeAllowed: "45 minutes",
      totalMarks: 10,
      sections: [
        {
          title: "Section A",
          instruction: "Answer all questions in Section A",
          questions: [
            { text: "MCQ Question 1 for Physics", difficulty: "Easy", marks: 2, answer: "Answer to question 1" },
          ],
        },
      ],
    }),
  };

  return {
    QuestionPaper: {
      findOne: jest.fn().mockReturnValue(queryFindOne),
      deleteMany: jest.fn().mockResolvedValue({ deletedCount: 1 }),
    },
  };
});

describe("Assignments Integration Tests", () => {
  jest.setTimeout(30000);
  const futureDate = new Date(Date.now() + 86400000).toISOString();
  const pastDate = new Date(Date.now() - 86400000).toISOString();

  it("should successfully create an assignment with valid payload and future date", async () => {
    const res = await request(app)
      .post("/api/assignments")
      .field("title", "Mid-Term Physics Paper")
      .field("subject", "Physics")
      .field("grade", "10th")
      .field("dueDate", futureDate)
      .field("questionTypes", JSON.stringify([{ type: "MCQ", count: 5, marks: 2 }]));

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("assignmentId");
    expect(res.body).toHaveProperty("jobId");
  });

  it("should fail validation if dueDate is in the past", async () => {
    const res = await request(app)
      .post("/api/assignments")
      .field("title", "Mid-Term Physics Paper")
      .field("subject", "Physics")
      .field("grade", "10th")
      .field("dueDate", pastDate)
      .field("questionTypes", JSON.stringify([{ type: "MCQ", count: 5, marks: 2 }]));

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Validation failed");
    expect(res.body.details.dueDate).toContain("Due date must be in the future");
  });

  it("should accept valid TXT file upload", async () => {
    const txtPath = path.resolve(__dirname, "test_file.txt");
    fs.writeFileSync(txtPath, "This is some reference text material.");

    const res = await request(app)
      .post("/api/assignments")
      .field("title", "Mid-Term Physics Paper")
      .field("subject", "Physics")
      .field("grade", "10th")
      .field("dueDate", futureDate)
      .field("questionTypes", JSON.stringify([{ type: "MCQ", count: 5, marks: 2 }]))
      .attach("material", txtPath);

    fs.unlinkSync(txtPath);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("assignmentId");
  });

  it("should reject invalid file extensions like .exe", async () => {
    const exePath = path.resolve(__dirname, "test_file.exe");
    fs.writeFileSync(exePath, "dummy binary");

    const res = await request(app)
      .post("/api/assignments")
      .field("title", "Mid-Term Physics Paper")
      .field("subject", "Physics")
      .field("grade", "10th")
      .field("dueDate", futureDate)
      .field("questionTypes", JSON.stringify([{ type: "MCQ", count: 5, marks: 2 }]))
      .attach("material", exePath);

    fs.unlinkSync(exePath);

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Only PDF, TXT, JPEG, and PNG files are allowed");
  });
});
