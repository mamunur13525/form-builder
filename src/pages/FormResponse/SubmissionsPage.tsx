import { useMemo, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { motion } from "motion/react"
import { Button } from "@/components/ui/button"
import { useForm } from "@/features/forms/hooks/useForms"
import { useResponses } from "@/features/forms/hooks/useFormResponses"
import { adaptApiForm, adaptApiResponse } from "@/features/forms/model/adapters"
import { ROUTES } from "@/shared/constants/routes"
import type { Form as CommonForm } from "@/shared/types/common"
import { ResponsePageShell } from "./components/ResponsePageShell"
import { ResponseStateCard } from "./components/ResponseStateCard"
import { SubmissionsTable } from "./components/SubmissionsTable"
import { SubmissionsToolbar } from "./components/SubmissionsToolbar"
import { buildSubmissionColumns, type SubmissionLayer } from "./lib/columns"
import {
    buildResponsesCsv,
    buildResponsesJson,
    downloadTextFile,
    toSafeFileName,
} from "./lib/export"

export function SubmissionsPage() {
    // The route is /form-response/:formId/submissions — the param is `formId`, not `id`.
    const { formId } = useParams<{ formId: string }>()
    const navigate = useNavigate()

    const [layer, setLayer] = useState<SubmissionLayer>("visible")
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

    const {
        data: apiForm,
        isLoading: formLoading,
        isError: formError,
    } = useForm(formId || "")
    const {
        data: apiResponses,
        isLoading: responsesLoading,
        isError: responsesError,
    } = useResponses(formId || "")

    const form: CommonForm | null = apiForm ? adaptApiForm(apiForm) : null
    const formResponses = useMemo(
        () => (apiResponses ?? []).map(adaptApiResponse),
        [apiResponses],
    )
    const isLoading = formLoading || responsesLoading

    const columns = useMemo(() => buildSubmissionColumns(form, layer), [form, layer])
    const columnCounts = useMemo(
        () => ({
            visible: buildSubmissionColumns(form, "visible").length,
            all: buildSubmissionColumns(form, "all").length,
        }),
        [form],
    )

    const toggleRow = (id: string) => {
        if (!id) return
        setSelectedIds((current) => {
            const next = new Set(current)
            if (next.has(id)) next.delete(id)
            else next.add(id)
            return next
        })
    }

    const toggleAll = () => {
        setSelectedIds((current) =>
            current.size === formResponses.length
                ? new Set()
                : new Set(formResponses.map((response) => response._id ?? "").filter(Boolean)),
        )
    }

    const clearSelection = () => setSelectedIds(new Set())

    /** Exports the selected rows, or every row when nothing is selected. */
    const handleExport = (format: "csv" | "json") => {
        if (!form || formResponses.length === 0) return

        const rows =
            selectedIds.size > 0
                ? formResponses.filter((response) => selectedIds.has(response._id ?? ""))
                : formResponses
        if (rows.length === 0) return

        const baseName = `${toSafeFileName(form.title, "form")}-responses`
        if (format === "csv") {
            downloadTextFile(
                `${baseName}.csv`,
                buildResponsesCsv(columns, rows),
                "text/csv;charset=utf-8;",
            )
        } else {
            downloadTextFile(
                `${baseName}.json`,
                buildResponsesJson(columns, rows),
                "application/json;charset=utf-8;",
            )
        }
    }

    // Only claim the form is missing once loading has finished, otherwise the page
    // flashes "Form not found" on every visit.
    if (!formId || (!isLoading && !form)) {
        return (
            <div className="text-center py-20">
                <h2 className="text-3xl font-bold">Form not found</h2>
                <Button className="mt-4" onClick={() => navigate(ROUTES.DASHBOARD)}>
                    Back to Dashboard
                </Button>
            </div>
        )
    }

    const hasResponses = formResponses.length > 0
    const showTable = !isLoading && !formError && !responsesError && hasResponses

    return (
        <ResponsePageShell activeTab="submissions" fill>
            {isLoading ? (
                <div className="p-3">
                    <ResponseStateCard loading message="Loading submissions..." />
                </div>
            ) : formError || responsesError ? (
                <div className="p-3">
                    <ResponseStateCard message="Could not load submissions. Please try again." />
                </div>
            ) : !hasResponses ? (
                <motion.div
                    className="p-3"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                >
                    <ResponseStateCard
                        message="No responses yet"
                        action={
                            <Button
                                variant="outline"
                                onClick={() =>
                                    navigate(ROUTES.FORM_SHARE.replace(":formId", formId))
                                }
                            >
                                Share Form
                            </Button>
                        }
                    />
                </motion.div>
            ) : null}

            {showTable && (
                <>
                    <div className="border-b">
                        <SubmissionsToolbar
                            layer={layer}
                            onLayerChange={setLayer}
                            columnCounts={columnCounts}
                            selectedCount={selectedIds.size}
                            totalCount={formResponses.length}
                            onClearSelection={clearSelection}
                            onExport={handleExport}
                        />
                    </div>
                    <motion.div
                        className="min-h-0 flex-1"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <SubmissionsTable
                            columns={columns}
                            responses={formResponses}
                            selectedIds={selectedIds}
                            onToggleRow={toggleRow}
                            onToggleAll={toggleAll}
                        />
                    </motion.div>
                </>
            )}
        </ResponsePageShell>
    )
}
