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
            <div className="text-center py-20">
                <h2 className="text-3xl font-bold">Form not found</h2>
            </div>
        )
    }

    return (
        <ResponsePageShell
            activeTab="summary"
            title="Summary"
            description="Overview of your form responses"
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
                    className="space-y-4"
                >
                    <div className="grid gap-4 md:grid-cols-3">
                        <Card>
                            <CardContent className="pt-6">
                                <div className="space-y-2">
                                    <p className="text-sm font-medium text-muted-foreground">
                                        Total Responses
                                    </p>
                                    <p className="text-3xl font-bold">{totalResponses}</p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <div className="space-y-2">
                                    <p className="text-sm font-medium text-muted-foreground">
                                        Total Fields
                                    </p>
                                    <p className="text-3xl font-bold">{form?.fields.length ?? 0}</p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <div className="space-y-2">
                                    <p className="text-sm font-medium text-muted-foreground">
                                        Unique Answers
                                    </p>
                                    <p className="text-3xl font-bold">{uniqueAnswers}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {fields.length > 0 && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Response Breakdown</h3>
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
                                            <Card>
                                                <CardContent className="pt-6">
                                                    <div className="space-y-3">
                                                        <div className="flex items-center justify-between">
                                                            <div className="space-y-1">
                                                                <p className="font-medium">
                                                                    {field.label}
                                                                </p>
                                                                <p className="text-xs text-muted-foreground">
                                                                    {field.type}
                                                                </p>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="text-sm font-medium">
                                                                    {field.answerCount}/
                                                                    {totalResponses}
                                                                </p>
                                                                <p className="text-xs text-muted-foreground">
                                                                    {percentage.toFixed(0)}%
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div
                                                            className="w-full bg-secondary rounded-full h-2"
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
                                                                className="bg-primary h-2 rounded-full"
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
