interface EmptyStateProps {
  onCreateAssignment?: () => void;
}

export function EmptyState({ onCreateAssignment }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      {/* ── Illustration ──────────────────────────── */}
      <div className="mb-6">
        <svg
          width="120"
          height="120"
          viewBox="0 0 120 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-[#d4d4d4]"
        >
          {/* Document body */}
          <rect
            x="28"
            y="12"
            width="64"
            height="84"
            rx="6"
            fill="#f5f5f5"
            stroke="currentColor"
            strokeWidth="2"
          />
          {/* Fold corner */}
          <path
            d="M72 12v16a4 4 0 004 4h16"
            stroke="currentColor"
            strokeWidth="2"
            fill="#e5e5e5"
          />
          {/* Text lines */}
          <rect x="40" y="44" width="40" height="3" rx="1.5" fill="#d4d4d4" />
          <rect x="40" y="52" width="32" height="3" rx="1.5" fill="#d4d4d4" />
          <rect x="40" y="60" width="36" height="3" rx="1.5" fill="#d4d4d4" />
          <rect x="40" y="68" width="24" height="3" rx="1.5" fill="#d4d4d4" />
          {/* X mark */}
          <circle cx="60" cy="86" r="10" fill="#fee2e2" />
          <path
            d="M55 81l10 10M65 81l-10 10"
            stroke="#ef4444"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* ── Text ──────────────────────────────────── */}
      <h3 className="text-lg font-semibold text-[#1a1a1a] mb-2">
        No assignments yet
      </h3>
      <p className="text-sm text-[#888888] max-w-sm mb-8 leading-relaxed">
        Create your first assignment to start collecting and grading student
        submissions. Our AI will help you generate comprehensive question papers
        in seconds.
      </p>

      {/* ── CTA Button ────────────────────────────── */}
      <button
        onClick={onCreateAssignment}
        className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white text-sm font-semibold py-3 px-6 rounded-full transition-all duration-200 hover:shadow-lg hover:shadow-primary/20 active:scale-[0.98]"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <path d="M8 3v10M3 8h10" />
        </svg>
        Create Your First Assignment
      </button>
    </div>
  );
}
