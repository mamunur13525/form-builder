import type {
    PageType,
    PageSettings,
    Option,
    AddressPageSetting,
    StatementEmbedProvider,
} from "@/shared/types/common"

/** Page types that use the `choice` settings group. */
export const CHOICE_TYPES: PageType[] = ["select", "multiSelect", "radio", "checkbox"]

/** Page types that support multiple answers (selectionLimit applies). */
export const MULTI_ANSWER_TYPES: PageType[] = ["multiSelect", "checkbox"]

/** Page types that render an editable option list. */
export const OPTION_TYPES: PageType[] = [
    "select",
    "multiSelect",
    "radio",
    "checkbox",
    "dropdown",
]

/** Allowed-file-type groups for the upload page. */
export const UPLOAD_FILE_GROUPS: { value: string; label: string }[] = [
    { value: "image", label: "Images" },
    { value: "video", label: "Video" },
    { value: "audio", label: "Audio" },
    { value: "text", label: "Text" },
    { value: "application", label: "Documents" },
]

export const STATEMENT_PROVIDERS: { value: StatementEmbedProvider; label: string }[] = [
    { value: "youtube", label: "YouTube" },
    { value: "loom", label: "Loom" },
    { value: "vimeo", label: "Vimeo" },
    { value: "pdf", label: "PDF" },
    { value: "image", label: "Image" },
    { value: "other", label: "Other" },
]

/** The six fixed address sub-pages, seeded on create. */
export function defaultAddressPages(): AddressPageSetting[] {
    return [
        { key: "address1", label: "Address", placeholder: "", required: false, hidden: false, order: 1 },
        { key: "address2", label: "Address line 2", placeholder: "", required: false, hidden: false, order: 2 },
        { key: "city", label: "City", placeholder: "", required: false, hidden: false, order: 3 },
        { key: "state", label: "State", placeholder: "", required: false, hidden: false, order: 4 },
        { key: "zip", label: "Zip", placeholder: "", required: false, hidden: false, order: 5 },
        { key: "country", label: "Country", placeholder: "", required: false, hidden: false, order: 6 },
    ]
}

/** Default option list for option-based page types. */
export function defaultOptionsForType(type: PageType): Option[] {
    if (OPTION_TYPES.includes(type)) {
        return [
            { label: "Option 1", value: "option_1" },
            { label: "Option 2", value: "option_2" },
        ]
    }
    return []
}

/** Default per-type settings group, matching the backend defaults. */
export function defaultSettingsForType(type: PageType): PageSettings {
    switch (type) {
        case "email":
            return { email: { businessEmailsOnly: false, emailVerification: false } }
        case "phone":
            return {
                phone: {
                    phoneVerification: false,
                    countryCodeMode: "auto",
                    defaultCountry: null,
                },
            }
        case "statement":
            return { statement: { embedUrl: "", embedProvider: "youtube", embedTitle: "" } }
        case "select":
        case "multiSelect":
        case "radio":
        case "checkbox":
            return {
                choice: {
                    allowOther: false,
                    otherLabel: "Other",
                    horizontalAlign: false,
                    optionsPerRow: { desktop: 3, mobile: 1 },
                    hideLabels: false,
                    ...(MULTI_ANSWER_TYPES.includes(type)
                        ? { selectionLimit: { mode: "none" as const } }
                        : {}),
                },
            }
        case "address":
            return { address: { pages: defaultAddressPages() } }
        case "rating":
            return { rating: { style: "star", max: 5 } }
        case "opinionScale":
            return { opinionScale: { min: 0, max: 10, leftLabel: "", rightLabel: "" } }
        case "file":
            return { upload: { allowMultiple: false, allowedFileTypes: [], maxFileSizeMb: 10 } }
        case "matrix":
            return {
                matrix: {
                    rows: [{ key: `row_${Date.now()}`, label: "Row 1", order: 1 }],
                    columns: [{ key: `col_${Date.now()}`, label: "Column 1", order: 1 }],
                    allowMultiplePerRow: false,
                },
            }
        default:
            return {}
    }
}
