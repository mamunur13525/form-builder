import { useParams } from "react-router-dom"
import { motion } from "motion/react"
import { Card, CardContent } from "@/components/ui/card"
import { useForm } from "@/features/forms/hooks/useForms"
import { useResponseSummary } from "@/features/forms/hooks/useFormResponses"
import { adaptApiForm } from "@/features/forms/model/adapters"
import type { Form as CommonForm } from "@/shared/types/common"
import { ResponsePageShell } from "./components/ResponsePageShell"
import { ResponseStateCard } from "./components/ResponseStateCard"

export function SummaryPage() {
    // The route is /form-response/:formId/summary — the param is `formId`, not `id`.
    const { formId } = useParams<{ formId: string }>()

    const {
        data: apiForm,
        isLoading: formLoading,
        isError: formError,
    } = useForm(formId || "")
    const {
        data: summaryData,
        isLoading: summaryLoading,
        isError: summaryError,
    } = useResponseSummary(formId || "")

    const form: CommonForm | null = apiForm ? adaptApiForm(apiForm) : null
    const isLoading = formLoading || summaryLoading

    const totalResponses = summaryData?.totalResponses ?? 0
    const pages = summaryData?.pages ?? []
    const uniqueAnswers = pages.reduce((acc, page) => acc + page.uniqueAnswers, 0)

    // Only claim the form is missing once loading has finished.
    if (!formId || (!isLoading && !form)) {
        return (
            <div className="editorial px-4 py-20 text-center sm:py-32">
                <h2 className="font-display text-3xl leading-tight text-[var(--foreground)] sm:text-[40px]">
                    Form not found
                </h2>
            </div>
        )
    }

    return (
        <ResponsePageShell
            activeTab="summary"
        >
            {isLoading ? (
                <ResponseStateCard loading message="Loading summary..." />
            ) : formError || summaryError ? (
                <ResponseStateCard message="Could not load summary. Please try again." />
            ) : totalResponses === 0 ? (
                <ResponseStateCard message="No responses yet" />
            ) : (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-8 sm:space-y-12"
                >
                    <div className="grid gap-4 sm:grid-cols-3 sm:gap-6">
                        <Card className="editorial-shadow-sm rounded-xl border-[var(--border)] bg-[var(--card)] p-5 sm:p-6">
                            <CardContent className="p-0">
                                <div className="space-y-3">
                                    <p className="editorial-eyebrow text-[var(--editorial-subtle)]">
                                        Total Responses
                                    </p>
                                    <p className="font-display text-[32px] leading-none text-[var(--foreground)] sm:text-[40px]">
                                        {totalResponses}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="editorial-shadow-sm rounded-xl border-[var(--border)] bg-[var(--card)] p-5 sm:p-6">
                            <CardContent className="p-0">
                                <div className="space-y-3">
                                    <p className="editorial-eyebrow text-[var(--editorial-subtle)]">
                                        Total Pages
                                    </p>
                                    <p className="font-display text-[32px] leading-none text-[var(--foreground)] sm:text-[40px]">
                                        {form?.pages.length ?? 0}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="editorial-shadow-sm rounded-xl border-[var(--border)] bg-[var(--card)] p-5 sm:p-6">
                            <CardContent className="p-0">
                                <div className="space-y-3">
                                    <p className="editorial-eyebrow text-[var(--editorial-subtle)]">
                                        Unique Answers
                                    </p>
                                    <p className="font-display text-[32px] leading-none text-[var(--foreground)] sm:text-[40px]">
                                        {uniqueAnswers}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {pages.length > 0 && (
                        <div className="space-y-4 sm:space-y-6">
                            <h3 className="font-display text-xl text-[var(--foreground)] sm:text-2xl">
                                Response Breakdown
                            </h3>
                            <div className="grid gap-4">
                                {pages.map((page, index) => {
                                    const percentage =
                                        totalResponses > 0
                                            ? Math.min(
                                                (page.answerCount / totalResponses) * 100,
                                                100,
                                            )
                                            : 0
                                    return (
                                        <motion.div
                                            key={page.pageKey}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                        >
                                            <Card className="editorial-shadow-sm rounded-xl border-[var(--border)] bg-[var(--card)] p-5 sm:p-6">
                                                <CardContent className="p-0">
                                                    <div className="space-y-4">
                                                        <div className="flex items-start justify-between gap-3 sm:items-center sm:gap-4">
                                                            <div className="min-w-0 space-y-1">
                                                                <p className="text-sm break-words text-[var(--foreground)] sm:text-base">
                                                                    {page.label}
                                                                </p>
                                                                <p className="text-xs text-[var(--editorial-subtle)]">
                                                                    {page.type}
                                                                </p>
                                                            </div>
                                                            <div className="shrink-0 text-right">
                                                                <p className="text-sm tabular-nums text-[var(--foreground)]">
                                                                    {page.answerCount}/
                                                                    {totalResponses}
                                                                </p>
                                                                <p className="text-xs tabular-nums text-[var(--editorial-subtle)]">
                                                                    {percentage.toFixed(0)}%
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div
                                                            className="h-2 w-full rounded-full bg-[var(--muted)]"
                                                            role="progressbar"
                                                            aria-label={`${page.label} completion`}
                                                            aria-valuenow={Math.round(percentage)}
                                                            aria-valuemin={0}
                                                            aria-valuemax={100}
                                                        >
                                                            <motion.div
                                                                initial={{ width: 0 }}
                                                                animate={{ width: `${percentage}%` }}
                                                                transition={{
                                                                    duration: 0.5,
                                                                    delay: index * 0.1,
                                                                }}
                                                                className="h-2 rounded-full bg-[var(--primary)]"
                                                            />
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </motion.div>
                                    )
                                })}
                            </div>
                        </div>
                    )}
                </motion.div>
            )}
        </ResponsePageShell>
    )
}
