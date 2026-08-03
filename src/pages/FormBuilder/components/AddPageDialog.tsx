import { useCallback, useEffect, useRef, useState } from "react"
import { FileText } from "lucide-react"
import { Button } from "../../../components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Input } from "../../../components/ui/input"
import { FIELD_TYPE_LABELS, FIELD_TYPE_ICONS, FIELD_TYPE_COLORS, type FieldType } from "../../../shared/constants/form-types"
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
        <Dialog open={open} onOpenChange={onOpenChange} className="max-w-3xl w-full -translate-y-30">
            <DialogContent >
                <DialogHeader>
                    <DialogTitle>Add a Page</DialogTitle>
                    <DialogDescription>
                        Choose the type of page you want to add to your form.
                    </DialogDescription>
                </DialogHeader>

                {/* Search Input */}
                <div className="py-2" key="search-input">
                    <Input
                        ref={searchInputRef}
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-12 text-base"
                        autoFocus={true}
                    />
                </div>

                <div
                    key="page-types-grid"
                    className="grid grid-cols-3 gap-1.5 min-h-32 overflow-y-auto py-1"
                >
                    {filteredPageTypes.length > 0 ? (
                        filteredPageTypes.map((pt) => {
                            const Icon: LucideIcon = pt.icon || FileText
                            const colorClass = FIELD_TYPE_COLORS[pt.type] || "from-gray-500/20 to-gray-600/10 text-gray-600 dark:text-gray-400"

                            return (
                                <button
                                    key={pt.type}
                                    onClick={() => addPage(pt.type)}
                                    className="flex items-center gap-2 p-2 rounded-md border hover:bg-accent hover:border-primary/50 transition-all text-left group"
                                >
                                    <div className={`
                                        w-9 h-9 rounded flex items-center justify-center
                                        bg-linear-to-br shrink-0 transition-all duration-200
                                        ${colorClass}
                                    `}>
                                        <Icon className="h-3.5 w-3.5" />
                                    </div>
                                    <span className="text-base font-medium leading-tight">{pt.label}</span>
                                </button>
                            )
                        })
                    ) : (
                        <div className="col-span-3 flex flex-col items-center justify-center py-8 text-center">
                            <FileText className="h-8 w-8 text-muted-foreground/50 mb-2" />
                            <p className="text-sm text-muted-foreground">No page types found</p>
                            <p className="text-xs text-muted-foreground/70 mt-1">Try a different search term</p>
                        </div>
                    )}
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
