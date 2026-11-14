import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react"
import { FileText, Search, X } from "lucide-react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import {
    PAGE_TYPE_LABELS,
    PAGE_TYPE_VISUALS,
    PAGE_TYPES,
    type PageType,
} from "@/shared/constants/form-types"
import type { FormPage, FormQuestion } from "@/shared/types/common"
import { defaultOptionsForType, defaultSettingsForType } from "@/features/forms/model/page-defaults"
import { cn } from "@/lib/utils"

interface AddPageDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    id: string | undefined
    pagesLength: number
    onAddPage: (page: FormPage) => void
    onShowSaveStatus: (status: "saving" | "saved" | "error") => void
}

interface BlockCategory {
    title: string
    types: PageType[]
}

/** Groupings shown in the picker. A type may appear in more than one group. */
const CATEGORIES: BlockCategory[] = [
    { title: "Popular", types: ["shortText", "email", "radio", "longText"] },
    { title: "Contact", types: ["email", "phone", "address", "contactInfo", "url"] },
    { title: "Text & Numbers", types: ["shortText", "longText", "number", "date", "time"] },
    { title: "Choice", types: ["radio", "multiSelect", "dropdown", "select", "checkbox", "matrix", "yesNo"] },
    { title: "Layout", types: ["statement"] },
    { title: "Rating", types: ["rating", "opinionScale"] },
    { title: "Advanced", types: ["file", "signature"] },
]

/** Category columns, laid out the way the reference design reads. */
const COLUMNS: string[][] = [
    ["Popular"],
    ["Contact", "Text & Numbers"],
    ["Choice", "Layout"],
    ["Rating", "Advanced"],
]

const BLOCK_DESCRIPTIONS: Record<PageType, string> = {
    shortText: "Short text answer",
    longText: "Long text answer",
    email: "Email address input",
    phone: "Phone number input",
    number: "Numeric answer",
    date: "Date picker",
    time: "Time picker",
    radio: "Pick one option",
    checkbox: "Pick several options",
    select: "Pick one from a list",
    multiSelect: "Pick several from a list",
    dropdown: "Dropdown list",
    file: "File upload",
    rating: "Star rating",
    yesNo: "Yes or no answer",
    url: "Website address",
    statement: "Text, image or embed",
    address: "Postal address fields",
    contactInfo: "Contact information fields",
    opinionScale: "Scale from low to high",
    signature: "Draw a signature",
    matrix: "Grid of questions",
}

const blockLabel = (type: PageType) => PAGE_TYPE_VISUALS[type]?.displayName ?? PAGE_TYPE_LABELS[type]

