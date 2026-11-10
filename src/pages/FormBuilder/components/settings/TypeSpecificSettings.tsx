import { Code2 } from "lucide-react"
import type { ChoiceSettings, FormQuestion, PageSettings, Validation } from "../../../../shared/types/common"
import { NumberSetting, SettingsSection, ToggleRow } from "./primitives"
import {
    HideLabelsSetting,
    HorizontalAlignSetting,
    OtherOptionSetting,
    SelectionLimitSetting,
} from "./choice-settings"
import { PhoneSettingsWidget } from "./phone-settings"
import { RatingSettingsWidget } from "./rating-settings"
import {
    AddressSettingsWidget,
    MatrixSettingsWidget,
    OpinionScaleSettingsWidget,
    StatementSettingsWidget,
    UploadSettingsWidget,
} from "./type-settings"

interface TypeSpecificSettingsProps {
    question: FormQuestion
    settings: PageSettings
    isChoiceType: boolean
    isMultiAnswer: boolean
    isStatement: boolean
    onPatchSettings: (group: Partial<PageSettings>) => void
    onPatchValidation: (patch: Partial<Validation>) => void
}

/** Every per-question-type settings section, in one place. */
export function TypeSpecificSettings({
    question,
    settings,
    isChoiceType,
    isMultiAnswer,
    isStatement,
    onPatchSettings,
    onPatchValidation,
}: TypeSpecificSettingsProps) {
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
        <>
            {/* ---------------- Email ---------------- */}
            {question.type === "email" && (
                <SettingsSection title="Email">
                    <ToggleRow
                        id="business-emails"
                        label="Accept only business emails?"
                        checked={settings.email?.businessEmailsOnly ?? false}
                        onCheckedChange={(businessEmailsOnly) =>
                            onPatchSettings({
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
                            onPatchSettings({
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
            {question.type === "longText" && (
                <SettingsSection title="Character limits">
                    <NumberSetting
                        label="Minimum characters"
                        description="Leave blank for no minimum limit."
                        value={question.validation?.minLength}
                        onChange={(minLength) => onPatchValidation({ minLength })}
                        placeholder="No minimum"
                        min={0}
                    />
                    <NumberSetting
                        label="Maximum characters"
                        description="Leave blank for no maximum limit."
                        value={question.validation?.maxLength}
                        onChange={(maxLength) => onPatchValidation({ maxLength })}
                        placeholder="No maximum"
                        min={0}
                    />
                </SettingsSection>
            )}

            {/* ---------------- Number: min / max ---------------- */}
            {question.type === "number" && (
                <SettingsSection title="Number range">
                    <NumberSetting
                        label="Minimum number"
                        description="Leave blank for no minimum limit."
                        value={question.validation?.min}
                        onChange={(min) => onPatchValidation({ min })}
                        placeholder="No minimum"
                    />
                    <NumberSetting
                        label="Maximum number"
                        description="Leave blank for no maximum limit."
                        value={question.validation?.max}
                        onChange={(max) => onPatchValidation({ max })}
                        placeholder="No maximum"
                    />
                </SettingsSection>
            )}

            {/* ---------------- Phone ---------------- */}
            {question.type === "phone" && (
                <SettingsSection title="Phone">
                    <PhoneSettingsWidget
                        settings={
                            settings.phone ?? {
                                phoneVerification: false,
                                countryCodeMode: "auto",
                                defaultCountry: null,
                            }
                        }
                        onChange={(phone) => onPatchSettings({ phone })}
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
                        onChange={(statement) => onPatchSettings({ statement })}
                    />
                </SettingsSection>
            )}

            {/* ---------------- Choice types ---------------- */}
            {isChoiceType && (
                <SettingsSection title="Options">
                    <OtherOptionSetting
                        settings={choice}
                        onChange={(next) => onPatchSettings({ choice: next })}
                    />
                    <HorizontalAlignSetting
                        settings={choice}
                        onChange={(next) => onPatchSettings({ choice: next })}
                    />
                    <HideLabelsSetting
                        settings={choice}
                        onChange={(next) => onPatchSettings({ choice: next })}
                    />
                    <SelectionLimitSetting
                        settings={choice}
                        onChange={(next) => onPatchSettings({ choice: next })}
                        isMultiAnswer={isMultiAnswer}
                    />
                </SettingsSection>
            )}

            {/* ---------------- Address ---------------- */}
            {question.type === "address" && (
                <SettingsSection title="Address pages">
                    <AddressSettingsWidget
                        settings={settings.address ?? { pages: [] }}
                        onChange={(address) => onPatchSettings({ address })}
                    />
                </SettingsSection>
            )}

            {/* ---------------- Rating ---------------- */}
            {question.type === "rating" && (
                <SettingsSection title="Rating">
                    <RatingSettingsWidget
                        settings={settings.rating ?? { style: "star", max: 5 }}
                        onChange={(rating) => onPatchSettings({ rating })}
                    />
                </SettingsSection>
            )}

            {/* ---------------- Opinion scale ---------------- */}
            {question.type === "opinionScale" && (
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
                        onChange={(opinionScale) => onPatchSettings({ opinionScale })}
                    />
                </SettingsSection>
            )}

            {/* ---------------- Upload ---------------- */}
            {question.type === "file" && (
                <SettingsSection title="Upload">
                    <UploadSettingsWidget
                        settings={
                            settings.upload ?? {
                                allowMultiple: false,
                                allowedFileTypes: [],
                                maxFileSizeMb: 10,
                            }
                        }
                        onChange={(upload) => onPatchSettings({ upload })}
                    />
                </SettingsSection>
            )}

            {/* ---------------- Matrix ---------------- */}
            {question.type === "matrix" && (
                <SettingsSection title="Matrix">
                    <MatrixSettingsWidget
                        settings={
                            settings.matrix ?? {
                                rows: [],
                                columns: [],
                                allowMultiplePerRow: false,
                            }
                        }
                        onChange={(matrix) => onPatchSettings({ matrix })}
                    />
                </SettingsSection>
            )}
        </>
    )
}
