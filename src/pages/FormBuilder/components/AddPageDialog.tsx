import { useCallback, useEffect, useRef, useState } from "react"
import { FileText } from "lucide-react"
import { Button } from "../../../components/ui/button"
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../../../components/ui/dialog"
import { Input } from "../../../components/ui/input"
import { FIELD_TYPE_LABELS, FIELD_TYPE_ICONS, type FieldType } from "../../../shared/constants/form-types"
import type { FormField } from "../../../shared/types/common"
import type { LucideIcon } from "lucide-react"

type PageType = keyof typeof FIELD_TYPE_LABELS

// Map field types to subtle accent colors for the icon badge (matching SortablePageItem)
const FIELD_TYPE_COLORS: Record<string, string> = {
    shortText: "from-blue-500/20 to-blue-600/10 text-blue-600 dark:text-blue-400",
    longText: "from-sky-500/20 to-sky-600/10 text-sky-600 dark:text-sky-400",
    email: "from-violet-500/20 to-violet-600/10 text-violet-600 dark:text-violet-400",
    phone: "from-emerald-500/20 to-emerald-600/10 text-emerald-600 dark:text-emerald-400",
    number: "from-amber-500/20 to-amber-600/10 text-amber-600 dark:text-amber-400",
    date: "from-rose-500/20 to-rose-600/10 text-rose-600 dark:text-rose-400",
    time: "from-cyan-500/20 to-cyan-600/10 text-cyan-600 dark:text-cyan-400",
    radio: "from-orange-500/20 to-orange-600/10 text-orange-600 dark:text-orange-400",
    checkbox: "from-indigo-500/20 to-indigo-600/10 text-indigo-600 dark:text-indigo-400",
    select: "from-teal-500/20 to-teal-600/10 text-teal-600 dark:text-teal-400",
    multiSelect: "from-purple-500/20 to-purple-600/10 text-purple-600 dark:text-purple-400",
    file: "from-pink-500/20 to-pink-600/10 text-pink-600 dark:text-pink-400",
    rating: "from-yellow-500/20 to-yellow-600/10 text-yellow-600 dark:text-yellow-400",
    yesNo: "from-green-500/20 to-green-600/10 text-green-600 dark:text-green-400",
    url: "from-slate-500/20 to-slate-600/10 text-slate-600 dark:text-slate-400",
}

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

    // Filter page types based on search query
    const filteredPageTypes = PAGE_TYPES.filter((pt) =>
        pt.label.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <Dialog open={open} onOpenChange={onOpenChange} className="max-w-xl">
            <DialogHeader>
                <DialogTitle>Add a Page</DialogTitle>
                <DialogDescription>
                    Choose the type of page you want to add to your form.
                </DialogDescription>
            </DialogHeader>
            
            {/* Search Input */}
            <div className="py-2" key={open ? "open" : "closed"}>
                <Input
                    ref={searchInputRef}
                    placeholder="Search page types..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-8 text-sm"
                />
            </div>

            <div className="grid grid-cols-3 gap-1.5 min-h-32 overflow-y-auto py-1">
                {filteredPageTypes.length > 0 ? (
                    filteredPageTypes.map((pt) => {
                        const Icon: LucideIcon = pt.icon || FileText
                        const colorClass = FIELD_TYPE_COLORS[pt.type] || "from-gray-500/20 to-gray-600/10 text-gray-600 dark:text-gray-400"
                        
                        return (
                            <button
                                key={pt.type}
                                onClick={() => addPage(pt.type)}
                                className="flex items-center gap-2 p-2 rounded-md border hover:bg-accent hover:border-primary/50 transition-all text-left group h-11"
                            >
                                <div className={`
                                    w-7 h-7 rounded flex items-center justify-center
                                    bg-linear-to-br shrink-0 transition-all duration-200
                                    ${colorClass}
                                `}>
                                    <Icon className="h-3.5 w-3.5" />
                                </div>
                                <span className="text-xs font-medium leading-tight">{pt.label}</span>
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
        </Dialog>
    )
}
