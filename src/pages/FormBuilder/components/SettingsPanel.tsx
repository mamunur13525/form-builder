import React, { type ComponentType } from "react"
import { ImagePlus, Palette, SlidersHorizontal, Trash2 } from "lucide-react"
import { Label } from "../../../components/ui/label"
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
    TabsList,
    TabsTrigger,
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
    TAB_LIST_CLASS,
    TAB_TRIGGER_CLASS,
    ToggleRow,
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
    const settings = page.settings ?? {}

    // Design and Logic open overlays rather than swapping tab panels.
    const SETTINGS_TABS: {
        value: string
        label: string
        icon: ComponentType<{ className?: string }>
        onSelect?: () => void
    }[] = [
            { value: "settings", label: "Settings", icon: SlidersHorizontal },
            { value: "design", label: "Design", icon: Palette, onSelect: onOpenDesignDrawer },
        ]

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
        <div className="editorial-shadow-md flex h-full w-full flex-col overflow-hidden bg-[var(--card)] border-l border-[var(--border)]">
            <div className="flex flex-1 min-h-0 flex-col border-b border-[var(--editorial-border-light)]">
                <div className="flex flex-1 min-h-0 flex-col">
                    <Tabs defaultValue="settings" className="flex flex-1 min-h-0 flex-col">
                        {/* Pill tabs on the editorial palette: the list is the track,
                            the active tab is a raised card. */}
                        <div className="px-6 pt-5">
                            <TabsList className={TAB_LIST_CLASS}>
                                {SETTINGS_TABS.map((tab) => (
                                    <TabsTrigger
                                        key={tab.value}
                                        value={tab.value}
                                        onClick={() => tab.onSelect?.()}
                                        className={TAB_TRIGGER_CLASS}
                                    >
                                        <tab.icon className="h-4 w-4" />
                                        {tab.label}
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                        </div>
                        <TabsContent value="settings" className="flex-1 min-h-0 overflow-y-auto">
                            <div className="space-y-8 px-6 py-6">
                                {/* Page type — always available */}
                                <div className="space-y-2">
                                    <Label className="text-base font-semibold text-[var(--foreground)]">
                                        Page Type
                                    </Label>
                                    <Combobox
                                        items={PAGE_TYPES}
                                        value={page.type}
                                        onValueChange={handleTypeChange}
                                    >
                                        <ComboboxTrigger className="h-[52px] w-full rounded-xl border border-[var(--input)] bg-[var(--secondary)] text-base flex items-center px-4 justify-between">
                                            {page.type && PAGE_TYPE_ICONS[page.type] ? (
                                                (() => {
                                                    const Icon = PAGE_TYPE_ICONS[page.type]
                                                    return (
                                                        <div className="flex items-center">
                                                            <Icon className="h-4 w-4 mr-2" />
                                                            <span>{PAGE_TYPE_LABELS[page.type]}</span>
                                                        </div>
                                                    )
                                                })()
                                            ) : (
                                                <span className="text-muted-foreground">Select page type</span>
                                            )}
                                        </ComboboxTrigger>
                                        <ComboboxContent className="editorial rounded-xl border border-[var(--border)] bg-[var(--popover)]">
                                            <ComboboxEmpty>No items found.</ComboboxEmpty>
                                            <ComboboxList>
                                                    {(item: PageType) => {
                                                    const Icon = PAGE_TYPE_ICONS[item]
                                                    return (
                                                        <ComboboxItem key={item} value={item} className="rounded-[12px] py-3.5!">
                                                            <Icon className="h-5 w-5" />
                                                            {PAGE_TYPE_LABELS[item]}
                                                        </ComboboxItem>
                                                    )
                                                }}
                                            </ComboboxList>
                                        </ComboboxContent>
                                    </Combobox>
                                </div>

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
                                    <SettingsSection title="Embed">
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
                                <SettingsSection title="Cover image">
                                    {page.coverImage?.url ? (
                                        <div className="space-y-3">
                                            <div className="relative overflow-hidden rounded-[22px] border border-[var(--editorial-border-light)]">
                                                <img
                                                    src={page.coverImage.url}
                                                    alt={page.coverImage.alt || "Cover"}
                                                    className="h-28 w-full object-cover"
                                                />
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() => setCoverDialogOpen(true)}
                                                    className="editorial-transition flex-1 rounded-[16px] border border-[var(--border)] bg-[var(--secondary)] px-4 py-3 text-sm text-[var(--foreground)] hover:-translate-y-0.5 hover:border-[var(--editorial-primary-ring)] hover:bg-[var(--editorial-primary-light)] active:translate-y-0 active:scale-[.98]"
                                                >
                                                    Replace
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => onUpdate(pageIndex, { coverImage: null })}
                                                    className="editorial-transition flex items-center justify-center gap-1.5 rounded-[16px] border border-[var(--border)] bg-[var(--secondary)] px-4 py-3 text-sm text-[var(--destructive)] hover:-translate-y-0.5 hover:border-[var(--destructive)]/30 active:translate-y-0 active:scale-[.98]"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => setCoverDialogOpen(true)}
                                            className="editorial-transition flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-[var(--input)] bg-[var(--secondary)] py-10 text-sm text-[var(--editorial-subtle)] hover:border-[var(--editorial-primary-ring)] hover:bg-[var(--editorial-primary-light)] hover:text-[var(--foreground)]"
                                        >
                                            <ImagePlus className="h-5 w-5" />
                                            <span>Add a cover image</span>
                                        </button>
                                    )}
                                </SettingsSection>

                                {/* Custom validation error message — available on every type */}
                                <SettingsSection title="Validation message">
                                    <Input
                                        value={page.validation?.message ?? ""}
                                        onChange={(e) => patchValidation({ message: e.target.value })}
                                        placeholder="This page is required"
                                        className="h-[52px] rounded-xl border-[var(--input)] bg-[var(--secondary)] px-5 text-base"
                                    />
                                    <p className="text-xs leading-5 text-[var(--editorial-subtle)]">
                                        Shown to respondents when this page fails validation.
                                    </p>
                                </SettingsSection>

                                {/* Button Text — in settings tab */}
                                <SettingsSection title="Button Text">
                                    <div className="space-y-1.5">
                                        <Label className="text-base text-[var(--editorial-body)]">Button Text</Label>
                                        <Input
                                            value={page.appearance.submitButtonText ?? ""}
                                            onChange={(e) =>
                                                onUpdate(pageIndex, {
                                                    appearance: {
                                                        ...page.appearance,
                                                        submitButtonText: e.target.value,
                                                    },
                                                })
                                            }
                                            placeholder="Submit"
                                            className="h-[52px] rounded-xl border-[var(--input)] bg-[var(--secondary)] px-5 text-base"
                                        />
                                    </div>
                                </SettingsSection>
                            </div>
                        </TabsContent>

                        <TabsContent value="design" className="h-full" />
                    </Tabs>
                </div>

                <ImagePickerDialog
                    open={coverDialogOpen}
                    onOpenChange={setCoverDialogOpen}
                    onSelect={(coverImage) => onUpdate(pageIndex, { coverImage })}
                    currentImage={page.coverImage}
                />
            </div>
        </div>
    )
}
