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
    const fields = summaryData?.fields ?? []
    const uniqueAnswers = fields.reduce((acc, field) => acc + field.uniqueAnswers, 0)

    // Only claim the form is missing once loading has finished.
    if (!formId || (!isLoading && !form)) {
        return (
            <div className="editorial py-32 text-center">
                <h2 className="font-display text-[40px] leading-tight text-[var(--foreground)]">
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
                    className="space-y-12"
                >
                    <div className="grid gap-6 md:grid-cols-3">
                        <Card className="editorial-shadow-sm rounded-xl border-[var(--border)] bg-[var(--card)] p-6">
                            <CardContent className="p-0">
                                <div className="space-y-3">
                                    <p className="editorial-eyebrow text-[var(--editorial-subtle)]">
                                        Total Responses
                                    </p>
                                    <p className="font-display text-[40px] leading-none text-[var(--foreground)]">
                                        {totalResponses}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="editorial-shadow-sm rounded-xl border-[var(--border)] bg-[var(--card)] p-6">
                            <CardContent className="p-0">
                                <div className="space-y-3">
                                    <p className="editorial-eyebrow text-[var(--editorial-subtle)]">
                                        Total Fields
                                    </p>
                                    <p className="font-display text-[40px] leading-none text-[var(--foreground)]">
                                        {form?.fields.length ?? 0}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="editorial-shadow-sm rounded-xl border-[var(--border)] bg-[var(--card)] p-6">
                            <CardContent className="p-0">
                                <div className="space-y-3">
                                    <p className="editorial-eyebrow text-[var(--editorial-subtle)]">
                                        Unique Answers
                                    </p>
                                    <p className="font-display text-[40px] leading-none text-[var(--foreground)]">
                                        {uniqueAnswers}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {fields.length > 0 && (
                        <div className="space-y-6">
                            <h3 className="font-display text-2xl text-[var(--foreground)]">
                                Response Breakdown
                            </h3>
                            <div className="grid gap-4">
                                {fields.map((field, index) => {
                                    const percentage =
                                        totalResponses > 0
                                            ? Math.min(
                                                (field.answerCount / totalResponses) * 100,
                                                100,
                                            )
                                            : 0
                                    return (
                                        <motion.div
                                            key={field.fieldKey}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                        >
                                            <Card className="editorial-shadow-sm rounded-[18px] border-[var(--border)] bg-[var(--card)] p-6">
                                                <CardContent className="p-0">
                                                    <div className="space-y-4">
                                                        <div className="flex items-center justify-between gap-4">
                                                            <div className="space-y-1">
                                                                <p className="text-base text-[var(--foreground)]">
                                                                    {field.label}
                                                                </p>
                                                                <p className="text-xs text-[var(--editorial-subtle)]">
                                                                    {field.type}
                                                                </p>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="text-sm tabular-nums text-[var(--foreground)]">
                                                                    {field.answerCount}/
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
                                                            aria-label={`${field.label} completion`}
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
