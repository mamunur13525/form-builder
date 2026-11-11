import type { CSSProperties } from "react"
import { Star } from "lucide-react"
import type { Form, FormPage, FormQuestion, PageType } from "@/shared/types/common"
import type { ResponseSummaryPage } from "@/entities/response/model/types"
import { PAGE_TYPE_ICONS, PAGE_TYPE_VISUALS } from "@/shared/constants/form-types"
import { cn } from "@/lib/utils"
import { npsGroups, percent, plural, tally, type NpsSummary } from "./summaryMath"

type QuestionSource = FormPage | FormQuestion

const CHOICE_TYPES = new Set<PageType>([
    "radio",
    "select",
    "dropdown",
    "checkbox",
    "multiSelect",
    "yesNo",
])

/** Answers are stored under the page key or the question key — accept both. */
function findSource(form: Form | null, key: string): QuestionSource | null {
    for (const page of form?.pages ?? []) {
        if (page.pageKey === key) return page
        const question = [...(page.questions ?? []), ...(page.blocks ?? [])].find(
            (item) => (item.questionKey ?? item.blockKey) === key,
        )
        if (question) return question
    }
    return null
}

function tileStyle(type: PageType): CSSProperties {
    const hex = PAGE_TYPE_VISUALS[type]?.bgColor.match(/#[0-9a-fA-F]{6}/)?.[0]
    return hex ? { backgroundColor: `${hex}22`, color: hex } : {}
}

function formatAverage(average: number): string {
    return Number.isInteger(average) ? String(average) : average.toFixed(1)
}

interface SummaryBreakdownProps {
    form: Form | null
    page: ResponseSummaryPage
    totalResponses: number
}

/** One question card in the report, matching the summary design. */
export function SummaryBreakdown({ form, page, totalResponses }: SummaryBreakdownProps) {
    const source = findSource(form, page.pageKey)
    const type = (source?.type ?? page.type) as PageType
    const title = source?.title || source?.label || page.label
    const Icon = PAGE_TYPE_ICONS[type]
    const values = page.values ?? []
    const counts = tally(values)
    const answered = page.answerCount ?? 0
    const isMultiple = type === "checkbox" || type === "multiSelect"

    const numeric = values
        .flatMap((value) => (Array.isArray(value) ? value : [value]))
        .map((value) => Number(value))
        .filter((value) => Number.isFinite(value))
    const average = numeric.length
        ? numeric.reduce((sum, value) => sum + value, 0) / numeric.length
        : null

    const rating = source?.settings?.rating ?? { style: "star" as const, max: 5 }
    const scale = source?.settings?.opinionScale ?? {
        min: 0,
        max: 10,
        leftLabel: "Not likely",
        rightLabel: "Highly likely",
    }
    const isNps = type === "opinionScale" && scale.min === 0 && scale.max === 10
    const nps = isNps ? npsGroups(counts, answered) : null

    return (
        <article className="summary-card rounded-xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)] sm:p-7 dark:border-zinc-800 dark:bg-[#18181c]">
            <header className="flex flex-wrap items-start gap-3">
                <span
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                    style={tileStyle(type)}
                >
                    {Icon && <Icon className="h-4 w-4" />}
                </span>
                <div className="min-w-0 flex-1">
                    <h3 className="text-base leading-6 font-semibold text-slate-900 dark:text-zinc-100">
                        {title}
                    </h3>
                    <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">
                        {answered} out of {totalResponses} people answered this question
                        {isMultiple && " (and selected more than one option)"}
                    </p>
                </div>
                {isNps && nps ? (
                    <span className="text-sm text-slate-600 dark:text-zinc-300">
                        NPS Score: {nps.score}
                    </span>
                ) : (
                    (type === "rating" || type === "opinionScale") &&
                    average !== null && (
                        <span className="text-sm text-slate-600 dark:text-zinc-300">
                            Average: {formatAverage(average)}
                        </span>
                    )
                )}
            </header>

            <div className="mt-6">
                {CHOICE_TYPES.has(type) && (
                    <ChoiceBreakdown
                        type={type}
                        source={source}
                        counts={counts}
                        answered={answered}
                    />
                )}

                {type === "rating" &&
                    (rating.style === "star" ? (
                        <StarBreakdown
                            max={rating.max}
                            counts={counts}
                            answered={answered}
                        />
                    ) : (
                        <ScaleBreakdown
                            numbers={Array.from({ length: rating.max }, (_, i) => i + 1)}
                            counts={counts}
                            answered={answered}
                            leftLabel="Low"
                            rightLabel="High"
                        />
                    ))}

                {type === "opinionScale" && (
                    <ScaleBreakdown
                        numbers={Array.from(
                            { length: Math.max(scale.max - scale.min + 1, 0) },
                            (_, i) => scale.min + i,
                        )}
                        counts={counts}
                        answered={answered}
                        leftLabel={scale.leftLabel}
                        rightLabel={scale.rightLabel}
                        nps={nps}
                    />
                )}
            </div>
        </article>
    )
}

function ChoiceBreakdown({
    type,
    source,
    counts,
    answered,
}: {
    type: PageType
    source: QuestionSource | null
    counts: Map<string, number>
    answered: number
}) {
    const options = source?.options ?? []
    const rows =
        type === "yesNo"
            ? ["Yes", "No"].map((label) => ({
                  key: label,
                  label,
                  count: counts.get(label) ?? 0,
              }))
            : options.map((option) => ({
                  key: option.value,
                  label: option.label || option.value,
                  count: counts.get(option.value) ?? 0,
              }))

    // Answers that don't match a configured option (e.g. "Other" text).
    for (const [key, count] of counts) {
        if (!rows.some((row) => row.key === key)) rows.push({ key, label: key, count })
    }

    return (
        <div
            className={cn(
                "space-y-5",
                rows.length > 6 && "max-h-80 overflow-y-auto pr-1",
            )}
        >
            {rows.map((row) => {
                const pct = percent(row.count, answered)
                return (
                    <div key={row.key}>
                        <div className="flex items-center justify-between gap-4 text-sm">
                            <span className="truncate text-slate-700 dark:text-zinc-300">
                                {row.label}
                            </span>
                            <span className="shrink-0 tabular-nums text-slate-500 dark:text-zinc-400">
                                {row.count} {plural(row.count)} • {pct.toFixed(0)}%
                            </span>
                        </div>
                        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-zinc-800">
                            <div
                                className="h-full rounded-full bg-slate-700 dark:bg-zinc-400"
                                style={{ width: `${pct}%` }}
                            />
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

function StarBreakdown({
    max,
    counts,
    answered,
}: {
    max: number
    counts: Map<string, number>
    answered: number
}) {
    const stars = Array.from({ length: max }, (_, i) => max - i)

    return (
        <div className="space-y-4">
            {stars.map((value) => {
                const count = counts.get(String(value)) ?? 0
                const pct = percent(count, answered)
                return (
                    <div key={value}>
                        <div className="flex items-center justify-between gap-4">
                            <span className="flex items-center gap-0.5 text-amber-400">
                                {Array.from({ length: value }, (_, i) => (
                                    <Star key={i} className="h-4 w-4 fill-current" />
                                ))}
                            </span>
                            <span className="shrink-0 text-sm tabular-nums text-slate-500 dark:text-zinc-400">
                                {count} {plural(count)}
                                <span className="ml-3 inline-block w-9 text-right">
                                    {pct.toFixed(0)}%
                                </span>
                            </span>
                        </div>
                        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-zinc-800">
                            <div
                                className="h-full rounded-full bg-amber-400"
                                style={{ width: `${pct}%` }}
                            />
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

function ScaleBreakdown({
    numbers,
    counts,
    answered,
    leftLabel,
    rightLabel,
    nps,
}: {
    numbers: number[]
    counts: Map<string, number>
    answered: number
    leftLabel: string
    rightLabel: string
    nps?: NpsSummary | null
}) {
    const barColor = (value: number, count: number): string | undefined => {
        if (count === 0) return undefined
        if (!nps) return "#3b82f6"
        if (value <= 6) return "#ef4444"
        if (value <= 8) return "#f59e0b"
        return "#10b981"
    }

    return (
        <div className="space-y-4">
            {nps && (
                <div className="grid grid-cols-3 gap-3 sm:gap-4">
                    {nps.groups.map((group) => (
                        <div
                            key={group.label}
                            className={cn("rounded-lg px-3 py-4 text-center", group.boxClass)}
                        >
                            <p className={cn("text-2xl font-semibold", group.textClass)}>
                                {group.pct}%
                            </p>
                            <p className={cn("mt-1 text-sm", group.textClass)}>{group.label}</p>
                            <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">
                                {group.count} respondents
                            </p>
                        </div>
                    ))}
                </div>
            )}

            <div
                className="grid gap-1"
                style={{ gridTemplateColumns: `repeat(${numbers.length}, minmax(0, 1fr))` }}
            >
                {numbers.map((value) => {
                    const count = counts.get(String(value)) ?? 0
                    const pct = percent(count, answered)
                    return (
                        <div key={value} className="min-w-0 text-center">
                            <p className="text-xs tabular-nums text-slate-600 dark:text-zinc-300">
                                {count}
                            </p>
                            <p className="text-xs tabular-nums text-slate-400 dark:text-zinc-500">
                                {pct.toFixed(0)}%
                            </p>
                            <div
                                className={cn(
                                    "mx-auto mt-2 h-16 w-full max-w-12 rounded-md sm:h-20",
                                    count === 0 && "bg-slate-200 dark:bg-zinc-800",
                                )}
                                style={{ backgroundColor: barColor(value, count) }}
                            />
                            <p className="mt-2 text-sm text-slate-700 dark:text-zinc-300">
                                {value}
                            </p>
                        </div>
                    )
                })}
            </div>

            <div className="flex items-center justify-between text-sm text-slate-500 dark:text-zinc-400">
                <span>{leftLabel}</span>
                <span>{rightLabel}</span>
            </div>

            {nps && (
                <div className="flex flex-wrap items-center justify-center gap-4 pt-1 text-xs text-slate-500 dark:text-zinc-400">
                    {nps.groups.map((group) => (
                        <span key={group.label} className="flex items-center gap-1.5">
                            <span className={cn("h-2.5 w-2.5 rounded-full", group.dotClass)} />
                            {group.label} ({group.range})
                        </span>
                    ))}
                </div>
            )}
        </div>
    )
}
