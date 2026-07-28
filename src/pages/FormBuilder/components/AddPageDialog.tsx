import { useCallback } from "react"
import { FileText } from "lucide-react"
import { Button } from "../../../components/ui/button"
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../../../components/ui/dialog"
import { FIELD_TYPE_LABELS, FIELD_TYPE_ICONS, type FieldType } from "../../../shared/constants/form-types"
import type { FormField } from "../../../shared/types/common"
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
    onShowSaveStatus: _onShowSaveStatus,
}: AddPageDialogProps) {
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
                options:
                    type === "radio" || type === "checkbox" || type === "select" || type === "multiSelect"
                        ? [{ label: "Option 1", value: "option_1" }]
                        : [],
                logic: [],
                appearance: { width: "full", icon: "" },
                isActive: true,
            }
            onAddPage(newPage)
        },
        [id, pagesLength, onAddPage, onOpenChange]
    )

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogHeader>
                <DialogTitle>Add a Page</DialogTitle>
                <DialogDescription>
                    Choose the type of page you want to add to your form.
                </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-2 max-h-80 overflow-y-auto py-2">
                {PAGE_TYPES.map((pt) => {
                    const Icon: LucideIcon = pt.icon || FileText
                    return (
                        <button
                            key={pt.type}
                            onClick={() => addPage(pt.type)}
                            className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent hover:border-primary/50 transition-all text-left"
                        >
                            <Icon className="h-5 w-5 text-muted-foreground shrink-0" />
                            <span className="text-sm">{pt.label}</span>
                        </button>
                    )
                })}
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                    Cancel
                </Button>
            </DialogFooter>
        </Dialog>
    )
}