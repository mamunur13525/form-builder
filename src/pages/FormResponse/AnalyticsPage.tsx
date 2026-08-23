import { useParams } from "react-router-dom"
import { motion } from "motion/react"
import { Card, CardContent } from "@/components/ui/card"
import { useForm } from "@/features/forms/hooks/useForms"
import { useResponseStats } from "@/features/forms/hooks/useFormResponses"
import { adaptApiForm } from "@/features/forms/model/adapters"
import type { Form as CommonForm } from "@/shared/types/common"
import { ResponsePageShell } from "./components/ResponsePageShell"
import { ResponseStateCard } from "./components/ResponseStateCard"

/** Format a duration in seconds as `45s` or `2m 5s`. */
function formatDuration(seconds: number): string {
    if (!Number.isFinite(seconds) || seconds <= 0) return "0s"
    const rounded = Math.round(seconds)
    if (rounded < 60) return `${rounded}s`
    const minutes = Math.floor(rounded / 60)
    const remainder = rounded % 60
    return remainder ? `${minutes}m ${remainder}s` : `${minutes}m`
}

/** Trim trailing zeros from a percentage (85.5 -> "85.5", 85 -> "85"). */
function formatPercent(value: number): string {
    if (!Number.isFinite(value)) return "0"
    return `${Number(value.toFixed(1))}`
}

export function AnalyticsPage() {
    // The route is /form-response/:formId/analytics — the param is `formId`, not `id`.
    const { formId } = useParams<{ formId: string }>()

    const {
        data: apiForm,
        isLoading: formLoading,
        isError: formError,
    } = useForm(formId || "")
    const {
        data: stats,
        isLoading: statsLoading,
        isError: statsError,
    } = useResponseStats(formId || "")

    const form: CommonForm | null = apiForm ? adaptApiForm(apiForm) : null
    const isLoading = formLoading || statsLoading

    const totalResponses = stats?.totalResponses ?? 0
    const uniqueRespondents = stats?.uniqueRespondents ?? 0
    const todayResponses = stats?.todayResponses ?? 0
    const avgCompletionTime = stats?.averageCompletionTime ?? 0
    const completionRate = stats?.completionRate ?? 0

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
            activeTab="analytics"
        >
            {isLoading ? (
                <ResponseStateCard loading message="Loading analytics..." />
            ) : formError || statsError ? (
                <ResponseStateCard message="Could not load analytics. Please try again." />
            ) : totalResponses === 0 ? (
                <ResponseStateCard message="No data available yet. Share your form to start collecting responses." />
            ) : (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4 sm:space-y-6"
                >
                    {/* Overview Stats — 2-up on phones so the four numbers stay scannable. */}
                    <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-4">
                        <Card className="editorial-shadow-sm rounded-xl border-[var(--border)] bg-[var(--card)] p-4 sm:p-6">
                            <CardContent className="p-0">
                                <div className="space-y-3">
                                    <p className="editorial-eyebrow text-[var(--editorial-subtle)]">
                                        Total Responses
                                    </p>
                                    <p className="font-display text-[28px] leading-none text-[var(--foreground)] sm:text-[40px]">
                                        {totalResponses}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="editorial-shadow-sm rounded-xl border-[var(--border)] bg-[var(--card)] p-4 sm:p-6">
                            <CardContent className="p-0">
                                <div className="space-y-3">
                                    <p className="editorial-eyebrow text-[var(--editorial-subtle)]">
                                        Unique Respondents
                                    </p>
                                    <p className="font-display text-[28px] leading-none text-[var(--foreground)] sm:text-[40px]">
                                        {uniqueRespondents}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="editorial-shadow-sm rounded-xl border-[var(--border)] bg-[var(--card)] p-4 sm:p-6">
                            <CardContent className="p-0">
                                <div className="space-y-3">
                                    <p className="editorial-eyebrow text-[var(--editorial-subtle)]">
                                        Today's Responses
                                    </p>
                                    <p className="font-display text-[28px] leading-none text-[var(--foreground)] sm:text-[40px]">
                                        {todayResponses}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="editorial-shadow-sm rounded-xl border-[var(--border)] bg-[var(--card)] p-4 sm:p-6">
                            <CardContent className="p-0">
                                <div className="space-y-3">
                                    <p className="editorial-eyebrow text-[var(--editorial-subtle)]">
                                        Completion Rate
                                    </p>
                                    <p className="font-display text-[28px] leading-none text-[var(--foreground)] sm:text-[40px]">
                                        {formatPercent(completionRate)}%
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Additional Stats */}
                    <div className="grid grid-cols-2 gap-4 sm:gap-6">
                        <Card className="editorial-shadow-sm rounded-xl border-[var(--border)] bg-[var(--card)] p-4 sm:p-6">
                            <CardContent className="p-0">
                                <div className="space-y-3">
                                    <p className="editorial-eyebrow text-[var(--editorial-subtle)]">
                                        Avg. Completion Time
                                    </p>
                                    <p className="font-display text-[24px] leading-none text-[var(--foreground)] sm:text-[32px]">
                                        {formatDuration(avgCompletionTime)}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="editorial-shadow-sm rounded-xl border-[var(--border)] bg-[var(--card)] p-4 sm:p-6">
                            <CardContent className="p-0">
                                <div className="space-y-3">
                                    <p className="editorial-eyebrow text-[var(--editorial-subtle)]">
                                        Total Pages
                                    </p>
                                    <p className="font-display text-[24px] leading-none text-[var(--foreground)] sm:text-[32px]">
                                        {form?.pages.length ?? 0}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </motion.div>
            )}
        </ResponsePageShell>
    )
}
