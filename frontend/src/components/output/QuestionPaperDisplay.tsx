import type {
  QuestionPaperOutput,
  QuestionPaperSection,
} from "@/store/assignmentStore";

const BADGE_STYLES: Record<string, string> = {
  Easy: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Moderate: "bg-amber-50 text-amber-700 border-amber-200",
  Hard: "bg-red-50 text-red-700 border-red-200",
};

function DifficultyBadge({ level }: { level: string }) {
  return (
    <span
      className={`inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded-full border whitespace-nowrap ${
        BADGE_STYLES[level] ?? BADGE_STYLES.Easy
      }`}
    >
      {level}
    </span>
  );
}

function sectionLabel(index: number): string {
  return String.fromCharCode(65 + index);
}

interface QuestionPaperDisplayProps {
  paper: QuestionPaperOutput;
}

export function QuestionPaperDisplay({ paper }: QuestionPaperDisplayProps) {
  let globalQ = 0;

  return (
    <div className="bg-white border border-[#e5e5e5] rounded-lg shadow-sm max-w-3xl mx-auto">
      <div className="p-6 sm:p-10">
        <div className="text-center mb-6">
          <h1 className="text-lg sm:text-xl font-bold text-[#1a1a1a] mb-1">
            {paper.schoolName}
          </h1>
          <p className="text-sm text-[#555]">
            Subject: <span className="font-medium">{paper.subject}</span>
            &nbsp;&nbsp;|&nbsp;&nbsp;
            Class: <span className="font-medium">{paper.grade}</span>
          </p>
        </div>

        <hr className="border-[#1a1a1a] mb-4" />

        <div className="flex items-center justify-between text-sm text-[#1a1a1a] mb-3">
          <span>
            Time Allowed:{" "}
            <span className="font-semibold">{paper.timeAllowed}</span>
          </span>
          <span>
            Maximum Marks:{" "}
            <span className="font-semibold">{paper.totalMarks}</span>
          </span>
        </div>

        <p className="text-xs text-[#888] italic mb-5">
          All questions are compulsory unless stated otherwise.
        </p>

        <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm text-[#555] mb-8 pb-6 border-b border-[#e5e5e5]">
          <span>
            Name: <span className="inline-block w-40 border-b border-[#aaa]" />
          </span>
          <span>
            Roll Number:{" "}
            <span className="inline-block w-24 border-b border-[#aaa]" />
          </span>
          <span>
            Class/Section:{" "}
            <span className="inline-block w-24 border-b border-[#aaa]" />
          </span>
        </div>

        {paper.sections.map((section: QuestionPaperSection, si: number) => (
          <div key={si} className="mb-8 last:mb-4">
            <h2 className="text-sm sm:text-base font-bold text-[#1a1a1a] mb-1">
              Section {sectionLabel(si)} — {section.title}
            </h2>
            {section.instruction && (
              <p className="text-xs text-[#888] italic mb-4">
                {section.instruction}
              </p>
            )}

            <ol className="space-y-3">
              {section.questions.map((q, qi) => {
                globalQ++;
                return (
                  <li key={qi} className="flex items-start gap-3 group">
                    <span className="text-sm font-semibold text-[#1a1a1a] min-w-[28px] pt-0.5">
                      {globalQ}.
                    </span>

                    <div className="flex-1 text-sm text-[#333] leading-relaxed pt-0.5">
                      {q.text}
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0 pt-0.5">
                      <DifficultyBadge level={q.difficulty} />
                      <span className="text-xs text-[#888] font-medium whitespace-nowrap">
                        [{q.marks} {q.marks === 1 ? "mark" : "marks"}]
                      </span>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        ))}

        <div className="mt-8 pt-6 border-t-2 border-[#1a1a1a]">
          <h2 className="text-sm sm:text-base font-bold text-[#1a1a1a] mb-4">
            Answer Key
          </h2>
          <ol className="space-y-2">
            {(() => {
              let ansNum = 0;
              return paper.sections.flatMap((section) =>
                section.questions.map((q, qi) => {
                  ansNum++;
                  return (
                    <li
                      key={`ans-${ansNum}`}
                      className="flex items-start gap-3 text-sm"
                    >
                      <span className="font-semibold text-[#1a1a1a] min-w-[28px]">
                        {ansNum}.
                      </span>
                      <span className="text-[#555] leading-relaxed">
                        {q.answer}
                      </span>
                    </li>
                  );
                })
              );
            })()}
        </div>
      </div>
    </div>
  );
}


