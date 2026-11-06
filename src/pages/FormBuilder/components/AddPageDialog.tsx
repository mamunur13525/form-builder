import { useCallback, useEffect, useRef, useState } from "react"
import { FileText } from "lucide-react"
import { Button } from "../../../components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Input } from "../../../components/ui/input"
import { PAGE_TYPE_LABELS, PAGE_TYPE_ICONS, PAGE_TYPE_COLORS, type PageType } from "../../../shared/constants/form-types"
import type { FormPage } from "../../../shared/types/common"
import { defaultOptionsForType, defaultSettingsForType } from "@/features/forms/model/page-defaults"
import type { LucideIcon } from "lucide-react"

interface AddPageDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    id: string | undefined
    pagesLength: number
    onAddPage: (page: FormPage) => void
    onShowSaveStatus: (status: "saving" | "saved" | "error") => void
}

const PAGE_TYPES = (Object.entries(PAGE_TYPE_LABELS) as [PageType, string][]).map(([type, label]) => ({
    type,
    label,
    icon: PAGE_TYPE_ICONS[type],
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

            // Pages are now embedded in the form, so we create them locally
            // and they will be saved when the form is updated
            const newPage: FormPage = {
                _id: undefined,
                formId: id || "",
                pageKey: `page_${Date.now()}`,
                label: PAGE_TYPE_LABELS[type as PageType] || "New Question",
                helperText: "",
                placeholder: "",
                type,
                required: false,
                order: pagesLength + 1,
                options: defaultOptionsForType(type as PageType),
                logic: [],
                appearance: { width: "full", icon: "" },
                isActive: true,
                coverImage: null,
                settings: defaultSettingsForType(type as PageType),
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
            className="w-full max-w-3xl rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#141418] text-slate-900 dark:text-zinc-100 p-6 sm:p-10 shadow-2xl"
        >
            <DialogContent className="border-0 bg-transparent text-slate-900 dark:text-zinc-100">
                <DialogHeader className="mb-6">
                    <DialogTitle className="text-xl sm:text-2xl font-semibold text-slate-900 dark:text-white">
                        Add a Page
                    </DialogTitle>
                    <DialogDescription className="mt-1 text-sm text-slate-500 dark:text-zinc-400">
                        Choose the type of page you want to add to your form.
                    </DialogDescription>
                </DialogHeader>

                {/* Search Input */}
                <div className="pb-6" key="search-input">
                    <Input
                        ref={searchInputRef}
                        placeholder="Search page types..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-11 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-[#1a1a20] px-4 text-sm text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus-visible:border-[#FF5722] focus-visible:ring-1 focus-visible:ring-[#FF5722] shadow-xs"
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
                                    className="group flex items-center gap-3 rounded-xl border border-slate-200 dark:border-zinc-800/90 bg-slate-50/70 dark:bg-[#18181c] p-3 text-left hover:border-[#FF5722]/60 hover:bg-slate-100 dark:hover:bg-[#1e1e24] hover:shadow-md transition-all cursor-pointer shadow-xs"
                                >
                                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200/80 dark:border-zinc-700/50 bg-gradient-to-br ${PAGE_TYPE_COLORS[pt.type]} group-hover:scale-105 transition-transform`}>
                                        <Icon className="h-5 w-5" />
                                    </div>
                                    <span className="text-sm font-medium leading-tight text-slate-800 dark:text-zinc-200 group-hover:text-slate-950 dark:group-hover:text-white">
                                        {pt.label}
                                    </span>
                                </button>
                            )
                        })
                    ) : (
                        <div className="col-span-3 flex flex-col items-center justify-center py-12 text-center">
                            <FileText className="mb-3 h-8 w-8 text-slate-400 dark:text-zinc-600" />
                            <p className="text-base text-slate-700 dark:text-zinc-300 font-medium">
                                No page types found
                            </p>
                            <p className="mt-1 text-xs text-slate-400 dark:text-zinc-500">
                                Try a different search term
                            </p>
                        </div>
                    )}
                </div>
                <DialogFooter className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        className="h-11 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-100 dark:bg-[#1a1a20] px-6 text-sm font-medium text-slate-700 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer w-full sm:w-auto shadow-xs"
                    >
                        Cancel
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
