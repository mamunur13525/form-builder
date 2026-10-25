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
    ChevronDown,
} from "lucide-react"
import { Input } from "../../../components/ui/input"
import {
    Combobox,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxItem,
    ComboboxList,
    ComboboxTrigger,
} from "../../../components/ui/combobox"
import {
    Tabs,
    TabsContent,
} from "../../../components/ui/tabs"

import { PAGE_TYPE_LABELS, PAGE_TYPE_ICONS, PAGE_TYPES, type PageType } from "../../../shared/constants/form-types"
import type {
    ChoiceSettings,
    PageSettings,
    FormPage,
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
}

export function SettingsPanel({
    page,
    pageIndex,
    onUpdate,
    onOpenDesignDrawer,
}: SettingsPanelProps) {

    const [coverDialogOpen, setCoverDialogOpen] = React.useState(false)
    const [typeQuery, setTypeQuery] = React.useState("")
    const settings = page.settings ?? {}

    /** Merge a single settings group, preserving the rest. */
    const patchSettings = (group: Partial<PageSettings>) => {
        onUpdate(pageIndex, { settings: { ...settings, ...group } })
    }

    const patchValidation = (patch: Partial<Validation>) => {
        onUpdate(pageIndex, { validation: { ...page.validation, ...patch } })
    }

    /**
     * Changing the type wipes settings server-side, so reset locally to the
     * new type's defaults (and reseed options for option-based types).
     */
    const handleTypeChange = (value: FormPage["type"] | null) => {
        if (!value) return
        const nextType = value
        const isOptionType = defaultOptionsForType(nextType).length > 0
        onUpdate(pageIndex, {
            type: nextType,
            settings: defaultSettingsForType(nextType),
            ...(isOptionType && page.options.length === 0
                ? { options: defaultOptionsForType(nextType) }
                : {}),
        })
    }

    const isChoiceType = CHOICE_TYPES.includes(page.type)
    const isMultiAnswer = MULTI_ANSWER_TYPES.includes(page.type)
    const isStatement = page.type === "statement"

    // The choice group with guaranteed defaults, so the widgets never see undefined.
    const choice: ChoiceSettings = settings.choice ?? {
        allowOther: false,
        otherLabel: "Other",
        horizontalAlign: false,
        optionsPerRow: { desktop: 3, mobile: 1 },
        hideLabels: false,
        ...(isMultiAnswer ? { selectionLimit: { mode: "none" as const } } : {}),
    }

    return (
        <div className="flex h-full w-full flex-col overflow-hidden bg-white dark:bg-[#141418] border-l border-slate-200/90 dark:border-zinc-800/90 text-slate-800 dark:text-zinc-100">
            {/* Header: Page settings */}
            <div className="flex items-center gap-2 px-6 pt-5 pb-2">
                <Layers className="h-5 w-5 text-slate-900 dark:text-white" />
                <h3 className="text-base font-semibold text-slate-900 dark:text-white tracking-tight">Page settings</h3>
            </div>

            <div className="flex flex-1 min-h-0 flex-col">
                <Tabs defaultValue="settings" className="flex flex-1 min-h-0 flex-col">
                    {/* Pill tabs: Settings (active) | Design */}
                    <div className="px-6 py-2">
                        <div className="flex rounded-xl bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-1">
                            <div className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-white dark:bg-[#1e1e24] py-2 text-sm font-medium text-slate-900 dark:text-white shadow-xs border border-slate-200 dark:border-zinc-700/60">
                                <SettingsIcon className="h-4 w-4 text-[#FF5722]" />
                                Settings
                            </div>
                            <button
                                type="button"
                                onClick={onOpenDesignDrawer}
                                className="flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                            >
                                <Palette className="h-4 w-4 text-slate-400 dark:text-zinc-400" />
                                Design
                            </button>
                        </div>
                    </div>

                    <TabsContent value="settings" className="flex-1 min-h-0 overflow-y-auto">
                        <div className="space-y-6 px-6 py-4">
                            {/* Page type section */}
                            <SettingsSection
                                title="Page Type"
                                icon={<FileText className="h-4 w-4 text-slate-400 dark:text-zinc-400" />}
                            >
                                <Combobox
                                    items={PAGE_TYPES}
                                    value={page.type}
                                    onValueChange={handleTypeChange}
                                    inputValue={typeQuery}
                                    onInputValueChange={(next) => setTypeQuery(next ?? "")}
                                    onOpenChange={(open) => {
                                        if (open) setTypeQuery("")
                                    }}
                                >
                                    <ComboboxTrigger className="flex h-[42px] w-full items-center justify-between rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-[#1a1a20] px-3.5 text-sm font-medium text-slate-800 dark:text-zinc-100 shadow-xs hover:border-slate-300 dark:hover:border-zinc-700 focus-visible:border-[#FF5722] [&>svg:last-child]:text-slate-400 dark:[&>svg:last-child]:text-zinc-500 transition-colors cursor-pointer">
                                        {page.type && PAGE_TYPE_ICONS[page.type] ? (
                                            (() => {
                                                const Icon = PAGE_TYPE_ICONS[page.type]
                                                return (
                                                    <div className="flex items-center gap-2 text-slate-800 dark:text-zinc-100">
                                                        <Icon className="h-4 w-4 text-[#FF5722] shrink-0" />
                                                        <span className="font-medium">{PAGE_TYPE_LABELS[page.type]}</span>
                                                    </div>
                                                )
                                            })()
                                        ) : (
                                            <span className="text-slate-400 dark:text-zinc-500">Select page type</span>
                                        )}
                                    </ComboboxTrigger>
                                    <ComboboxContent className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#18181c] text-slate-800 dark:text-zinc-100 shadow-xl dark:shadow-2xl p-1.5 z-50 min-w-(--anchor-width)">
                                        <ComboboxEmpty className="py-3 text-center text-sm text-slate-400 dark:text-zinc-500">No items found.</ComboboxEmpty>
                                        <ComboboxList className="space-y-0.5">
                                            {(item: PageType) => {
                                                const Icon = PAGE_TYPE_ICONS[item]
                                                return (
                                                    <ComboboxItem
                                                        key={item}
                                                        value={item}
                                                        className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 data-highlighted:bg-slate-100 dark:data-highlighted:bg-zinc-800 data-highlighted:text-slate-900 dark:data-highlighted:text-white cursor-pointer transition-colors"
                                                    >
                                                        <Icon className="h-4 w-4 text-slate-400 dark:text-zinc-400 shrink-0" />
                                                        <span className="font-medium">{PAGE_TYPE_LABELS[item]}</span>
                                                    </ComboboxItem>
                                                )
                                            }}
                                        </ComboboxList>
                                    </ComboboxContent>
                                </Combobox>
                            </SettingsSection>

                                {/* Required — every type except statement (forced false server-side) */}
                                {!isStatement && (
                                    <RequiredToggle
                                        checked={page.required}
                                        onCheckedChange={(required) => onUpdate(pageIndex, { required })}
                                    />
                                )}

                                {/* ---------------- Email ---------------- */}
                                {page.type === "email" && (
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
                                {page.type === "longText" && (
                                    <SettingsSection title="Character limits">
                                        <NumberSetting
                                            label="Minimum characters"
                                            description="Leave blank for no minimum limit."
                                            value={page.validation?.minLength}
                                            onChange={(minLength) => patchValidation({ minLength })}
                                            placeholder="No minimum"
                                            min={0}
                                        />
                                        <NumberSetting
                                            label="Maximum characters"
                                            description="Leave blank for no maximum limit."
                                            value={page.validation?.maxLength}
                                            onChange={(maxLength) => patchValidation({ maxLength })}
                                            placeholder="No maximum"
                                            min={0}
                                        />
                                    </SettingsSection>
                                )}

                                {/* ---------------- Number: min / max ---------------- */}
                                {page.type === "number" && (
                                    <SettingsSection title="Number range">
                                        <NumberSetting
                                            label="Minimum number"
                                            description="Leave blank for no minimum limit."
                                            value={page.validation?.min}
                                            onChange={(min) => patchValidation({ min })}
                                            placeholder="No minimum"
                                        />
                                        <NumberSetting
                                            label="Maximum number"
                                            description="Leave blank for no maximum limit."
                                            value={page.validation?.max}
                                            onChange={(max) => patchValidation({ max })}
                                            placeholder="No maximum"
                                        />
                                    </SettingsSection>
                                )}

                                {/* ---------------- Phone ---------------- */}
                                {page.type === "phone" && (
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
                                {page.type === "address" && (
                                    <SettingsSection title="Address pages">
                                        <AddressSettingsWidget
                                            settings={settings.address ?? { pages: [] }}
                                            onChange={(address) => patchSettings({ address })}
                                        />
                                    </SettingsSection>
                                )}

                                {/* ---------------- Rating ---------------- */}
                                {page.type === "rating" && (
                                    <SettingsSection title="Rating">
                                        <RatingSettingsWidget
                                            settings={settings.rating ?? { style: "star", max: 5 }}
                                            onChange={(rating) => patchSettings({ rating })}
                                        />
                                    </SettingsSection>
                                )}

                                {/* ---------------- Opinion scale ---------------- */}
                                {page.type === "opinionScale" && (
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
                                {page.type === "file" && (
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
                                {page.type === "matrix" && (
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

                                {/* Cover image — available on every page type */}
                                <SettingsSection
                                    title="Cover image"
                                    icon={<Image className="h-4 w-4 text-zinc-400" />}
                                >
                                    {page.coverImage?.url ? (
                                        <div className="space-y-3">
                                            <div className="relative overflow-hidden rounded-2xl border border-zinc-800 shadow-xs">
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
                                                    className="flex-1 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-100 dark:bg-[#1a1a20] px-3 py-2 text-xs font-medium text-slate-700 dark:text-zinc-300 shadow-xs hover:bg-slate-200 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                                                >
                                                    Replace
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => onUpdate(pageIndex, { coverImage: null })}
                                                    className="flex items-center justify-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs font-medium text-rose-500 dark:text-rose-400 hover:bg-rose-500/20 transition-colors cursor-pointer"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div
                                            onClick={() => setCoverDialogOpen(true)}
                                            className="flex w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-900/40 py-7 px-4 text-center cursor-pointer hover:bg-slate-100/70 dark:hover:bg-zinc-900/80 hover:border-[#FF5722]/60 transition-all group"
                                        >
                                            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#18181c] text-[#FF5722] shadow-xs group-hover:scale-105 transition-transform">
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

                                {/* Custom validation error message — available on every type */}
                                <SettingsSection
                                    title="Validation message"
                                    icon={<ShieldCheck className="h-4 w-4 text-zinc-400" />}
                                    description="Shown to respondents when this page fails validation."
                                >
                                    <div className="relative">
                                        <Input
                                            value={page.validation?.message ?? ""}
                                            onChange={(e) => patchValidation({ message: e.target.value })}
                                            placeholder="This page is required"
                                            className={cn(CONTROL_CLASS, "pr-8")}
                                        />
                                        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                                    </div>
                                </SettingsSection>

                                {/* Button text — in settings tab */}
                                <SettingsSection
                                    title="Button"
                                    icon={<MousePointer className="h-4 w-4 text-zinc-400" />}
                                >
                                    <TextSetting
                                        label="Button Text"
                                        value={page.appearance.submitButtonText ?? ""}
                                        onChange={(submitButtonText) =>
                                            onUpdate(pageIndex, {
                                                appearance: {
                                                    ...page.appearance,
                                                    submitButtonText,
                                                },
                                            })
                                        }
                                        placeholder="Submit"
                                    />
                                </SettingsSection>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>

                <ImagePickerDialog
                    open={coverDialogOpen}
                    onOpenChange={setCoverDialogOpen}
                    onSelect={(coverImage) => onUpdate(pageIndex, { coverImage })}
                    currentImage={page.coverImage}
                />
            </div>
    )
}
