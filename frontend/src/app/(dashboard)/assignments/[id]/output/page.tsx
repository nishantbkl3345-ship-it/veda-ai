"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { QuestionPaperDisplay } from "@/components/output/QuestionPaperDisplay";
import type { QuestionPaperOutput } from "@/store/assignmentStore";
import { useState } from "react";

interface AssignmentDetail {
  _id: string;
  title: string;
  subject: string;
  grade: string;
  status: string;
}

interface FetchResponse {
  assignment: AssignmentDetail;
  questionPaper: QuestionPaperOutput | null;
}

export default function OutputPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [downloading, setDownloading] = useState(false);

  const { data, isLoading, isError } = useQuery<FetchResponse>({
    queryKey: ["assignment", params.id],
    queryFn: async () => {
      const res = await api.get<FetchResponse>(`/api/assignments/${params.id}`);
      return res.data;
    },
    enabled: !!params.id,
  });

  const handleDownload = async () => {
    if (!data?.questionPaper || downloading) return;
    setDownloading(true);
    try {
      const { downloadPdf } = await import("@/lib/generatePdf");
      await downloadPdf(data.questionPaper);
    } catch (err) {
      console.error("PDF download failed:", err);
    } finally {
      setDownloading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8 max-w-4xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-[#e5e5e5] rounded-lg" />
          <div className="h-[600px] bg-[#e5e5e5] rounded-lg" />
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="p-6 lg:p-8 max-w-4xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-700 font-medium mb-2">Failed to load assignment</p>
          <p className="text-red-600 text-sm">Please check the URL and try again.</p>
        </div>
      </div>
    );
  }

  if (!data.questionPaper) {
    return (
      <div className="p-6 lg:p-8 max-w-4xl mx-auto">
        <button
          onClick={() => router.push("/assignments")}
          className="flex items-center gap-1.5 text-sm text-[#888] hover:text-[#1a1a1a] mb-6 transition-colors"
        >
          <BackArrow />
          Back to Assignments
        </button>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-8 text-center">
          <p className="text-amber-800 font-medium mb-1">Paper not ready</p>
          <p className="text-amber-700 text-sm">
            This assignment is still being processed. Check back shortly.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="sticky top-0 z-20 bg-[#f8f8f8]/95 backdrop-blur-sm pb-4 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 pt-2">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push("/assignments")}
              className="w-9 h-9 rounded-lg flex items-center justify-center text-[#888] hover:text-[#1a1a1a] hover:bg-white border border-transparent hover:border-[#e5e5e5] transition-all"
              aria-label="Back"
            >
              <BackArrow />
            </button>
            <button
              onClick={() => router.push("/assignments/create")}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-[#555] hover:text-[#1a1a1a] hover:bg-white border border-transparent hover:border-[#e5e5e5] rounded-lg transition-all"
            >
              <PlusIcon />
              <span>Create New</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push("/assignments/create")}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-[#555] border border-[#e5e5e5] rounded-lg hover:bg-white transition-all"
            >
              <RefreshIcon />
              <span className="hidden sm:inline">Regenerate</span>
            </button>

            <button
              onClick={handleDownload}
              disabled={downloading}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-accent hover:bg-accent/90 rounded-lg transition-all hover:shadow-lg hover:shadow-accent/25 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {downloading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <DownloadIcon />
              )}
              <span className="hidden sm:inline">
                {downloading ? "Generating..." : "Download as PDF"}
              </span>
            </button>
          </div>
        </div>
      </div>

      <QuestionPaperDisplay paper={data.questionPaper} />
    </div>
  );
}

function BackArrow() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M10 4L6 8l4 4" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M7 2v10M2 7h10" />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M1 7a6 6 0 0111.2-3M13 7A6 6 0 011.8 10" />
      <path d="M12.2 1v3h-3M1.8 13v-3h3" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M7 2v8M4 7l3 3 3-3M2 12h10" />
    </svg>
  );
}
