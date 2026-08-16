import { useMemo, useState } from "react"
import { Plus, Search, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { useForms } from "@/features/forms/hooks/useForms"
import { FormCard } from "@/pages/Dashboard/components/FormCard"
import { FormDialog } from "@/pages/Dashboard/components/FormDialog"
import { DeleteFormDialog } from "@/pages/Dashboard/components/DeleteFormDialog"
import { DuplicateFormDialog } from "@/pages/Dashboard/components/DuplicateFormDialog"
import type { FormStatus } from "@/entities/form/model/types"
import { cn } from "@/lib/utils"

/** Status filters shown above the grid. `all` keeps every form. */
const FILTERS: { value: FormStatus | "all"; label: string }[] = [
    { value: "all", label: "All" },
    { value: "published", label: "Published" },
    { value: "draft", label: "Drafts" },
    { value: "archived", label: "Archived" },
]

export function FormsPage() {
    const { data: forms = [], isLoading } = useForms()

    const [query, setQuery] = useState("")
    const [status, setStatus] = useState<FormStatus | "all">("all")
    const [createDialogOpen, setCreateDialogOpen] = useState(false)
    const [deleteAlertOpen, setDeleteAlertOpen] = useState(false)
    const [formToDelete, setFormToDelete] = useState<string | null>(null)
    const [duplicateDialogOpen, setDuplicateDialogOpen] = useState(false)
    const [formToDuplicate, setFormToDuplicate] = useState<{ id: string; title: string } | null>(null)

    const visibleForms = useMemo(() => {
        const term = query.trim().toLowerCase()
        return forms.filter((form) => {
            const matchesStatus = status === "all" || form.status === status
            const matchesQuery = !term || form.title.toLowerCase().includes(term)
            return matchesStatus && matchesQuery
        })
    }, [forms, query, status])

    return (
        <div className="editorial mx-auto w-full max-w-[1600px] space-y-8 px-4 pt-8 pb-12 sm:space-y-12 sm:px-6 sm:pt-12 sm:pb-16 lg:px-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between sm:gap-8">
                <div>
                    <h1 className="font-display text-[32px] leading-[1.1] sm:text-[48px] text-[var(--foreground)]">
                        Forms
                    </h1>
                    <p className="mt-1 text-sm leading-6 sm:mt-2 sm:text-base text-[var(--editorial-body)]">
                        Every form in your workspace, in one calm place.
                    </p>
                </div>
                <Button
                    onClick={() => setCreateDialogOpen(true)}
                >
                    <Plus className="h-5 w-5" />
                    <span className="hidden sm:inline">New Form</span>
                    <span className="sm:hidden">New</span>
                </Button>
            </div>

            {/* Search + status filters */}
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="editorial-transition flex h-[52px] w-full items-center gap-3 rounded-lg border border-[var(--input)] bg-[var(--card)] px-5 py-1 focus-within:border-[var(--primary)] sm:px-6 lg:min-w-[280px] lg:flex-1">
                    <Search className="h-5 w-5 shrink-0 text-[var(--editorial-subtle)]" />
                    <Input
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Search forms..."
                        aria-label="Search forms"
                        className="h-full flex-1 border-0 bg-transparent p-0 text-base shadow-none placeholder:text-[var(--editorial-subtle)] focus-visible:ring-0"
                    />
                </div>
                {/* Chips scroll sideways on narrow screens rather than wrapping. */}
                <div className="-mx-4 flex items-center gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:-mx-6 sm:px-6 lg:mx-0 lg:overflow-visible lg:px-0 lg:pb-0">
                    {FILTERS.map((filter) => (
                        <button
                            key={filter.value}
                            type="button"
                            onClick={() => setStatus(filter.value)}
                            className={cn(
                                "editorial-transition h-11 shrink-0 rounded-[16px] border px-4 text-sm",
                                status === filter.value
                                    ? "border-[var(--editorial-primary-ring)] bg-[var(--editorial-primary-selected)] text-[var(--primary)]"
                                    : "border-[var(--border)] bg-[var(--card)] text-[var(--editorial-body)] hover:-translate-y-0.5 hover:border-[var(--editorial-primary-ring)] hover:bg-[var(--editorial-primary-light)]",
                            )}
                        >
                            {filter.label}
                        </button>
                    ))}
                </div>
            </div>

            {isLoading ? (
                <p className="py-16 text-center text-base text-[var(--editorial-subtle)]">
                    Loading forms...
                </p>
            ) : visibleForms.length === 0 ? (
                <Card className="editorial-shadow-sm rounded-xl border-[var(--border)] bg-[var(--card)]">
                    <CardContent className="py-20 text-center">
                        <FileText className="mx-auto mb-4 h-8 w-8 text-[var(--editorial-disabled)]" />
                        <p className="text-base text-[var(--editorial-subtle)]">
                            {forms.length === 0
                                ? "No forms yet"
                                : "No forms match your search"}
                        </p>
                        {forms.length === 0 && (
                            <Button
                                className="editorial-transition mt-8 h-[52px] rounded-[16px] bg-[var(--primary)] px-6 text-sm font-medium text-white  hover:-translate-y-0.5 hover:bg-[var(--editorial-primary-hover)] active:translate-y-0 active:scale-[.98] active:bg-[var(--editorial-primary-pressed)]"
                                onClick={() => setCreateDialogOpen(true)}
                            >
                                Create your first form
                            </Button>
                        )}
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 xl:grid-cols-3">
                    {visibleForms.map((form) => (
                        <FormCard
                            key={form.id}
                            form={form}
                            onDeleteClick={(formId) => {
                                setFormToDelete(formId)
                                setDeleteAlertOpen(true)
                            }}
                            onDuplicateClick={(formId) => {
                                const form = forms.find((f) => f.id === formId)
                                setFormToDuplicate({ id: formId, title: form?.title || "" })
                                setDuplicateDialogOpen(true)
                            }}
                        />
                    ))}
                </div>
            )}

            <FormDialog
                type="create"
                open={createDialogOpen}
                onOpenChange={setCreateDialogOpen}
            />

            <DeleteFormDialog
                formId={formToDelete || ""}
                formTitle={forms.find((form) => form.id === formToDelete)?.title || ""}
                open={deleteAlertOpen}
                onOpenChange={setDeleteAlertOpen}
            />

            <DuplicateFormDialog
                formId={formToDuplicate?.id || ""}
                formTitle={formToDuplicate?.title + ' copy' || ""}
                open={duplicateDialogOpen}
                onOpenChange={setDuplicateDialogOpen}
            />
        </div>
    )
}
