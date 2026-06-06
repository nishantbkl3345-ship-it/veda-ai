import { z } from "zod";

export const createAssignmentSchema = z.object({
  title: z
    .string({ required_error: "Title is required" })
    .trim()
    .min(1, "Title cannot be empty")
    .max(200, "Title must be 200 characters or fewer"),

  subject: z
    .string({ required_error: "Subject is required" })
    .trim()
    .min(1, "Subject cannot be empty"),

  grade: z
    .string({ required_error: "Grade is required" })
    .trim()
    .min(1, "Grade cannot be empty"),

  dueDate: z
    .string({ required_error: "Due date is required" })
    .datetime({ message: "dueDate must be a valid ISO 8601 string" })
    .transform((v) => new Date(v))
    .refine((date) => date > new Date(), { message: "Due date must be in the future" }),

  additionalInstructions: z.string().trim().default(""),

  questionTypes: z.preprocess(
    (val) => {
      if (typeof val === "string") {
        try {
          return JSON.parse(val);
        } catch {
          return val;
        }
      }
      return val;
    },
    z.array(
      z.object({
        type: z.enum(["MCQ", "Short", "Diagram", "Numerical"], {
          errorMap: () => ({
            message: "type must be one of: MCQ, Short, Diagram, Numerical",
          }),
        }),
        count: z
          .number({ required_error: "count is required" })
          .int()
          .min(1, "count must be at least 1"),
        marks: z
          .number({ required_error: "marks is required" })
          .int()
          .min(1, "marks must be at least 1"),
      }),
      { required_error: "questionTypes is required" }
    ).min(1, "At least one question type is required")
  ),
});

export type CreateAssignmentInput = z.infer<typeof createAssignmentSchema>;

