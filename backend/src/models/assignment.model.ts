import mongoose, { Schema, Document, Types } from "mongoose";

export const QUESTION_TYPES = ["MCQ", "Short", "Diagram", "Numerical"] as const;
export type QuestionType = (typeof QUESTION_TYPES)[number];

export const ASSIGNMENT_STATUSES = ["pending", "processing", "completed", "failed"] as const;
export type AssignmentStatus = (typeof ASSIGNMENT_STATUSES)[number];

export interface IQuestionTypeSpec {
  type: QuestionType;
  count: number;
  marks: number;
}

export interface IAssignment extends Document {
  _id: Types.ObjectId;
  title: string;
  subject: string;
  grade: string;
  dueDate: Date;
  additionalInstructions: string;
  questionTypes: IQuestionTypeSpec[];
  status: AssignmentStatus;
  jobId: string;
  materialPath?: string;
  createdAt: Date;
  updatedAt: Date;
}

const questionTypeSpecSchema = new Schema<IQuestionTypeSpec>(
  {
    type: {
      type: String,
      enum: QUESTION_TYPES,
      required: true,
    },
    count: { type: Number, required: true, min: 1 },
    marks: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const assignmentSchema = new Schema<IAssignment>(
  {
    title: { type: String, required: true, trim: true },
    subject: { type: String, required: true, trim: true },
    grade: { type: String, required: true, trim: true },
    dueDate: { type: Date, required: true },
    additionalInstructions: { type: String, default: "" },
    questionTypes: {
      type: [questionTypeSpecSchema],
      required: true,
      validate: {
        validator: (v: IQuestionTypeSpec[]) => v.length > 0,
        message: "At least one question type is required",
      },
    },
    status: {
      type: String,
      enum: ASSIGNMENT_STATUSES,
      default: "pending",
    },
    jobId: { type: String, default: "" },
    materialPath: { type: String },
  },
  {
    timestamps: true,
  }
);

assignmentSchema.index({ status: 1 });
assignmentSchema.index({ createdAt: -1 });

export const Assignment = mongoose.model<IAssignment>("Assignment", assignmentSchema);

