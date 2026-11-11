import { useParams } from "react-router-dom"
import { useForm } from "@/features/forms/hooks/useForms"
import { useResponseSummary } from "@/features/forms/hooks/useFormResponses"
import { adaptApiForm } from "@/features/forms/model/adapters"
import type { Form as CommonForm } from "@/shared/types/common"
import { ResponsePageShell } from "./components/ResponsePageShell"
import { ResponseStateCard } from "./components/ResponseStateCard"
import { SummaryBreakdown } from "./components/SummaryBreakdown"
import { SharingOptionsCard } from "./components/SharingOptionsCard"

/** Question types the report can break down; open-ended ones are excluded. */
const BREAKDOWN_TYPES = new Set([
    "radio",
    "select",
    "dropdown",
    "checkbox",
    "multiSelect",
    "yesNo",
    "rating",
    "opinionScale",
])

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
        refetch,
    } = useResponseSummary(formId || "")

    const form: CommonForm | null = apiForm ? adaptApiForm(apiForm) : null
    const isLoading = formLoading || summaryLoading

    const totalResponses = summaryData?.totalResponses ?? 0
    const pages = summaryData?.pages ?? []
    const breakdownPages = pages.filter((page) => BREAKDOWN_TYPES.has(page.type))

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
        <ResponsePageShell activeTab="summary">
            {isLoading ? (
                <ResponseStateCard loading message="Loading summary..." />
            ) : formError || summaryError ? (
                <ResponseStateCard message="Could not load summary. Please try again." />
            ) : totalResponses === 0 ? (
                <ResponseStateCard message="No responses yet" />
            ) : (
                <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
                    <div data-summary-report className="min-w-0 space-y-6">
                        <div className="hidden print:block">
                            <h1 className="text-xl font-semibold text-slate-900">
                                {form?.title || "Response Summary"}
                            </h1>
                            <p className="mt-1 text-sm text-slate-500">
                                {totalResponses} responses
                            </p>
                        </div>

                        {breakdownPages.map((page) => (
                            <SummaryBreakdown
                                key={page.pageKey}
                                form={form}
                                page={page}
                                totalResponses={totalResponses}
                            />
                        ))}

                        {breakdownPages.length === 0 && (
                            <p className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500 dark:border-zinc-700 dark:text-zinc-400">
                                No closed-ended questions to summarise yet.
                            </p>
                        )}

                        <div className="space-y-2 pt-2 text-sm text-slate-500 dark:text-zinc-400">
                            <p>
                                Open ended questions like short and long text input, contact
                                info, address etc. are not included in this report.
                            </p>
                            <p>
                                Finding issues with summary not being consistent with
                                submissions?{" "}
                                <button
                                    type="button"
                                    onClick={() => refetch()}
                                    className="text-blue-600 underline underline-offset-2 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                                >
                                    Click here
                                </button>{" "}
                                to generate it again.
                            </p>
                        </div>
                    </div>

                    <aside className="lg:sticky lg:top-0 lg:self-start">
                        <SharingOptionsCard formId={formId} />
                    </aside>
                </div>
            )}
        </ResponsePageShell>
    )
}
