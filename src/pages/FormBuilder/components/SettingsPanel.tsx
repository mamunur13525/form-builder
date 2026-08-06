import { Settings2, Plus } from "lucide-react"
import { Label } from "../../../components/ui/label"
import { Input } from "../../../components/ui/input"
import { Button } from "../../../components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../../../components/ui/select"
import { FIELD_TYPE_LABELS } from "../../../shared/constants/form-types"
import type {
    ChoiceSettings,
    FieldSettings,
    FormField,
    Validation,
} from "../../../shared/types/common"
import {
    defaultOptionsForType,
    defaultSettingsForType,
    CHOICE_TYPES,
    MULTI_ANSWER_TYPES,
} from "@/features/forms/model/field-defaults"
import {
    CoverImageField,
    NumberSetting,
    RequiredToggle,
    SettingsSection,
    ToggleRow,
} from "./settings/primitives"
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

const PAGE_TYPES = Object.entries(FIELD_TYPE_LABELS).map(([type, label]) => ({
    type,
    label,
}))

interface SettingsPanelProps {
    page: FormField
    pageIndex: number
    onUpdate: (index: number, updates: Partial<FormField>) => void
}

export function SettingsPanel({ page, pageIndex, onUpdate }: SettingsPanelProps) {
    const settings = page.settings ?? {}

    /** Merge a single settings group, preserving the rest. */
    const patchSettings = (group: Partial<FieldSettings>) => {
        onUpdate(pageIndex, { settings: { ...settings, ...group } })
    }

    const patchValidation = (patch: Partial<Validation>) => {
        onUpdate(pageIndex, { validation: { ...page.validation, ...patch } })
    }

    /**
     * Changing the type wipes settings server-side, so reset locally to the
     * new type's defaults (and reseed options for option-based types).
     */
    const handleTypeChange = (value: FormField["type"] | null) => {
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
        <div className="editorial-shadow-md flex h-full w-full flex-col overflow-hidden rounded-[24px] border border-[var(--border)] bg-[var(--card)]">
            <div className="flex items-center gap-2 border-b border-[var(--editorial-border-light)] px-6 py-5">
                <Settings2 className="h-5 w-5 text-[var(--editorial-subtle)]" />
                <h3 className="editorial-eyebrow text-[var(--editorial-subtle)]">
                    Settings
                </h3>
            </div>

            <div className="flex-1 space-y-8 overflow-y-auto px-6 py-6">
                {/* Field type — always available */}
                <div className="space-y-2">
                    <Label className="text-base font-semibold text-[var(--foreground)]">
                        Field Type
                    </Label>
                    <Select value={page.type} onValueChange={handleTypeChange}>
                        <SelectTrigger className="h-[52px] w-full rounded-full border-[var(--input)] bg-[var(--secondary)] text-base">
                            <SelectValue placeholder="Select field type" />
                        </SelectTrigger>
                        <SelectContent className="editorial rounded-[18px] border-[var(--border)] bg-[var(--popover)]">
                            {PAGE_TYPES.map((pt) => (
                                <SelectItem
                                    key={pt.type}
                                    value={pt.type}
                                    className="rounded-[12px]"
                                >
                                    {pt.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
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
                    <SettingsSection title="Address fields">
                        <AddressSettingsWidget
                            settings={settings.address ?? { fields: [] }}
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

                {/* Cover image — available on every field type */}
                <CoverImageField
                    value={page.coverImage}
                    onChange={(coverImage) => onUpdate(pageIndex, { coverImage })}
                />

                {/* Custom validation error message — available on every type */}
                <SettingsSection title="Validation message">
                    <Input
                        value={page.validation?.message ?? ""}
                        onChange={(e) => patchValidation({ message: e.target.value })}
                        placeholder="This field is required"
                        className="h-[52px] rounded-2xl border-[var(--input)] bg-[var(--secondary)] px-5 text-base"
                    />
                    <p className="text-xs leading-5 text-[var(--editorial-subtle)]">
                        Shown to respondents when this field fails validation.
                    </p>
                </SettingsSection>

                {/* Logic — unchanged from the previous panel */}
                <SettingsSection
                    title="Logic"
                    description="Dynamically show or hide this field depending on how respondents answer other questions."
                >
                    {page.logic.length === 0 ? (
                        <p className="text-xs leading-5 text-[var(--editorial-subtle)]">
                            No logic rules configured
                        </p>
                    ) : (
                        page.logic.map((rule, ruleIndex) => (
                            <div
                                key={ruleIndex}
                                className="space-y-1 rounded-[18px] border border-[var(--editorial-border-light)] bg-[var(--secondary)] p-4"
                            >
                                <p className="text-base leading-6">
                                    When <strong>{rule.whenFieldKey}</strong> {rule.operator} "
                                    {String(rule.value)}"
                                </p>
                                <p className="text-xs text-[var(--editorial-subtle)]">
                                    → {rule.action} {rule.targetFieldKey}
                                </p>
                            </div>
                        ))
                    )}
                    <Button
                        variant="outline"
                        className="editorial-transition h-11 w-full rounded-[16px] border-[var(--border)] bg-[var(--secondary)] text-sm hover:-translate-y-0.5 hover:border-[var(--editorial-primary-ring)] hover:bg-[var(--editorial-primary-light)] active:translate-y-0 active:scale-[.98]"
                    >
                        <Plus className="mr-1.5 h-4 w-4" />
                        Add Logic
                    </Button>
                </SettingsSection>

                {/* Appearance — button text/color (shared with all types) */}
                <SettingsSection title="Appearance">
                    <div className="space-y-1.5">
                        <Label className="text-base text-[var(--editorial-body)]">Width</Label>
                        <Select
                            value={page.appearance.width}
                            onValueChange={(v: "full" | "half" | null) => {
                                if (!v) return
                                onUpdate(pageIndex, {
                                    appearance: { ...page.appearance, width: v },
                                })
                            }}
                        >
                            <SelectTrigger className="h-[52px] w-full rounded-2xl border-[var(--input)] bg-[var(--secondary)] text-base">
                                <SelectValue className={'rounded'} placeholder="Select width" />
                            </SelectTrigger>
                            <SelectContent className="editorial rounded-[18px] border-[var(--border)] bg-[var(--popover)]">
                                <SelectItem value="full" className="rounded-[12px]">
                                    Full Width
                                </SelectItem>
                                <SelectItem value="half" className="rounded-[12px]">
                                    Half Width
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
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
                            className="h-[52px] rounded-2xl border-[var(--input)] bg-[var(--secondary)] px-5 text-base"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label className="text-base text-[var(--editorial-body)]">Button Color</Label>
                        <div className="flex items-center gap-3">
                            <input
                                type="color"
                                aria-label="Button color"
                                value={page.appearance.submitButtonColor ?? "#000000"}
                                onChange={(e) =>
                                    onUpdate(pageIndex, {
                                        appearance: {
                                            ...page.appearance,
                                            submitButtonColor: e.target.value,
                                        },
                                    })
                                }
                                className="h-[52px] w-[52px] cursor-pointer rounded-lg border border-[var(--input)] bg-[var(--secondary)] p-1"
                            />
                            <Input
                                type="text"
                                value={page.appearance.submitButtonColor ?? ""}
                                onChange={(e) =>
                                    onUpdate(pageIndex, {
                                        appearance: {
                                            ...page.appearance,
                                            submitButtonColor: e.target.value,
                                        },
                                    })
                                }
                                placeholder="#000000"
                                className="h-[52px] rounded-2xl border-[var(--input)] bg-[var(--secondary)] px-5 text-base"
                            />
                        </div>
                    </div>
                </SettingsSection>
            </div>
        </div>
    )
}
