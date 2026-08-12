import { useCallback, useEffect, useRef, useState } from "react"
import { FileText } from "lucide-react"
import { Button } from "../../../components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Input } from "../../../components/ui/input"
import { FIELD_TYPE_LABELS, FIELD_TYPE_ICONS, type FieldType } from "../../../shared/constants/form-types"
import type { FormField } from "../../../shared/types/common"
import { defaultOptionsForType, defaultSettingsForType } from "@/features/forms/model/field-defaults"
import type { LucideIcon } from "lucide-react"

type PageType = keyof typeof FIELD_TYPE_LABELS

interface AddPageDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    id: string | undefined
    pagesLength: number
    onAddPage: (page: FormField) => void
    onShowSaveStatus: (status: "saving" | "saved" | "error") => void
}

const PAGE_TYPES = (Object.entries(FIELD_TYPE_LABELS) as [PageType, string][]).map(([type, label]) => ({
    type,
    label,
    icon: FIELD_TYPE_ICONS[type],
}))

export function AddPageDialog({
    open,
    onOpenChange,
    id,
    pagesLength,
    onAddPage,
}: AddPageDialogProps) {
    const [searchQuery, setSearchQuery] = useState("")
    const searchInputRef = useRef<HTMLInputElement>(null)

    // Auto-focus search input when dialog opens
    useEffect(() => {
        if (open && searchInputRef.current) {
            // Small delay to ensure dialog is fully rendered
            setTimeout(() => {
                searchInputRef.current?.focus()
            }, 100)
        }
    }, [open])

    const addPage = useCallback(
        async (type: PageType) => {
            onOpenChange(false)

            // Fields are now embedded in the form, so we create them locally
            // and they will be saved when the form is updated
            const newPage: FormField = {
                _id: undefined,
                formId: id || "",
                fieldKey: `field_${Date.now()}`,
                label: FIELD_TYPE_LABELS[type as FieldType] || "New Question",
                helperText: "",
                placeholder: "",
                type,
                required: false,
                order: pagesLength + 1,
                options: defaultOptionsForType(type as FieldType),
                logic: [],
                appearance: { width: "full", icon: "" },
                isActive: true,
                coverImage: null,
                settings: defaultSettingsForType(type as FieldType),
            }
            onAddPage(newPage)
        },
        [id, pagesLength, onAddPage, onOpenChange]
    )

    // Filter page types based on search query
    const filteredPageTypes = PAGE_TYPES.filter((pt) =>
        pt.label.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <Dialog
            open={open}
            onOpenChange={onOpenChange}
            className="editorial editorial-shadow w-full max-w-3xl rounded-[30px] border-[var(--border)] bg-[var(--popover)] p-10"
        >
            <DialogContent>
                <DialogHeader className="mb-6">
                    <DialogTitle className="font-display text-[32px] leading-tight text-[var(--foreground)]">
                        Add a Page
                    </DialogTitle>
                    <DialogDescription className="mt-2 text-base leading-6 text-[var(--editorial-body)]">
                        Choose the type of page you want to add to your form.
                    </DialogDescription>
                </DialogHeader>

                {/* Search Input */}
                <div className="pb-6" key="search-input">
                    <Input
                        ref={searchInputRef}
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-[52px] rounded-full border-[var(--input)] bg-[var(--card)] px-6 text-base placeholder:text-[var(--editorial-subtle)]"
                        autoFocus={true}
                    />
                </div>
                <div
                    key="page-types-grid"
                    className="grid max-h-[45vh] min-h-32 grid-cols-1 sm:grid-cols-3 gap-3 overflow-y-auto py-2"
                >
                    {filteredPageTypes.length > 0 ? (
                        filteredPageTypes.map((pt) => {
                            const Icon: LucideIcon = pt.icon || FileText

                            return (
                                <button
                                    key={pt.type}
                                    onClick={() => addPage(pt.type)}
                                    className="editorial-transition group flex items-center gap-3 rounded-[18px] border border-[var(--editorial-border-light)] bg-[var(--card)] p-3 text-left hover:-translate-y-0.5 hover:border-[var(--editorial-primary-ring)] hover:bg-[var(--editorial-primary-selected)] hover:shadow-[0_4px_10px_rgba(0,0,0,.04)] active:translate-y-0 active:scale-[.98]"
                                >
                                    <div className="editorial-transition flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] border border-[var(--editorial-border-light)] bg-[var(--secondary)] text-[var(--editorial-body)] group-hover:border-[var(--editorial-primary-ring)] group-hover:bg-[var(--card)] group-hover:text-[var(--primary)]">
                                        <Icon className="h-5 w-5" />
                                    </div>
                                    <span className="text-base leading-tight text-[var(--foreground)]">
                                        {pt.label}
                                    </span>
                                </button>
                            )
                        })
                    ) : (
                        <div className="col-span-3 flex flex-col items-center justify-center py-12 text-center">
                            <FileText className="mb-3 h-8 w-8 text-[var(--editorial-disabled)]" />
                            <p className="text-base text-[var(--editorial-body)]">
                                No page types found
                            </p>
                            <p className="mt-1 text-xs text-[var(--editorial-subtle)]">
                                Try a different search term
                            </p>
                        </div>
                    )}
                </div>
                <DialogFooter className="mt-8">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        className="editorial-transition h-[52px] rounded-[16px] border-[var(--border)] bg-[var(--card)] px-8 text-sm text-[var(--foreground)] hover:-translate-y-0.5 hover:border-[var(--editorial-primary-ring)] hover:bg-[var(--editorial-primary-light)] active:translate-y-0 active:scale-[.98]"
                    >
                        Cancel
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
