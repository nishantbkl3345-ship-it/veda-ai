import { Worker, Job } from "bullmq";
import { Assignment, IAssignment } from "../models/assignment.model";
import { QuestionPaper } from "../models/questionPaper.model";
import { getIO } from "../sockets/index";
import { redis } from "../db/redis";

interface AssignmentJobData {
  assignmentId: string;
}

async function processAssignment(job: Job<AssignmentJobData>): Promise<void> {
  const { assignmentId } = job.data;
  console.log(`[WORKER] Processing assignment ${assignmentId}`);

  const assignment = await Assignment.findById(assignmentId);
  if (!assignment) {
    throw new Error(`Assignment with ID ${assignmentId} not found`);
  }

  assignment.status = "processing";
  await assignment.save();

  const io = getIO();
  io.to(assignmentId).emit("job:processing", { assignmentId });

  console.log(`[WORKER] Generating mock question paper...`);
  const totalMarks = assignment.questionTypes.reduce(
    (sum, qt) => sum + qt.count * qt.marks,
    0
  );

  const sections = assignment.questionTypes.map((qt) => {
    let title = "";
    switch (qt.type) {
      case "MCQ":
        title = "Section A";
        break;
      case "Short":
        title = "Section B";
        break;
      case "Diagram":
        title = "Section C";
        break;
      case "Numerical":
        title = "Section D";
        break;
      default:
        title = `Section ${qt.type}`;
    }

    const questions = [];
    const difficulties = ["Easy", "Moderate", "Hard"] as const;

    for (let i = 1; i <= qt.count; i++) {
      const difficulty = difficulties[(i - 1) % 3];
      questions.push({
        text: `${qt.type} Question ${i} for ${assignment.subject}`,
        difficulty,
        marks: qt.marks,
        answer: `Answer to question ${i}`,
      });
    }

    return {
      title,
      instruction: `Answer all questions in ${title}`,
      questions,
    };
  });

  const savedQuestionPaper = await QuestionPaper.create({
    assignmentId: assignment._id,
    schoolName: "Delhi Public School",
    subject: assignment.subject,
    grade: assignment.grade,
    section: "",
    timeAllowed: "45 minutes",
    totalMarks,
    sections,
  });
  console.log(`[WORKER] Saved question paper ${assignmentId}`);

  assignment.status = "completed";
  await assignment.save();

  io.to(assignmentId).emit("job:completed", {
    assignmentId,
    questionPaper: savedQuestionPaper.toObject(),
  });
  console.log(`[WORKER] Completed assignment ${assignmentId}`);
}

export const assignmentWorker = new Worker<AssignmentJobData>(
  "assignment-generation",
  async (job) => {
    let assignmentFetched: IAssignment | null = null;
    try {
      assignmentFetched = await Assignment.findById(job.data.assignmentId);
      await processAssignment(job);
    } catch (err: any) {
      const errorMessage = err?.message || String(err);
      console.log(`[WORKER] Failed assignment ${job.data.assignmentId} — ${errorMessage}`);

      if (assignmentFetched) {
        try {
          const latestAssignment = await Assignment.findById(job.data.assignmentId);
          if (latestAssignment) {
            latestAssignment.status = "failed";
            await latestAssignment.save();
          }
        } catch (dbErr) {
          console.error(`[WORKER] Failed to mark assignment status as failed in database`, dbErr);
        }
      }

      try {
        const io = getIO();
        io.to(job.data.assignmentId).emit("job:failed", {
          assignmentId: job.data.assignmentId,
          error: errorMessage,
        });
      } catch (ioErr) {
        // Ignore socket failures so they do not override the original error
      }

      throw err;
    }
  },
  {
    connection: redis as any,
    concurrency: 3,
  }
);
