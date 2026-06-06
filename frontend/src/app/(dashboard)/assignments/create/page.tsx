"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { getSocket, connectSocket } from "@/lib/socket";
import {
  useCreateStore,
  QuestionTypeEnum,
  QuestionPaperOutput,
} from "@/store/assignmentStore";

const Q_TYPE_OPTIONS: QuestionTypeEnum[] = ["MCQ", "Short", "Diagram", "Numerical"];
const Q_TYPE_LABELS: Record<QuestionTypeEnum, string> = {
  MCQ: "MCQ",
  Short: "Short Questions",
  Diagram: "Diagram / Graph-Based",
  Numerical: "Numerical Problems",
};

function validate(store: ReturnType<typeof useCreateStore.getState>): Record<string, string> {
  const errs: Record<string, string> = {};
  if (!store.form.title.trim()) errs.title = "Title is required";
  if (!store.form.subject.trim()) errs.subject = "Subject is required";
  if (!store.form.grade.trim()) errs.grade = "Grade is required";
  if (!store.form.dueDate) {
    errs.dueDate = "Due date is required";
  } else if (new Date(store.form.dueDate) <= new Date()) {
    errs.dueDate = "Due date must be in the future";
  }
  if (store.questionTypes.length === 0) {
    errs.questionTypes = "Add at least one question type";
  }
  store.questionTypes.forEach((qt, i) => {
    if (qt.count < 1) errs[`qt_count_${i}`] = "≥ 1";
    if (qt.marks < 1) errs[`qt_marks_${i}`] = "≥ 1";
  });
  return errs;
}

function Stepper({
  value,
  onChange,
  min = 1,
  error,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  error?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <div className="flex items-center border border-[#e5e5e5] rounded-lg overflow-hidden">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          className="w-8 h-8 flex items-center justify-center text-[#888] hover:bg-[#f5f5f5] transition-colors text-lg leading-none"
        >
          −
        </button>
        <span className="w-8 h-8 flex items-center justify-center text-sm font-medium text-[#1a1a1a] border-x border-[#e5e5e5] bg-white">
          {value}
        </span>
        <button
          type="button"
          onClick={() => onChange(value + 1)}
          className="w-8 h-8 flex items-center justify-center text-[#888] hover:bg-[#f5f5f5] transition-colors text-lg leading-none"
        >
          +
        </button>
      </div>
      {error && <span className="text-[11px] text-red-500">{error}</span>}
    </div>
  );
}

function FileDropZone({
  file,
  onFile,
}: {
  file: File | null;
  onFile: (f: File | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const f = e.dataTransfer.files[0];
      if (f) onFile(f);
    },
    [onFile]
  );

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
        dragging ? "border-accent bg-accent/5" : "border-[#d4d4d4] bg-[#fafafa]"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png,.txt"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
        }}
      />

      {file ? (
        <div className="flex items-center justify-center gap-3">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round"><rect x="4" y="2" width="12" height="16" rx="1.5" /><path d="M7 10l2 2 4-4" /></svg>
          <span className="text-sm font-medium text-[#1a1a1a] truncate max-w-[200px]">{file.name}</span>
          <button type="button" onClick={() => onFile(null)} className="text-xs text-red-500 hover:text-red-700 ml-1">Remove</button>
        </div>
      ) : (
        <>
          <svg className="mx-auto mb-2 text-[#aaa]" width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M16 22V10M12 14l4-4 4 4" /><rect x="4" y="4" width="24" height="24" rx="3" /></svg>
          <p className="text-sm text-[#888] mb-2">Choose a file or drag &amp; drop it here</p>
          <p className="text-xs text-[#aaa] mb-3">PDF, TXT, JPEG, PNG up to 10 MB</p>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="text-sm font-medium text-accent hover:text-accent/80 border border-accent/30 rounded-lg px-4 py-1.5 transition-colors"
          >
            Browse Files
          </button>
        </>
      )}
    </div>
  );
}

