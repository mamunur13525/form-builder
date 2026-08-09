import type { FormField } from "../types/common"
import {
    TextField,
    TextareaField,
    DateField,
    TimeField,
    SelectField,
    YesNoField,
    ChoiceField,
    SignatureField,
    StatementField,
    AddressField,
    OpinionScaleField,
    MatrixField,
    StarRatingField,
    UploadField,
    PhoneAnswerField,
} from "./fields"
import type { UploadedFile } from "./fields/UploadField"

interface FormFieldRendererProps {
    field: FormField
    value: unknown
    error: string | null
    onAnswer: (fieldKey: string, value: unknown) => void
    color?: string
    fontSizeClass?: string
}

/** Fall back to sane defaults so a field missing its settings group still renders. */
const CHOICE_FALLBACK = {
    allowOther: false,
    otherLabel: "Other",
    horizontalAlign: false,
    optionsPerRow: { desktop: 3, mobile: 1 },
    hideLabels: false,
}

export function FormFieldRenderer({ field, value, error, onAnswer, color, fontSizeClass }: FormFieldRendererProps) {
    const settings = field.settings ?? {}

    switch (field.type) {
        case "shortText":
            return (
                <TextField
                    type="text"
                    placeholder={field.placeholder || "Type your answer here..."}
                    value={(value as string) || ""}
                    onChange={(v) => onAnswer(field.fieldKey, v)}
                    error={error}
                    autoFocus
                    color={color}
                    fontSizeClass={fontSizeClass}
                />
            )
        case "email":
            return (
                <TextField
                    type="email"
                    placeholder={field.placeholder || "Type your answer here..."}
                    value={(value as string) || ""}
                    onChange={(v) => onAnswer(field.fieldKey, v)}
                    error={error}
                    autoFocus
                    color={color}
                    fontSizeClass={fontSizeClass}
                />
            )
        case "phone":
            return (
                <PhoneAnswerField
                    value={(value as string) || ""}
                    onChange={(v) => onAnswer(field.fieldKey, v)}
                    settings={
                        settings.phone ?? {
                            phoneVerification: false,
                            countryCodeMode: "auto",
                            defaultCountry: null,
                        }
                    }
                    placeholder={field.placeholder}
                    error={error}
                    color={color}
                    fontSizeClass={fontSizeClass}
                />
            )
        case "url":
            return (
                <TextField
                    type="url"
                    placeholder={field.placeholder || "Type your answer here..."}
                    value={(value as string) || ""}
                    onChange={(v) => onAnswer(field.fieldKey, v)}
                    error={error}
                    autoFocus
                    color={color}
                    fontSizeClass={fontSizeClass}
                />
            )
        case "longText":
            return (
                <TextareaField
                    placeholder={field.placeholder || "Type your answer here..."}
                    value={(value as string) || ""}
                    onChange={(v) => onAnswer(field.fieldKey, v)}
                    rows={4}
                    error={error}
                    autoFocus
                    color={color}
                    fontSizeClass={fontSizeClass}
                />
            )
        case "number":
            return (
                <TextField
                    type="number"
                    placeholder={field.placeholder || "Enter a number"}
                    value={(value as string) || ""}
                    onChange={(v) => onAnswer(field.fieldKey, v)}
                    error={error}
                    autoFocus
                    color={color}
                    fontSizeClass={fontSizeClass}
                />
            )
        case "date":
            return (
                <DateField
                    value={(value as string) || ""}
                    onChange={(v) => onAnswer(field.fieldKey, v)}
                    error={error}
                    color={color}
                    fontSizeClass={fontSizeClass}
                />
            )
        case "time":
            return (
                <TimeField
                    value={(value as string) || ""}
                    onChange={(v) => onAnswer(field.fieldKey, v)}
                    error={error}
                    color={color}
                    fontSizeClass={fontSizeClass}
                />
            )
        case "dropdown":
            return (
                <SelectField
                    value={(value as string) || ""}
                    onChange={(v) => onAnswer(field.fieldKey, v)}
                    options={field.options}
                    error={error}
                    color={color}
                    fontSizeClass={fontSizeClass}
                />
            )
        case "select":
        case "radio":
            return (
                <ChoiceField
                    value={(value as string) || ""}
                    onChange={(v) => onAnswer(field.fieldKey, v)}
                    options={field.options}
                    settings={settings.choice ?? CHOICE_FALLBACK}
                    multiple={false}
                    name={field.fieldKey}
                    color={color}
                    fontSizeClass={fontSizeClass}
                />
            )
        case "checkbox":
        case "multiSelect":
            return (
                <ChoiceField
                    value={(value as string[]) || []}
                    onChange={(v) => onAnswer(field.fieldKey, v)}
                    options={field.options}
                    settings={
                        settings.choice ?? {
                            ...CHOICE_FALLBACK,
                            selectionLimit: { mode: "none" as const },
                        }
                    }
                    multiple
                    name={field.fieldKey}
                    color={color}
                    fontSizeClass={fontSizeClass}
                />
            )
        case "yesNo":
            return (
                <YesNoField
                    value={(value as string) || ""}
                    onChange={(v) => onAnswer(field.fieldKey, v)}
                    color={color}
                    fontSizeClass={fontSizeClass}
                />
            )
        case "rating":
            return (
                <StarRatingField
                    value={(value as number) || 0}
                    onChange={(v) => onAnswer(field.fieldKey, v)}
                    settings={settings.rating ?? { style: "star", max: 5 }}
                />
            )
        case "opinionScale":
            return (
                <OpinionScaleField
                    value={value as number | undefined}
                    onChange={(v) => onAnswer(field.fieldKey, v)}
                    settings={
                        settings.opinionScale ?? {
                            min: 0,
                            max: 10,
                            leftLabel: "",
                            rightLabel: "",
                        }
                    }
                />
            )
        case "address":
            return (
                <AddressField
                    value={value as Record<string, string> | undefined}
                    onChange={(v) => onAnswer(field.fieldKey, v)}
                    fields={settings.address?.fields ?? []}
                    color={color}
                    fontSizeClass={fontSizeClass}
                />
            )
        case "matrix":
            return (
                <MatrixField
                    value={value as Record<string, string | string[]> | undefined}
                    onChange={(v) => onAnswer(field.fieldKey, v)}
                    settings={
                        settings.matrix ?? {
                            rows: [],
                            columns: [],
                            allowMultiplePerRow: false,
                        }
                    }
                />
            )
        case "signature":
            return (
                <SignatureField
                    value={(value as string) || ""}
                    onChange={(v) => onAnswer(field.fieldKey, v)}
                />
            )
        case "statement":
            return (
                <StatementField
                    settings={
                        settings.statement ?? {
                            embedUrl: "",
                            embedProvider: "youtube",
                            embedTitle: "",
                        }
                    }
                />
            )
        case "file":
            return (
                <UploadField
                    value={value as UploadedFile[] | undefined}
                    onChange={(v) => onAnswer(field.fieldKey, v)}
                    settings={
                        settings.upload ?? {
                            allowMultiple: false,
                            allowedFileTypes: [],
                            maxFileSizeMb: 10,
                        }
                    }
                />
            )
        default:
            return (
                <TextField
                    placeholder={field.placeholder || "Type your answer here..."}
                    value={(value as string) || ""}
                    onChange={(v) => onAnswer(field.fieldKey, v)}
                    error={error}
                />
            )
    }
}
