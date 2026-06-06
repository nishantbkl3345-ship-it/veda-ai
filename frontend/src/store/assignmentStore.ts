import { create } from "zustand";

// ── Shared Types ───────────────────────────────────

export type QuestionTypeEnum = "MCQ" | "Short" | "Diagram" | "Numerical";
export type JobStatus = "idle" | "pending" | "processing" | "completed" | "failed";
export type WizardStep = 1 | 2;

export interface QuestionTypeRow {
  type: QuestionTypeEnum;
  count: number;
  marks: number;
}

export interface AssignmentForm {
  title: string;
  subject: string;
  grade: string;
  dueDate: string;
  additionalInstructions: string;
  materialFile: File | null;
}

export interface QuestionPaperQuestion {
  text: string;
  difficulty: "Easy" | "Moderate" | "Hard";
  marks: number;
  answer: string;
}

export interface QuestionPaperSection {
  title: string;
  instruction: string;
  questions: QuestionPaperQuestion[];
}

export interface QuestionPaperOutput {
  schoolName: string;
  subject: string;
  grade: string;
  timeAllowed: string;
  totalMarks: number;
  sections: QuestionPaperSection[];
}

// ── List types (used by AssignmentsPage) ───────────

export interface AssignmentListItem {
  id: string;
  title: string;
  subject: string;
  difficulty: "easy" | "medium" | "hard";
  questions: unknown[];
  status: "idle" | "generating" | "completed" | "error";
  createdAt: string;
}

// ── Store State ────────────────────────────────────

interface CreateWizardState {
  step: WizardStep;
  form: AssignmentForm;
  questionTypes: QuestionTypeRow[];
  jobStatus: JobStatus;
  assignmentId: string | null;
  questionPaper: QuestionPaperOutput | null;
  errors: Record<string, string>;
}

interface CreateWizardActions {
  setField: <K extends keyof AssignmentForm>(key: K, value: AssignmentForm[K]) => void;
  addQuestionType: () => void;
  removeQuestionType: (index: number) => void;
  updateQuestionType: <K extends keyof QuestionTypeRow>(
    index: number,
    key: K,
    value: QuestionTypeRow[K]
  ) => void;
  setStep: (step: WizardStep) => void;
  setJobStatus: (status: JobStatus) => void;
  setAssignmentId: (id: string) => void;
  setResult: (paper: QuestionPaperOutput) => void;
  setErrors: (errors: Record<string, string>) => void;
  clearError: (key: string) => void;
  reset: () => void;
}

// ── Default question types ─────────────────────────

const DEFAULT_QUESTION_TYPES: QuestionTypeRow[] = [
  { type: "MCQ", count: 4, marks: 1 },
  { type: "Short", count: 3, marks: 2 },
  { type: "Diagram", count: 5, marks: 5 },
  { type: "Numerical", count: 5, marks: 5 },
];

const initialWizardState: CreateWizardState = {
  step: 1,
  form: {
    title: "",
    subject: "",
    grade: "",
    dueDate: "",
    additionalInstructions: "",
    materialFile: null,
  },
  questionTypes: [...DEFAULT_QUESTION_TYPES],
  jobStatus: "idle",
  assignmentId: null,
  questionPaper: null,
  errors: {},
};

// ── Store ──────────────────────────────────────────

export const useCreateStore = create<CreateWizardState & CreateWizardActions>(
  (set) => ({
    ...initialWizardState,

    setField: (key, value) =>
      set((s) => ({
        form: { ...s.form, [key]: value },
        errors: { ...s.errors, [key]: "" },
      })),

    addQuestionType: () =>
      set((s) => ({
        questionTypes: [
          ...s.questionTypes,
          { type: "MCQ" as QuestionTypeEnum, count: 1, marks: 1 },
        ],
      })),

    removeQuestionType: (index) =>
      set((s) => ({
        questionTypes: s.questionTypes.filter((_, i) => i !== index),
      })),

    updateQuestionType: (index, key, value) =>
      set((s) => ({
        questionTypes: s.questionTypes.map((row, i) =>
          i === index ? { ...row, [key]: value } : row
        ),
        errors: { ...s.errors, questionTypes: "" },
      })),

    setStep: (step) => set({ step }),

    setJobStatus: (jobStatus) => set({ jobStatus }),

    setAssignmentId: (assignmentId) => set({ assignmentId }),

    setResult: (questionPaper) =>
      set({ questionPaper, jobStatus: "completed" }),

    setErrors: (errors) => set({ errors }),

    clearError: (key) =>
      set((s) => {
        const next = { ...s.errors };
        delete next[key];
        return { errors: next };
      }),

    reset: () => set({ ...initialWizardState, questionTypes: [...DEFAULT_QUESTION_TYPES] }),
  })
);