function ProgressSteps({ current }: { current: 1 | 2 }) {
  return (
    <div className="flex items-center gap-3 mb-8">
      {[1, 2].map((s) => (
        <div key={s} className="flex items-center gap-2">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
              s <= current
                ? "bg-accent text-white"
                : "border-2 border-[#d4d4d4] text-[#888]"
            }`}
          >
            {s}
          </div>
          <span className={`text-sm font-medium hidden sm:inline ${s <= current ? "text-[#1a1a1a]" : "text-[#888]"}`}>
            {s === 1 ? "Assignment Details" : "Generate"}
          </span>
          {s === 1 && <div className="w-8 h-px bg-[#d4d4d4] mx-1" />}
        </div>
      ))}
    </div>
  );
}

function GeneratingOverlay({ status }: { status: string }) {
  const messages: Record<string, string> = {
    pending: "Queuing your assignment...",
    processing: "Generating your question paper with AI...",
  };
  return (
    <div className="fixed inset-0 z-50 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center">
      <div className="relative mb-6">
        <div className="w-16 h-16 rounded-full border-4 border-[#e5e5e5] border-t-accent animate-spin" />
      </div>
      <h2 className="text-lg font-semibold text-[#1a1a1a] mb-2">{messages[status] ?? "Processing..."}</h2>
      <p className="text-sm text-[#888] max-w-xs text-center">This usually takes 15–30 seconds. Please don&apos;t close this page.</p>
    </div>
  );
}

export default function CreateAssignmentPage() {
  const router = useRouter();
  const store = useCreateStore();
  const socketCleanup = useRef<(() => void) | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    store.reset();
    return () => {
      socketCleanup.current?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const goToStep2 = () => {
    const errs = validate(useCreateStore.getState());
    if (Object.keys(errs).length > 0) {
      store.setErrors(errs);
      return;
    }
    store.setStep(2);
    handleSubmit();
  };

  const handleSubmit = async () => {
    const s = useCreateStore.getState();
    store.setJobStatus("pending");
    setSubmitError(null);

    try {
      const fd = new FormData();
      fd.append("title", s.form.title.trim());
      fd.append("subject", s.form.subject.trim());
      fd.append("grade", s.form.grade.trim());
      fd.append("dueDate", new Date(s.form.dueDate).toISOString());
      fd.append("additionalInstructions", s.form.additionalInstructions);
      fd.append("questionTypes", JSON.stringify(s.questionTypes));
      if (s.form.materialFile) fd.append("material", s.form.materialFile);

      const res = await api.post<{ assignmentId: string; jobId: string }>(
        "/api/assignments",
        fd,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      const { assignmentId } = res.data;
      store.setAssignmentId(assignmentId);

      connectSocket();
      const socket = getSocket();
      socket.emit("join:assignment", assignmentId);

      const onProcessing = () => store.setJobStatus("processing");
      const onCompleted = (data: { questionPaper: QuestionPaperOutput }) => {
        store.setResult(data.questionPaper);
        cleanup();
        router.push(`/assignments/${assignmentId}/output`);
      };
      const onFailed = (data: { error: string }) => {
        store.setJobStatus("failed");
        setSubmitError(data.error || "Generation failed. Please try again.");
        cleanup();
      };

      socket.on("job:processing", onProcessing);
      socket.on("job:completed", onCompleted);
      socket.on("job:failed", onFailed);

      const cleanup = () => {
        socket.off("job:processing", onProcessing);
        socket.off("job:completed", onCompleted);
        socket.off("job:failed", onFailed);
        socket.emit("leave:assignment", assignmentId);
      };
      socketCleanup.current = cleanup;
    } catch (err: unknown) {
      store.setJobStatus("failed");
      const msg = err instanceof Error ? err.message : "Submission failed";
      setSubmitError(msg);
    }
  };

  const totalQuestions = store.questionTypes.reduce((a, q) => a + q.count, 0);
  const totalMarks = store.questionTypes.reduce((a, q) => a + q.count * q.marks, 0);

  if (store.jobStatus === "pending" || store.jobStatus === "processing") {
    return <GeneratingOverlay status={store.jobStatus} />;
  }

  return (
    <div className="p-6 lg:p-8 max-w-3xl">
      <button onClick={() => router.push("/assignments")} className="flex items-center gap-1.5 text-sm text-[#888] hover:text-[#1a1a1a] mb-4 transition-colors">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M10 4L6 8l4 4" /></svg>
        Back to Assignments
      </button>

      <h1 className="text-2xl font-bold text-[#1a1a1a] mb-1">Create Assignment</h1>
      <p className="text-sm text-[#888] mb-6">Fill in the details and let AI generate a question paper for you.</p>

      <ProgressSteps current={store.step} />

      {store.jobStatus === "failed" && submitError && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#dc2626" strokeWidth="1.5" strokeLinecap="round"><circle cx="10" cy="10" r="8" /><path d="M10 6v5M10 13.5v.5" /></svg>
          <div>
            <p className="text-sm font-medium text-red-700">Generation failed</p>
            <p className="text-xs text-red-600 mt-0.5">{submitError}</p>
          </div>
          <button onClick={() => { store.setJobStatus("idle"); store.setStep(1); }} className="ml-auto text-xs text-red-500 hover:text-red-700 font-medium">Try Again</button>
        </div>
      )}

      {store.step === 1 && (
        <div className="space-y-6">
          <Field label="Assignment Title" error={store.errors.title}>
            <input type="text" placeholder="e.g. Mid-Term Physics Paper" value={store.form.title} onChange={(e) => store.setField("title", e.target.value)} className={inputCls(store.errors.title)} />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Subject" error={store.errors.subject}>
              <input type="text" placeholder="e.g. Physics" value={store.form.subject} onChange={(e) => store.setField("subject", e.target.value)} className={inputCls(store.errors.subject)} />
            </Field>
            <Field label="Grade / Class" error={store.errors.grade}>
              <input type="text" placeholder="e.g. 10th" value={store.form.grade} onChange={(e) => store.setField("grade", e.target.value)} className={inputCls(store.errors.grade)} />
            </Field>
          </div>

          <Field label="Due Date" error={store.errors.dueDate}>
            <input type="date" value={store.form.dueDate} onChange={(e) => store.setField("dueDate", e.target.value)} className={inputCls(store.errors.dueDate)} />
          </Field>

          <Field label="Reference Material (Optional)">
            <FileDropZone file={store.form.materialFile} onFile={(f) => store.setField("materialFile", f)} />
          </Field>

          <div>
            <label className="block text-sm font-medium text-[#1a1a1a] mb-2">Question Types</label>
            {store.errors.questionTypes && <p className="text-xs text-red-500 mb-2">{store.errors.questionTypes}</p>}

            <div className="bg-white border border-[#e5e5e5] rounded-lg overflow-hidden">
              <div className="grid grid-cols-[1fr_40px_100px_100px] sm:grid-cols-[1fr_40px_120px_120px] gap-2 px-4 py-2.5 bg-[#fafafa] border-b border-[#e5e5e5] text-xs font-semibold text-[#888] uppercase tracking-wider">
                <span>Type</span>
                <span />
                <span className="text-center">Questions</span>
                <span className="text-center">Marks Each</span>
              </div>

              {store.questionTypes.map((qt, i) => (
                <div key={i} className="grid grid-cols-[1fr_40px_100px_100px] sm:grid-cols-[1fr_40px_120px_120px] gap-2 px-4 py-3 border-b border-[#f0f0f0] last:border-b-0 items-center">
                  <select
                    value={qt.type}
                    onChange={(e) => store.updateQuestionType(i, "type", e.target.value as QuestionTypeEnum)}
                    className="text-sm bg-transparent border border-[#e5e5e5] rounded-lg px-2 py-1.5 text-[#1a1a1a] focus:outline-none focus:ring-2 focus:ring-accent/30"
                  >
                    {Q_TYPE_OPTIONS.map((t) => (
                      <option key={t} value={t}>{Q_TYPE_LABELS[t]}</option>
                    ))}
                  </select>

                  <button type="button" onClick={() => store.removeQuestionType(i)} className="w-7 h-7 rounded-md flex items-center justify-center text-[#ccc] hover:text-red-500 hover:bg-red-50 transition-colors mx-auto">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M4 4l6 6M10 4l-6 6" /></svg>
                  </button>

                  <Stepper value={qt.count} onChange={(v) => store.updateQuestionType(i, "count", v)} error={store.errors[`qt_count_${i}`]} />
                  <Stepper value={qt.marks} onChange={(v) => store.updateQuestionType(i, "marks", v)} error={store.errors[`qt_marks_${i}`]} />
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between mt-3">
              <button type="button" onClick={store.addQuestionType} className="flex items-center gap-1.5 text-sm font-medium text-accent hover:text-accent/80 transition-colors">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M7 2v10M2 7h10" /></svg>
                Add Question Type
              </button>
              <div className="text-sm text-[#888]">
                Total: <span className="font-semibold text-[#1a1a1a]">{totalQuestions}</span> questions · <span className="font-semibold text-[#1a1a1a]">{totalMarks}</span> marks
              </div>
            </div>
          </div>

          <Field label="Additional Instructions (Optional)">
            <div className="relative">
              <textarea
                rows={3}
                placeholder="e.g. Generate a question paper for 5 hour exam duration..."
                value={store.form.additionalInstructions}
                onChange={(e) => store.setField("additionalInstructions", e.target.value)}
                className="w-full text-sm border border-[#e5e5e5] rounded-lg px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all placeholder:text-[#aaa] resize-none"
              />
              <svg className="absolute right-3 top-3 text-[#ccc]" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M8 14c3.3 0 6-2.7 6-6S11.3 2 8 2 2 4.7 2 8c0 1.2.4 2.3 1 3.2L2 14l2.8-1c.9.6 2 1 3.2 1z" /><path d="M6 7v2M8 6v3M10 8v1" /></svg>
            </div>
          </Field>

          <div className="flex items-center justify-between pt-4 border-t border-[#e5e5e5]">
            <button type="button" onClick={() => router.push("/assignments")} className="px-5 py-2.5 text-sm font-medium text-[#888] hover:text-[#1a1a1a] transition-colors">
              Cancel
            </button>
            <button type="button" onClick={goToStep2} className="px-6 py-2.5 text-sm font-semibold text-white bg-accent hover:bg-accent/90 rounded-lg transition-all hover:shadow-lg hover:shadow-accent/25 active:scale-[0.98]">
              Generate with AI →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-[#1a1a1a] mb-1.5">{label}</label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

function inputCls(error?: string): string {
  return `w-full text-sm border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 transition-all placeholder:text-[#aaa] ${
    error
      ? "border-red-300 focus:ring-red-200 focus:border-red-400"
      : "border-[#e5e5e5] focus:ring-accent/30 focus:border-accent"
  }`;
}

