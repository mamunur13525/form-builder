import type { FormField } from "../types/common"
import {
    TextField,
    TextareaField,
    DateField,
    TimeField,
    SelectField,
    RadioField,
    CheckboxField,
    YesNoField,
    RatingField,
    FileField,
} from "./fields"

interface FormFieldRendererProps {
    field: FormField
    value: unknown
    error: string | null
    onAnswer: (fieldKey: string, value: unknown) => void
}

export function FormFieldRenderer({ field, value, error, onAnswer }: FormFieldRendererProps) {
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
                />
            )
        case "phone":
            return (
                <TextField
                    type="tel"
                    placeholder={field.placeholder || "Type your answer here..."}
                    value={(value as string) || ""}
                    onChange={(v) => onAnswer(field.fieldKey, v)}
                    error={error}
                    autoFocus
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
                />
            )
        case "date":
            return (
                <DateField
                    value={(value as string) || ""}
                    onChange={(v) => onAnswer(field.fieldKey, v)}
                    error={error}
                />
            )
        case "time":
            return (
                <TimeField
                    value={(value as string) || ""}
                    onChange={(v) => onAnswer(field.fieldKey, v)}
                    error={error}
                />
            )
        case "select":
            return (
                <SelectField
                    value={(value as string) || ""}
                    onChange={(v) => onAnswer(field.fieldKey, v)}
                    options={field.options}
                    error={error}
                />
            )
        case "radio":
            return (
                <RadioField
                    value={(value as string) || ""}
                    onChange={(v) => onAnswer(field.fieldKey, v)}
                    options={field.options}
                    name={field.fieldKey}
                />
            )
        case "checkbox":
        case "multiSelect":
            return (
                <CheckboxField
                    value={(value as string[]) || []}
                    onChange={(v) => onAnswer(field.fieldKey, v)}
                    options={field.options}
                />
            )
        case "yesNo":
            return (
                <YesNoField
                    value={(value as string) || ""}
                    onChange={(v) => onAnswer(field.fieldKey, v)}
                />
            )
        case "rating":
            return (
                <RatingField
                    value={(value as number) || 0}
                    onChange={(v) => onAnswer(field.fieldKey, v)}
                />
            )
        case "file":
            return <FileField />
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