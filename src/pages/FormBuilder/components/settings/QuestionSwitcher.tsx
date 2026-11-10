import { PAGE_TYPE_LABELS } from "../../../../shared/constants/form-types"
import type { FormQuestion } from "../../../../shared/types/common"
import { cn } from "@/lib/utils"

interface QuestionSwitcherProps {
    questions: FormQuestion[]
    activeIndex: number
    onSelect: (index: number, question: FormQuestion) => void
}

/** Chips for switching which nested question the settings panel edits. */
export function QuestionSwitcher({
    questions,
    activeIndex,
    onSelect,
}: QuestionSwitcherProps) {
    if (questions.length <= 1) return null

    return (
        <div className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/80 dark:bg-zinc-900/60 p-3 space-y-2">
            <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
                    Configure Question ({activeIndex + 1} of {questions.length})
                </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
                {questions.map((q, idx) => (
                    <button
                        key={q.questionKey || q.blockKey || idx}
                        type="button"
                        onClick={() => onSelect(idx, q)}
                        className={cn(
                            "px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer",
                            activeIndex === idx
                                ? "bg-[#FF5722] text-white border-[#FF5722] shadow-xs"
                                : "bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700 hover:border-slate-300 dark:hover:border-zinc-600"
                        )}
                    >
                        Q{idx + 1}
                        {q.title ? `: ${q.title.slice(0, 10)}` : ` (${PAGE_TYPE_LABELS[q.type] ?? q.type})`}
                    </button>
                ))}
            </div>
        </div>
    )
}
