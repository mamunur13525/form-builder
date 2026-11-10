import React from "react"
import { FileText, Search } from "lucide-react"
import {
    Combobox,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxItem,
    ComboboxList,
    ComboboxTrigger,
    ComboboxInput,
} from "../../../../components/ui/combobox"
import { InputGroupAddon } from "../../../../components/ui/input-group"
import { PAGE_TYPE_LABELS, PAGE_TYPES, PAGE_TYPE_VISUALS, type PageType } from "../../../../shared/constants/form-types"
import type { FormPage, FormQuestion } from "../../../../shared/types/common"
import { SettingsSection } from "./primitives"

interface QuestionTypeSettingProps {
    type: FormQuestion["type"]
    index: number
    total: number
    onChange: (value: FormPage["type"] | null) => void
}

/** Searchable question-type combobox with its own query state. */
export function QuestionTypeSetting({
    type,
    index,
    total,
    onChange,
}: QuestionTypeSettingProps) {
    const [typeQuery, setTypeQuery] = React.useState("")
    const [comboboxOpen, setComboboxOpen] = React.useState(false)

    React.useEffect(() => {
        if (comboboxOpen) {
            const timer = setTimeout(() => {
                const input = document.querySelector<HTMLInputElement>("[data-slot='combobox-content'] input")
                input?.focus()
            }, 50)
            return () => clearTimeout(timer)
        }
    }, [comboboxOpen])

    const filteredTypes = React.useMemo(() => {
        if (!typeQuery.trim()) return PAGE_TYPES
        const q = typeQuery.toLowerCase().trim()
        return PAGE_TYPES.filter((item) => {
            const label = (PAGE_TYPE_LABELS[item] ?? item).toLowerCase()
            const visual = PAGE_TYPE_VISUALS[item]
            const displayName = (visual?.displayName ?? "").toLowerCase()
            return label.includes(q) || displayName.includes(q) || item.toLowerCase().includes(q)
        })
    }, [typeQuery])

    return (
        <SettingsSection
            title={`Question Type (${index + 1}/${total})`}
            icon={<FileText className="h-4 w-4 text-slate-400 dark:text-zinc-400" />}
        >
            <Combobox
                items={filteredTypes}
                value={type}
                onValueChange={onChange}
                inputValue={typeQuery}
                onInputValueChange={(next) => setTypeQuery(next ?? "")}
                open={comboboxOpen}
                onOpenChange={(open) => {
                    setComboboxOpen(open)
                    if (!open) setTypeQuery("")
                }}
            >
                <ComboboxTrigger className="flex h-14 w-full items-center justify-between rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-[#1a1a20] px-4 text-sm font-medium text-slate-800 dark:text-zinc-100 shadow-xs hover:border-slate-300 dark:hover:border-zinc-700 focus-visible:border-[#FF5722] [&>svg:last-child]:text-slate-400 dark:[&>svg:last-child]:text-zinc-500 transition-colors cursor-pointer">
                    {type && PAGE_TYPE_VISUALS[type] ? (
                        (() => {
                            const visual = PAGE_TYPE_VISUALS[type]
                            const Icon = visual.icon
                            const label = visual.displayName ?? PAGE_TYPE_LABELS[type] ?? type
                            return (
                                <div className="flex items-center gap-3 text-slate-800 dark:text-zinc-100 min-w-0">
                                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white shadow-xs ${visual.bgColor}`}>
                                        <Icon className="h-4.5 w-4.5 stroke-[2]" />
                                    </div>
                                    <span className="font-semibold truncate text-[14.5px]">{label}</span>
                                </div>
                            )
                        })()
                    ) : (
                        <span className="text-slate-400 dark:text-zinc-500">Select question type</span>
                    )}
                </ComboboxTrigger>
                <ComboboxContent className="rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#18181c] text-slate-800 dark:text-zinc-100 shadow-xl dark:shadow-2xl p-1.5 z-50 min-w-(--anchor-width)">
                    {/* Search bar with autofocus */}
                    <div className="p-1 mb-1 border-b border-slate-100 dark:border-zinc-800">
                        <ComboboxInput
                            autoFocus
                            showTrigger={false}
                            showClear={Boolean(typeQuery)}
                            placeholder="Search question types..."
                            className="w-full text-xs h-8 bg-slate-50 dark:bg-zinc-800/50 rounded-md border border-slate-200 dark:border-zinc-700/60 outline-0 ring-0 shadow-none focus:outline-0 focus:ring-0 focus:border-slate-200 dark:focus:border-zinc-700/60 focus-visible:outline-0 focus-visible:ring-0 focus-within:outline-0 focus-within:ring-0 focus-within:border-slate-200 dark:focus-within:border-zinc-700/60 has-[[data-slot=input-group-control]:focus-visible]:outline-0 has-[[data-slot=input-group-control]:focus-visible]:ring-0 has-[[data-slot=input-group-control]:focus-visible]:shadow-none has-[[data-slot=input-group-control]:focus-visible]:border-slate-200 dark:has-[[data-slot=input-group-control]:focus-visible]:border-zinc-700/60"
                        >
                            <InputGroupAddon align="inline-start">
                                <Search className="size-3.5 text-slate-400 dark:text-zinc-500" />
                            </InputGroupAddon>
                        </ComboboxInput>
                    </div>
                    <ComboboxEmpty className="py-4 text-center text-xs text-slate-400 dark:text-zinc-500">No question types found.</ComboboxEmpty>
                    <ComboboxList className="space-y-1 max-h-[380px] overflow-y-auto p-1">
                        {(item: PageType) => {
                            const visual = PAGE_TYPE_VISUALS[item]
                            const Icon = visual?.icon ?? FileText
                            const bgColor = visual?.bgColor ?? "bg-[#64748b]"
                            const label = visual?.displayName ?? PAGE_TYPE_LABELS[item] ?? item
                            return (
                                <ComboboxItem
                                    key={item}
                                    value={item}
                                    className="flex items-center gap-3 rounded-lg px-3.5 py-2.5 min-h-[46px] text-sm font-medium text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 data-highlighted:bg-slate-100 dark:data-highlighted:bg-zinc-800 data-highlighted:text-slate-900 dark:data-highlighted:text-white cursor-pointer transition-colors"
                                >
                                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white shadow-xs ${bgColor}`}>
                                        <Icon className="h-4.5 w-4.5 stroke-[2]" />
                                    </div>
                                    <span className="font-medium truncate">{label}</span>
                                </ComboboxItem>
                            )
                        }}
                    </ComboboxList>
                </ComboboxContent>
            </Combobox>
        </SettingsSection>
    )
}
