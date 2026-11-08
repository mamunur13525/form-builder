import React from "react"
import {
    ImagePlus,
    Palette,
    Trash2,
    Layers,
    FileText,
    Code2,
    Image,
    ShieldCheck,
    MousePointer,
    Settings as SettingsIcon,
    Search,
} from "lucide-react"
import { Input } from "../../../components/ui/input"
import {
    Combobox,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxItem,
    ComboboxList,
    ComboboxTrigger,
    ComboboxInput,
} from "../../../components/ui/combobox"
import { InputGroupAddon } from "../../../components/ui/input-group"
import {
    Tabs,
    TabsContent,
} from "../../../components/ui/tabs"

import { PAGE_TYPE_LABELS, PAGE_TYPES, PAGE_TYPE_VISUALS, type PageType } from "../../../shared/constants/form-types"
import type {
    ChoiceSettings,
    PageSettings,
    FormPage,
    FormQuestion,
    Validation,
} from "../../../shared/types/common"
import {
    defaultOptionsForType,
    defaultSettingsForType,
    CHOICE_TYPES,
    MULTI_ANSWER_TYPES,
} from "@/features/forms/model/page-defaults"
import {
    NumberSetting,
    RequiredToggle,
    SettingsSection,
    TextSetting,
    ToggleRow,
    CONTROL_CLASS,
} from "./settings/primitives"
import { ImagePickerDialog } from "./settings/ImagePickerDialog"
import { CoverImageLayoutSetting } from "./settings/cover-image-layout"
import {
    HideLabelsSetting,
    HorizontalAlignSetting,
    OtherOptionSetting,
    SelectionLimitSetting,
} from "./settings/choice-settings"
import { PhoneSettingsWidget } from "./settings/phone-settings"
import { RatingSettingsWidget } from "./settings/rating-settings"
import {
    AddressSettingsWidget,
    MatrixSettingsWidget,
    OpinionScaleSettingsWidget,
    StatementSettingsWidget,
    UploadSettingsWidget,
} from "./settings/type-settings"
import { cn } from "@/lib/utils"


interface SettingsPanelProps {
    page: FormPage
    pageIndex: number
    onUpdate: (index: number, updates: Partial<FormPage>) => void
    onOpenDesignDrawer: () => void
    selectedQuestionId?: string | null
    onSelectQuestion?: (questionId: string | null) => void
}

