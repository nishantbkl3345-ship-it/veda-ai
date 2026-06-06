import mongoose, { Schema, Document, Types } from "mongoose";

export const DIFFICULTY_LEVELS = ["Easy", "Moderate", "Hard"] as const;
export type DifficultyLevel = (typeof DIFFICULTY_LEVELS)[number];

export interface IQuestion {
  text: string;
  difficulty: DifficultyLevel;
  marks: number;
  answer: string;
}

export interface ISection {
  title: string;
  instruction: string;
  questions: IQuestion[];
}

export interface IQuestionPaper extends Document {
  _id: Types.ObjectId;
  assignmentId: Types.ObjectId;
  schoolName: string;
  subject: string;
  grade: string;
  section: string;
  timeAllowed: string;
  totalMarks: number;
  sections: ISection[];
  createdAt: Date;
}

const questionSchema = new Schema<IQuestion>(
  {
    text: { type: String, required: true },
    difficulty: {
      type: String,
      enum: DIFFICULTY_LEVELS,
      required: true,
    },
    marks: { type: Number, required: true, min: 1 },
    answer: { type: String, required: true },
  },
  { _id: false }
);

const sectionSchema = new Schema<ISection>(
  {
    title: { type: String, required: true },
    instruction: { type: String, default: "" },
    questions: { type: [questionSchema], required: true },
  },
  { _id: false }
);

const questionPaperSchema = new Schema<IQuestionPaper>(
  {
    assignmentId: {
      type: Schema.Types.ObjectId,
      ref: "Assignment",
      required: true,
      index: true,
    },
    schoolName: { type: String, required: true, trim: true },
    subject: { type: String, required: true, trim: true },
    grade: { type: String, required: true, trim: true },
    section: { type: String, default: "" },
    timeAllowed: { type: String, required: true },
    totalMarks: { type: Number, required: true, min: 0 },
    sections: { type: [sectionSchema], required: true },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

export const QuestionPaper = mongoose.model<IQuestionPaper>(
  "QuestionPaper",
  questionPaperSchema
);

