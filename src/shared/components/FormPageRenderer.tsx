import type { FormPage } from "../types/common"
import {
    TextPage,
    TextareaPage,
    DatePage,
    TimePage,
    SelectPage,
    YesNoPage,
    ChoicePage,
    SignaturePage,
    StatementPage,
    AddressPage,
    OpinionScalePage,
    MatrixPage,
    StarRatingPage,
    UploadPage,
    PhoneAnswerPage,
} from "./pages"
import type { UploadedFile } from "./pages/UploadPage"

interface FormPageRendererProps {
    page: FormPage
    value: unknown
    error: string | null
    onAnswer: (pageKey: string, value: unknown) => void
    color?: string
    fontSizeClass?: string
}

/** Fall back to sane defaults so a page missing its settings group still renders. */
const CHOICE_FALLBACK = {
    allowOther: false,
    otherLabel: "Other",
    horizontalAlign: false,
    optionsPerRow: { desktop: 3, mobile: 1 },
    hideLabels: false,
}

export function FormPageRenderer({ page, value, error, onAnswer, color, fontSizeClass }: FormPageRendererProps) {
    const settings = page.settings ?? {}

    switch (page.type) {
        case "shortText":
            return (
                <TextPage
                    type="text"
                    placeholder={page.placeholder || "Type your answer here..."}
                    value={(value as string) || ""}
                    onChange={(v) => onAnswer(page.pageKey, v)}
                    error={error}
                    autoFocus
                    color={color}
                    fontSizeClass={fontSizeClass}
                />
            )
        case "email":
            return (
                <TextPage
                    type="email"
                    placeholder={page.placeholder || "Type your answer here..."}
                    value={(value as string) || ""}
                    onChange={(v) => onAnswer(page.pageKey, v)}
                    error={error}
                    autoFocus
                    color={color}
                    fontSizeClass={fontSizeClass}
                />
            )
        case "phone":
            return (
                <PhoneAnswerPage
                    value={(value as string) || ""}
                    onChange={(v) => onAnswer(page.pageKey, v)}
                    settings={
                        settings.phone ?? {
                            phoneVerification: false,
                            countryCodeMode: "auto",
                            defaultCountry: null,
                        }
                    }
                    placeholder={page.placeholder}
                    error={error}
                    color={color}
                    fontSizeClass={fontSizeClass}
                />
            )
        case "url":
            return (
                <TextPage
                    type="url"
                    placeholder={page.placeholder || "Type your answer here..."}
                    value={(value as string) || ""}
                    onChange={(v) => onAnswer(page.pageKey, v)}
                    error={error}
                    autoFocus
                    color={color}
                    fontSizeClass={fontSizeClass}
                />
            )
        case "longText":
            return (
                <TextareaPage
                    placeholder={page.placeholder || "Type your answer here..."}
                    value={(value as string) || ""}
                    onChange={(v) => onAnswer(page.pageKey, v)}
                    rows={4}
                    error={error}
                    autoFocus
                    color={color}
                    fontSizeClass={fontSizeClass}
                />
            )
        case "number":
            return (
                <TextPage
                    type="number"
                    placeholder={page.placeholder || "Enter a number"}
                    value={(value as string) || ""}
                    onChange={(v) => onAnswer(page.pageKey, v)}
                    error={error}
                    autoFocus
                    color={color}
                    fontSizeClass={fontSizeClass}
                />
            )
        case "date":
            return (
                <DatePage
                    value={(value as string) || ""}
                    onChange={(v) => onAnswer(page.pageKey, v)}
                    error={error}
                    color={color}
                    fontSizeClass={fontSizeClass}
                />
            )
        case "time":
            return (
                <TimePage
                    value={(value as string) || ""}
                    onChange={(v) => onAnswer(page.pageKey, v)}
                    error={error}
                    color={color}
                    fontSizeClass={fontSizeClass}
                />
            )
        case "dropdown":
            return (
                <SelectPage
                    value={(value as string) || ""}
                    onChange={(v) => onAnswer(page.pageKey, v)}
                    options={page.options}
                    error={error}
                    color={color}
                    fontSizeClass={fontSizeClass}
                />
            )
        case "select":
        case "radio":
            return (
                <ChoicePage
                    value={(value as string) || ""}
                    onChange={(v) => onAnswer(page.pageKey, v)}
                    options={page.options}
                    settings={settings.choice ?? CHOICE_FALLBACK}
                    multiple={false}
                    name={page.pageKey}
                    color={color}
                    fontSizeClass={fontSizeClass}
                />
            )
        case "checkbox":
        case "multiSelect":
            return (
                <ChoicePage
                    value={(value as string[]) || []}
                    onChange={(v) => onAnswer(page.pageKey, v)}
                    options={page.options}
                    settings={
                        settings.choice ?? {
                            ...CHOICE_FALLBACK,
                            selectionLimit: { mode: "none" as const },
                        }
                    }
                    multiple
                    name={page.pageKey}
                    color={color}
                    fontSizeClass={fontSizeClass}
                />
            )
        case "yesNo":
            return (
                <YesNoPage
                    value={(value as string) || ""}
                    onChange={(v) => onAnswer(page.pageKey, v)}
                    color={color}
                    fontSizeClass={fontSizeClass}
                />
            )
        case "rating":
            return (
                <StarRatingPage
                    value={(value as number) || 0}
                    onChange={(v) => onAnswer(page.pageKey, v)}
                    settings={settings.rating ?? { style: "star", max: 5 }}
                />
            )
        case "opinionScale":
            return (
                <OpinionScalePage
                    value={value as number | undefined}
                    onChange={(v) => onAnswer(page.pageKey, v)}
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
                <AddressPage
                    value={value as Record<string, string> | undefined}
                    onChange={(v) => onAnswer(page.pageKey, v)}
                    pages={settings.address?.pages ?? []}
                    color={color}
                    fontSizeClass={fontSizeClass}
                />
            )
        case "matrix":
            return (
                <MatrixPage
                    value={value as Record<string, string | string[]> | undefined}
                    onChange={(v) => onAnswer(page.pageKey, v)}
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
                <SignaturePage
                    value={(value as string) || ""}
                    onChange={(v) => onAnswer(page.pageKey, v)}
                />
            )
        case "statement":
            return (
                <StatementPage
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
                <UploadPage
                    value={value as UploadedFile[] | undefined}
                    onChange={(v) => onAnswer(page.pageKey, v)}
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
                <TextPage
                    placeholder={page.placeholder || "Type your answer here..."}
                    value={(value as string) || ""}
                    onChange={(v) => onAnswer(page.pageKey, v)}
                    error={error}
                />
            )
    }
}