export function SettingsPanel({
    page,
    pageIndex,
    onUpdate,
    onOpenDesignDrawer,
    selectedQuestionId,
    onSelectQuestion,
}: SettingsPanelProps) {
    const [coverDialogOpen, setCoverDialogOpen] = React.useState(false)
    const [typeQuery, setTypeQuery] = React.useState("")
    const [comboboxOpen, setComboboxOpen] = React.useState(false)
    const [activeQuestionIndex, setActiveQuestionIndex] = React.useState(0)

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
        return PAGE_TYPES.filter((type) => {
            const label = (PAGE_TYPE_LABELS[type] ?? type).toLowerCase()
            const visual = PAGE_TYPE_VISUALS[type]
            const displayName = (visual?.displayName ?? "").toLowerCase()
            return label.includes(q) || displayName.includes(q) || type.toLowerCase().includes(q)
        })
    }, [typeQuery])

    const questions: FormQuestion[] = (page.questions && page.questions.length > 0)
        ? page.questions
        : (page.blocks && page.blocks.length > 0)
            ? page.blocks
            : [
                {
                    _id: page._id,
                    id: page._id,
                    questionKey: page.pageKey,
                    blockKey: page.pageKey,
                    type: page.type || "shortText",
                    title: page.title !== undefined ? page.title : (page.label || ""),
                    description: page.description !== undefined ? page.description : (page.helperText || ""),
                    label: page.label || page.title || "",
                    helperText: page.helperText || page.description || "",
                    placeholder: page.placeholder || "",
                    required: page.required ?? false,
                    order: 1,
                    options: page.options || [],
                    validation: page.validation,
                    settings: page.settings,
                    appearance: page.appearance || { width: "full", icon: "" },
                    coverImage: page.coverImage,
                    isActive: page.isActive ?? true,
                },
            ]

    const safeQuestionIndex = Math.min(activeQuestionIndex, Math.max(0, questions.length - 1))
    const currentQuestion = questions[safeQuestionIndex] || questions[0]
    const currentBlock = currentQuestion
    const settings = currentQuestion.settings ?? {}

    React.useEffect(() => {
        if (!selectedQuestionId) return
        const foundIdx = questions.findIndex(
            (q) => (q.questionKey || q.blockKey) === selectedQuestionId
        )
        if (foundIdx !== -1) {
            setActiveQuestionIndex(foundIdx)
        }
    }, [selectedQuestionId, questions])

    const updateCurrentQuestion = (updates: Partial<FormQuestion>) => {
        const updatedQuestions = [...questions]
        const target = updatedQuestions[safeQuestionIndex]
        if (!target) return

        updatedQuestions[safeQuestionIndex] = {
            ...target,
            ...updates,
        }

        const pageUpdates: Partial<FormPage> = {
            questions: updatedQuestions,
            blocks: updatedQuestions,
        }
        if (safeQuestionIndex === 0) {
            if (updates.type) pageUpdates.type = updates.type
            if (updates.placeholder !== undefined) pageUpdates.placeholder = updates.placeholder
            if (updates.options !== undefined) pageUpdates.options = updates.options
            if (updates.settings !== undefined) pageUpdates.settings = updates.settings
            if (updates.required !== undefined) pageUpdates.required = updates.required
        }
        onUpdate(pageIndex, pageUpdates)
    }

    /** Merge a single settings group into the active question. */
    const patchSettings = (group: Partial<PageSettings>) => {
        updateCurrentQuestion({ settings: { ...settings, ...group } })
    }

    const patchValidation = (patch: Partial<Validation>) => {
        updateCurrentQuestion({ validation: { ...(currentQuestion.validation || {}), ...patch } })
    }

    const updateCurrentBlock = updateCurrentQuestion

    /**
     * Changing the question type resets settings to the new type's defaults.
     */
    const handleTypeChange = (value: FormPage["type"] | null) => {
        if (!value) return
        const nextType = value
        const isOptionType = defaultOptionsForType(nextType).length > 0
        updateCurrentQuestion({
            type: nextType,
            settings: defaultSettingsForType(nextType),
            ...(isOptionType && (!currentQuestion.options || currentQuestion.options.length === 0)
                ? { options: defaultOptionsForType(nextType) }
                : {}),
        })
    }

    const isChoiceType = CHOICE_TYPES.includes(currentQuestion.type)
    const isMultiAnswer = MULTI_ANSWER_TYPES.includes(currentQuestion.type)
    const isStatement = currentQuestion.type === "statement"

    // The choice group with guaranteed defaults, so widgets never see undefined.
    const choice: ChoiceSettings = settings.choice ?? {
        allowOther: false,
        otherLabel: "Other",
        horizontalAlign: false,
        optionsPerRow: { desktop: 3, mobile: 1 },
        hideLabels: false,
        ...(isMultiAnswer ? { selectionLimit: { mode: "none" as const } } : {}),
    }

    return (
        <div data-settings-panel="true" className="flex h-full w-full flex-col overflow-hidden bg-white dark:bg-[#141418] border-l border-slate-200/90 dark:border-zinc-800/90 text-slate-800 dark:text-zinc-100">
            {/* Header: Page settings */}
            <div className="flex items-center gap-2 px-6 pt-5 pb-2">
                <Layers className="h-5 w-5 text-slate-900 dark:text-white" />
                <h3 className="text-base font-semibold text-slate-900 dark:text-white tracking-tight">Page settings</h3>
            </div>

            <div className="flex flex-1 min-h-0 flex-col">
                <Tabs defaultValue="settings" className="flex flex-1 min-h-0 flex-col">
                    {/* Pill tabs: Settings (active) | Design */}
                    <div className="px-6 py-2">
                        <div className="flex h-10 rounded-lg bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-1">
                            <div className="flex h-8 flex-1 items-center justify-center gap-2 rounded-lg bg-white dark:bg-[#1e1e24] text-sm font-medium text-slate-900 dark:text-white shadow-xs border border-slate-200 dark:border-zinc-700/60">
                                <SettingsIcon className="h-4 w-4 text-[#FF5722]" />
                                Settings
                            </div>
                            <button
                                type="button"
                                onClick={onOpenDesignDrawer}
                                className="flex h-8 flex-1 items-center justify-center gap-2 rounded-lg text-sm font-medium text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                            >
                                <Palette className="h-4 w-4 text-slate-400 dark:text-zinc-400" />
                                Design
                            </button>
                        </div>
                    </div>

                    <TabsContent value="settings" className="flex-1 min-h-0 overflow-y-auto">
                        <div className="space-y-6 px-6 py-4">
                            {/* Question Switcher (if multiple questions on this page) */}
                            {questions.length > 1 && (
                                <div className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/80 dark:bg-zinc-900/60 p-3 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
                                            Configure Question ({safeQuestionIndex + 1} of {questions.length})
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                        {questions.map((q, idx) => (
                                            <button
                                                key={q.questionKey || q.blockKey || idx}
                                                type="button"
                                                onClick={() => {
                                                    setActiveQuestionIndex(idx)
                                                    onSelectQuestion?.(q.questionKey || q.blockKey || null)
                                                }}
                                                className={cn(
                                                    "px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer",
                                                    safeQuestionIndex === idx
                                                        ? "bg-[#FF5722] text-white border-[#FF5722] shadow-xs"
                                                        : "bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700 hover:border-slate-300 dark:hover:border-zinc-600"
                                                )}
                                            >
                                                Q{idx + 1}
                                                {q.title ? `: ${q.title.slice(0, 10)}` : ` (${PAGE_TYPE_LABELS[q.type] ?? q.type})`}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Question type section */}
                            <SettingsSection
                                title={`Question Type (${safeQuestionIndex + 1}/${questions.length})`}
                                icon={<FileText className="h-4 w-4 text-slate-400 dark:text-zinc-400" />}
                            >
                                <Combobox
                                    items={filteredTypes}
                                    value={currentQuestion.type}
                                    onValueChange={handleTypeChange}
                                    inputValue={typeQuery}
                                    onInputValueChange={(next) => setTypeQuery(next ?? "")}
                                    open={comboboxOpen}
                                    onOpenChange={(open) => {
                                        setComboboxOpen(open)
                                        if (!open) setTypeQuery("")
                                    }}
                                >
                                    <ComboboxTrigger className="flex h-14 w-full items-center justify-between rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-[#1a1a20] px-4 text-sm font-medium text-slate-800 dark:text-zinc-100 shadow-xs hover:border-slate-300 dark:hover:border-zinc-700 focus-visible:border-[#FF5722] [&>svg:last-child]:text-slate-400 dark:[&>svg:last-child]:text-zinc-500 transition-colors cursor-pointer">
                                        {currentQuestion.type && PAGE_TYPE_VISUALS[currentQuestion.type] ? (
                                            (() => {
                                                const visual = PAGE_TYPE_VISUALS[currentQuestion.type]
                                                const Icon = visual.icon
                                                const label = visual.displayName ?? PAGE_TYPE_LABELS[currentQuestion.type] ?? currentQuestion.type
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
                                                className="w-full text-xs h-8 bg-slate-50 dark:bg-zinc-800/50 rounded-md border border-slate-200 dark:border-zinc-700/60 focus:border-[#FF5722]"
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

                            {/* Required — every type except statement */}
                            {!isStatement && (
                                <RequiredToggle
                                    checked={currentBlock.required ?? false}
                                    onCheckedChange={(required) => updateCurrentBlock({ required })}
                                />
                            )}

                            {/* ---------------- Email ---------------- */}
                            {currentBlock.type === "email" && (
                                <SettingsSection title="Email">
                                    <ToggleRow
                                        id="business-emails"
                                        label="Accept only business emails?"
                                        checked={settings.email?.businessEmailsOnly ?? false}
                                        onCheckedChange={(businessEmailsOnly) =>
                                            patchSettings({
                                                email: {
                                                    businessEmailsOnly,
                                                    emailVerification:
                                                        settings.email?.emailVerification ?? false,
                                                },
                                            })
                                        }
                                    />
                                    <ToggleRow
                                        id="email-verification"
                                        label="Email verification"
                                        checked={settings.email?.emailVerification ?? false}
                                        onCheckedChange={(emailVerification) =>
                                            patchSettings({
                                                email: {
                                                    businessEmailsOnly:
                                                        settings.email?.businessEmailsOnly ?? false,
                                                    emailVerification,
                                                },
                                            })
                                        }
                                    />
                                </SettingsSection>
                            )}

                            {/* ---------------- Long text: character limits ---------------- */}
                            {currentBlock.type === "longText" && (
                                <SettingsSection title="Character limits">
                                    <NumberSetting
                                        label="Minimum characters"
                                        description="Leave blank for no minimum limit."
                                        value={currentBlock.validation?.minLength}
                                        onChange={(minLength) => patchValidation({ minLength })}
                                        placeholder="No minimum"
                                        min={0}
                                    />
                                    <NumberSetting
                                        label="Maximum characters"
                                        description="Leave blank for no maximum limit."
                                        value={currentBlock.validation?.maxLength}
                                        onChange={(maxLength) => patchValidation({ maxLength })}
                                        placeholder="No maximum"
                                        min={0}
                                    />
                                </SettingsSection>
                            )}

                            {/* ---------------- Number: min / max ---------------- */}
                            {currentBlock.type === "number" && (
                                <SettingsSection title="Number range">
                                    <NumberSetting
                                        label="Minimum number"
                                        description="Leave blank for no minimum limit."
                                        value={currentBlock.validation?.min}
                                        onChange={(min) => patchValidation({ min })}
                                        placeholder="No minimum"
                                    />
                                    <NumberSetting
                                        label="Maximum number"
                                        description="Leave blank for no maximum limit."
                                        value={currentBlock.validation?.max}
                                        onChange={(max) => patchValidation({ max })}
                                        placeholder="No maximum"
                                    />
                                </SettingsSection>
                            )}

                            {/* ---------------- Phone ---------------- */}
                            {currentBlock.type === "phone" && (
                                <SettingsSection title="Phone">
                                    <PhoneSettingsWidget
                                        settings={
                                            settings.phone ?? {
                                                phoneVerification: false,
                                                countryCodeMode: "auto",
                                                defaultCountry: null,
                                            }
                                        }
                                        onChange={(phone) => patchSettings({ phone })}
                                    />
                                </SettingsSection>
                            )}

                            {/* ---------------- Statement ---------------- */}
                            {isStatement && (
                                <SettingsSection
                                    title="Embed content"
                                    icon={<Code2 className="h-4 w-4 text-zinc-400" />}
                                >
                                    <StatementSettingsWidget
                                        settings={
                                            settings.statement ?? {
                                                embedUrl: "",
                                                embedProvider: "youtube",
                                                embedTitle: "",
                                            }
                                        }
                                        onChange={(statement) => patchSettings({ statement })}
                                    />
                                </SettingsSection>
                            )}

                            {/* ---------------- Choice types ---------------- */}
                            {isChoiceType && (
                                <SettingsSection title="Options">
                                    <OtherOptionSetting
                                        settings={choice}
                                        onChange={(next) => patchSettings({ choice: next })}
                                    />
                                    <HorizontalAlignSetting
                                        settings={choice}
                                        onChange={(next) => patchSettings({ choice: next })}
                                    />
                                    <HideLabelsSetting
                                        settings={choice}
                                        onChange={(next) => patchSettings({ choice: next })}
                                    />
                                    <SelectionLimitSetting
                                        settings={choice}
                                        onChange={(next) => patchSettings({ choice: next })}
                                        isMultiAnswer={isMultiAnswer}
                                    />
                                </SettingsSection>
                            )}

                            {/* ---------------- Address ---------------- */}
                            {currentBlock.type === "address" && (
                                <SettingsSection title="Address pages">
                                    <AddressSettingsWidget
                                        settings={settings.address ?? { pages: [] }}
                                        onChange={(address) => patchSettings({ address })}
                                    />
                                </SettingsSection>
                            )}

                            {/* ---------------- Rating ---------------- */}
                            {currentBlock.type === "rating" && (
                                <SettingsSection title="Rating">
                                    <RatingSettingsWidget
                                        settings={settings.rating ?? { style: "star", max: 5 }}
                                        onChange={(rating) => patchSettings({ rating })}
                                    />
                                </SettingsSection>
                            )}

                            {/* ---------------- Opinion scale ---------------- */}
                            {currentBlock.type === "opinionScale" && (
                                <SettingsSection title="Scale">
                                    <OpinionScaleSettingsWidget
                                        settings={
                                            settings.opinionScale ?? {
                                                min: 0,
                                                max: 10,
                                                leftLabel: "",
                                                rightLabel: "",
                                            }
                                        }
                                        onChange={(opinionScale) => patchSettings({ opinionScale })}
                                    />
                                </SettingsSection>
                            )}

                            {/* ---------------- Upload ---------------- */}
                            {currentBlock.type === "file" && (
                                <SettingsSection title="Upload">
                                    <UploadSettingsWidget
                                        settings={
                                            settings.upload ?? {
                                                allowMultiple: false,
                                                allowedFileTypes: [],
                                                maxFileSizeMb: 10,
                                            }
                                        }
                                        onChange={(upload) => patchSettings({ upload })}
                                    />
                                </SettingsSection>
                            )}

                            {/* ---------------- Matrix ---------------- */}
                            {currentBlock.type === "matrix" && (
                                <SettingsSection title="Matrix">
                                    <MatrixSettingsWidget
                                        settings={
                                            settings.matrix ?? {
                                                rows: [],
                                                columns: [],
                                                allowMultiplePerRow: false,
                                            }
                                        }
                                        onChange={(matrix) => patchSettings({ matrix })}
                                    />
                                </SettingsSection>
                            )}

                            {/* Custom validation error message */}
                            <SettingsSection
                                title="Validation message"
                                icon={<ShieldCheck className="h-4 w-4 text-zinc-400" />}
                                description="Shown to respondents when this question fails validation."
                            >
                                <div className="relative">
                                    <Input
                                        value={currentBlock.validation?.message ?? ""}
                                        onChange={(e) => patchValidation({ message: e.target.value })}
                                        placeholder="This field is required"
                                        className={cn(CONTROL_CLASS, "pr-8")}
                                    />
                                </div>
                            </SettingsSection>

                            {/* Cover image — page level */}
                            <SettingsSection
                                title="Page Cover Image"
                                icon={<Image className="h-4 w-4 text-zinc-400" />}
                            >
                                {page.coverImage?.url ? (
                                    <div className="space-y-3">
                                        <div className="relative overflow-hidden rounded-lg border border-zinc-800 shadow-xs">
                                            <img
                                                src={page.coverImage.url}
                                                alt={page.coverImage.alt || "Cover"}
                                                className="h-28 w-full object-cover"
                                            />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setCoverDialogOpen(true)}
                                                className="flex h-10 flex-1 items-center justify-center rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-100 dark:bg-[#1a1a20] px-3 text-xs font-medium text-slate-700 dark:text-zinc-300 shadow-xs hover:bg-slate-200 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                                            >
                                                Replace
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => onUpdate(pageIndex, { coverImage: null })}
                                                className="flex h-10 items-center justify-center gap-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 text-xs font-medium text-rose-500 dark:text-rose-400 hover:bg-rose-500/20 transition-colors cursor-pointer"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                                Remove
                                            </button>
                                        </div>
                                        <CoverImageLayoutSetting
                                            value={page.coverImage.layout}
                                            onChange={(layout) =>
                                                onUpdate(pageIndex, {
                                                    coverImage: { ...page.coverImage!, layout },
                                                })
                                            }
                                        />
                                    </div>
                                ) : (
                                    <div
                                        onClick={() => setCoverDialogOpen(true)}
                                        className="flex w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-900/40 py-7 px-4 text-center cursor-pointer hover:bg-slate-100/70 dark:hover:bg-zinc-900/80 hover:border-[#FF5722]/60 transition-all group"
                                    >
                                        <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#18181c] text-[#FF5722] shadow-xs group-hover:scale-105 transition-transform">
                                            <ImagePlus className="h-5 w-5" />
                                        </div>
                                        <p className="mt-3 text-sm font-medium text-slate-800 dark:text-zinc-200">
                                            Add a cover image or drag & drop
                                        </p>
                                        <p className="mt-1 text-xs text-slate-500 dark:text-zinc-500">
                                            JPG, PNG, SVG • Max 5MB
                                        </p>
                                    </div>
                                )}
                            </SettingsSection>

                            {/* Button text — in settings tab */}
                            <SettingsSection
                                title="Page Button"
                                icon={<MousePointer className="h-4 w-4 text-zinc-400" />}
                            >
                                <TextSetting
                                    label="Submit / Continue Text"
                                    value={page.appearance?.submitButtonText ?? ""}
                                    onChange={(submitButtonText) =>
                                        onUpdate(pageIndex, {
                                            appearance: {
                                                ...(page.appearance || { width: "full", icon: "" }),
                                                submitButtonText,
                                            },
                                        })
                                    }
                                    placeholder={isStatement ? "Continue" : "Submit"}
                                />
                            </SettingsSection>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>

            <ImagePickerDialog
                open={coverDialogOpen}
                onOpenChange={setCoverDialogOpen}
                onSelect={(coverImage) =>
                    onUpdate(pageIndex, {
                        coverImage: {
                            ...coverImage,
                            layout: page.coverImage?.layout ?? "top",
                        },
                    })
                }
            />
        </div>
    )
}