/** Solid tile in the block's own hue, with a white glyph. */
function tileStyle(type: PageType): CSSProperties {
    const hex = PAGE_TYPE_VISUALS[type]?.bgColor.match(/#[0-9a-fA-F]{6}/)?.[0]
    return hex ? { backgroundColor: hex, color: "#fff" } : {}
}

function Kbd({ children }: { children: ReactNode }) {
    return (
        <kbd className="inline-flex h-5 min-w-5 items-center justify-center rounded border border-slate-200 bg-slate-50 px-1 font-sans text-[10px] font-medium text-slate-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400">
            {children}
        </kbd>
    )
}

export function AddPageDialog({
    open,
    onOpenChange,
    id,
    pagesLength,
    onAddPage,
}: AddPageDialogProps) {
    const addPage = useCallback(
        (type: PageType) => {
            onOpenChange(false)

            // Pages are now embedded in the form, so we create them locally
            // and they will be saved when the form is updated
            const blockKey = `block_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
            const initialTitle = PAGE_TYPE_LABELS[type] || "New Question"
            const question: FormQuestion = {
                questionKey: blockKey,
                blockKey,
                type,
                title: initialTitle,
                description: "",
                label: initialTitle,
                helperText: "",
                placeholder: "",
                required: false,
                order: 1,
                options: defaultOptionsForType(type),
                settings: defaultSettingsForType(type),
                appearance: { width: "full", icon: "" },
                isActive: true,
            }
            const newPage: FormPage = {
                _id: undefined,
                formId: id || "",
                pageKey: `page_${Date.now()}`,
                title: initialTitle,
                description: "",
                label: initialTitle,
                helperText: "",
                placeholder: "",
                type,
                required: false,
                order: pagesLength + 1,
                options: defaultOptionsForType(type),
                logic: [],
                appearance: { width: "full", icon: "" },
                isActive: true,
                coverImage: null,
                settings: defaultSettingsForType(type),
                questions: [question],
                blocks: [question],
            }
            onAddPage(newPage)
        },
        [id, pagesLength, onAddPage, onOpenChange],
    )

    return (
        <Dialog
            open={open}
            onOpenChange={onOpenChange}
            className="w-[calc(100%-2rem)] max-w-[980px] overflow-hidden rounded-xl border border-slate-200 bg-white p-0 text-slate-900 shadow-2xl dark:border-zinc-800 dark:bg-[#141418] dark:text-zinc-100"
        >
            <DialogContent>
                {/* Mounted only while open, so search and highlight start fresh. */}
                <BlockPicker onPick={addPage} onClose={() => onOpenChange(false)} />
            </DialogContent>
        </Dialog>
    )
}

function BlockPicker({ onPick, onClose }: { onPick: (type: PageType) => void; onClose: () => void }) {
    const [searchQuery, setSearchQuery] = useState("")
    const [activeIndex, setActiveIndex] = useState(0)
    const searchInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        const timer = setTimeout(() => searchInputRef.current?.focus(), 100)
        return () => clearTimeout(timer)
    }, [])

    // Escape closes, even after focus has left the search field.
    useEffect(() => {
        const onKey = (event: KeyboardEvent) => {
            if (event.key === "Escape") onClose()
        }
        document.addEventListener("keydown", onKey)
        return () => document.removeEventListener("keydown", onKey)
    }, [onClose])

    // Flattened in visual order, so arrow keys move the way the grid reads.
    const visible = useMemo(() => {
        const term = searchQuery.trim().toLowerCase()
        const items: { type: PageType; category: string; column: number; row: number; index: number }[] = []
        for (let column = 0; column < COLUMNS.length; column++) {
            let row = 0
            for (const title of COLUMNS[column]) {
                const category = CATEGORIES.find((c) => c.title === title)
                for (const type of category?.types ?? []) {
                    if (!term || blockLabel(type).toLowerCase().includes(term)) {
                        items.push({ type, category: title, column, row, index: items.length })
                        row++
                    }
                }
            }
        }
        return items
    }, [searchQuery])

    const indexByKey = useMemo(
        () => new Map(visible.map((item, index) => [`${item.category}|${item.type}`, index])),
        [visible],
    )

    // Keep the highlighted row inside the scroll area while arrowing.
    useEffect(() => {
        document
            .getElementById(`add-page-option-${activeIndex}`)
            ?.scrollIntoView({ block: "nearest" })
    }, [activeIndex])

    const updateQuery = (value: string) => {
        setSearchQuery(value)
        setActiveIndex(0)
    }

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault()
            if (visible.length === 0) return
            setActiveIndex((index) => {
                const next = event.key === "ArrowDown" ? index + 1 : index - 1
                return (next + visible.length) % visible.length
            })
        } else if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
            event.preventDefault()
            const current = visible[activeIndex]
            if (!current) return
            const delta = event.key === "ArrowRight" ? 1 : -1
            // Skip columns with no match at the same row, falling back to their last row.
            for (let step = 1; step <= COLUMNS.length; step++) {
                const column = ((current.column + delta * step) % COLUMNS.length + COLUMNS.length) % COLUMNS.length
                const rows = visible.filter((item) => item.column === column)
                if (rows.length > 0) {
                    setActiveIndex(rows[Math.min(current.row, rows.length - 1)].index)
                    return
                }
            }
        } else if (event.key === "Home" || event.key === "End") {
            event.preventDefault()
            setActiveIndex(event.key === "Home" ? 0 : Math.max(visible.length - 1, 0))
        } else if (event.key === "Enter") {
            event.preventDefault()
            const item = visible[activeIndex]
            if (item) onPick(item.type)
        }
    }

    const active = visible[activeIndex]

    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-label="Add a block"
            className="flex max-h-[85vh] flex-col"
        >
            {/* Search */}
            <div className="flex items-center gap-3 border-b border-slate-200 px-5 py-4 dark:border-zinc-800">
                <Search className="h-5 w-5 shrink-0 text-slate-400 dark:text-zinc-500" />
                <input
                    ref={searchInputRef}
                    type="text"
                    role="combobox"
                    aria-expanded="true"
                    aria-controls="add-page-block-list"
                    aria-autocomplete="list"
                    aria-activedescendant={active ? `add-page-option-${activeIndex}` : undefined}
                    aria-label="Search blocks"
                    placeholder={`Search ${PAGE_TYPES.length} blocks...`}
                    value={searchQuery}
                    onChange={(event) => updateQuery(event.target.value)}
                    onKeyDown={handleKeyDown}
                    className="h-6 flex-1 bg-transparent text-base outline-none placeholder:text-slate-400 dark:placeholder:text-zinc-500"
                />
                {searchQuery && (
                    <button
                        type="button"
                        onClick={() => {
                            updateQuery("")
                            searchInputRef.current?.focus()
                        }}
                        aria-label="Clear search"
                        className="rounded p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:text-zinc-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}
            </div>

            {/* Category columns */}
            <div
                id="add-page-block-list"
                role="listbox"
                aria-label="Blocks"
                className="grid min-h-0 flex-1 grid-cols-2 gap-x-6 gap-y-6 overflow-y-auto px-5 py-4 lg:grid-cols-4"
            >
                {COLUMNS.map((column, columnIndex) => (
                    <div key={columnIndex} className="space-y-6">
                        {column.map((title) => {
                            const category = CATEGORIES.find((c) => c.title === title)
                            const items = (category?.types ?? []).filter((type) =>
                                indexByKey.has(`${title}|${type}`),
                            )
                            if (items.length === 0) return null

                            return (
                                <div key={title}>
                                    <div className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                                        {title}
                                    </div>
                                    <div className="space-y-0.5">
                                        {items.map((type) => {
                                            const index = indexByKey.get(`${title}|${type}`) ?? 0
                                            const isActive = index === activeIndex
                                            const Icon = PAGE_TYPE_VISUALS[type]?.icon ?? FileText

                                            return (
                                                <button
                                                    key={type}
                                                    type="button"
                                                    id={`add-page-option-${index}`}
                                                    role="option"
                                                    aria-selected={isActive}
                                                    onClick={() => onPick(type)}
                                                    onMouseMove={() => {
                                                        if (!isActive) setActiveIndex(index)
                                                    }}
                                                    className={cn(
                                                        "flex w-full items-center gap-3 rounded-md px-2 py-1.5 text-left text-sm transition-colors border",
                                                        isActive
                                                            ? "border-slate-400 bg-slate-100 text-slate-900 dark:bg-zinc-800 dark:text-white"
                                                            : "border-transparent text-slate-700 hover:bg-slate-50 dark:text-zinc-300 dark:hover:bg-zinc-800/60",
                                                    )}
                                                >
                                                    <span
                                                        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md"
                                                        style={tileStyle(type)}
                                                    >
                                                        <Icon className="h-3.5 w-3.5" strokeWidth={2} />
                                                    </span>
                                                    <span className="truncate">{blockLabel(type)}</span>
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                ))}

                {visible.length === 0 && (
                    <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                        <FileText className="mb-3 h-8 w-8 text-slate-400 dark:text-zinc-600" />
                        <p className="text-base font-medium text-slate-700 dark:text-zinc-300">
                            No blocks found
                        </p>
                        <p className="mt-1 text-xs text-slate-400 dark:text-zinc-500">
                            Try a different search term
                        </p>
                    </div>
                )}
            </div>

            {/* Footer: highlighted block + key hints */}
            <div className="flex items-center justify-between gap-4 border-t border-slate-200 px-5 py-3 text-xs text-slate-500 dark:border-zinc-800 dark:text-zinc-400">
                <span className="truncate">
                    {active ? (
                        <>
                            <span className="font-semibold text-slate-700 dark:text-zinc-200">
                                {blockLabel(active.type)}
                            </span>
                            {" · "}
                            {BLOCK_DESCRIPTIONS[active.type]}
                        </>
                    ) : (
                        "No blocks match your search"
                    )}
                </span>
                <span className="hidden shrink-0 items-center gap-3 sm:flex">
                    <span className="flex items-center gap-1">
                        <Kbd>↑</Kbd>
                        <Kbd>↓</Kbd>
                        <Kbd>←</Kbd>
                        <Kbd>→</Kbd>
                        <span className="ml-1">move</span>
                    </span>
                    <span className="flex items-center gap-1">
                        <Kbd>↵</Kbd>
                        <span className="ml-1">add</span>
                    </span>
                    <span className="flex items-center gap-1">
                        <Kbd>esc</Kbd>
                        <span className="ml-1">close</span>
                    </span>
                </span>
            </div>
        </div>
    )
}
