import { Router, Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import { ZodError } from "zod";
import { Assignment } from "../models/assignment.model";
import { QuestionPaper } from "../models/questionPaper.model";
import { createAssignmentSchema } from "../validators/assignment.validator";
import { assignmentQueue } from "../queues/assignmentQueue";
import { uploadMaterial } from "../middleware/upload.middleware";

const router = Router();

function isValidObjectId(id: string): boolean {
  return mongoose.Types.ObjectId.isValid(id);
}

function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
}

router.post(
  "/",
  uploadMaterial,
  asyncHandler(async (req: Request, res: Response) => {
    const parsed = createAssignmentSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({
        error: "Validation failed",
        details: parsed.error.flatten().fieldErrors,
      });
      return;
    }

    const data = parsed.data;

    const assignment = new Assignment({
      title: data.title,
      subject: data.subject,
      grade: data.grade,
      dueDate: data.dueDate,
      additionalInstructions: data.additionalInstructions,
      questionTypes: data.questionTypes,
      status: "pending",
      materialPath: req.file?.path,
    });

    await assignment.save();

    const job = await assignmentQueue.add("generate", {
      assignmentId: assignment._id.toString(),
      title: assignment.title,
      subject: assignment.subject,
      grade: assignment.grade,
      questionTypes: assignment.questionTypes,
      additionalInstructions: assignment.additionalInstructions,
      materialPath: assignment.materialPath,
    });

    assignment.jobId = job.id ?? "";
    await assignment.save();

    res.status(201).json({
      assignmentId: assignment._id,
      jobId: job.id,
    });
  })
);

router.get(
  "/",
  asyncHandler(async (_req: Request, res: Response) => {
    const assignments = await Assignment.find()
      .sort({ createdAt: -1 })
      .lean();

    res.json({ count: assignments.length, assignments });
  })
);

router.get(
  "/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      res.status(400).json({ error: "Invalid assignment ID" });
      return;
    }

    const assignment = await Assignment.findById(id).lean();

    if (!assignment) {
      res.status(404).json({ error: "Assignment not found" });
      return;
    }

    const questionPaper = await QuestionPaper.findOne({
      assignmentId: assignment._id,
    }).lean();

    res.json({ assignment, questionPaper: questionPaper ?? null });
  })
);

router.delete(
  "/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      res.status(400).json({ error: "Invalid assignment ID" });
      return;
    }

    const assignment = await Assignment.findByIdAndDelete(id);

    if (!assignment) {
      res.status(404).json({ error: "Assignment not found" });
      return;
    }

    await QuestionPaper.deleteMany({ assignmentId: assignment._id });

    res.json({ message: "Assignment deleted", assignmentId: id });
  })
);

router.use(
  (err: Error, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof ZodError) {
      res.status(400).json({
        error: "Validation failed",
        details: err.flatten().fieldErrors,
      });
      return;
    }

    if (err.message?.includes("Only PDF") || err.message?.includes("LIMIT_FILE_SIZE")) {
      res.status(400).json({ error: err.message });
      return;
    }

    console.error("error handler:", err);
    res.status(500).json({ error: "Something went wrong on the server" });
  }
);

export default router;

