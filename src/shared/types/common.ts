export interface Option {
    label: string
    value: string
}

export interface Validation {
    minLength?: number
    maxLength?: number
    min?: number
    max?: number
    pattern?: string
    message?: string
}

export interface LogicRule {
    whenFieldKey: string
    operator: "equals" | "notEquals" | "contains" | "greaterThan" | "lessThan"
    value: unknown
    action: "show" | "hide" | "goToField" | "goToEnd"
    targetFieldKey?: string
}

export interface Appearance {
    width: "full" | "half"
    icon?: string
    submitButtonText?: string
    submitButtonColor?: string
}

export type ContentAlignment = "left" | "center" | "right"
export type FontSize = "small" | "medium" | "large"
export type CornerRadius = "none" | "small" | "medium" | "large" | "full"
export type ThemeFontSource = "google" | "system" | "custom"

export interface IThemeBackgroundImage {
    url: string
    fileId?: string
    alt?: string
    brightness?: number
    tile?: boolean
}

export interface IThemeFont {
    family: string
    source: ThemeFontSource
    url?: string
}

export interface IFormTheme {
    primaryColor?: string
    backgroundColor?: string
    textColor?: string
    questionColor?: string
    answerColor?: string
    buttonColor?: string
    buttonTextColor?: string
    alignment?: ContentAlignment
    fontSize?: FontSize
    roundCorners?: CornerRadius
    backgroundImage?: IThemeBackgroundImage | null
    font?: IThemeFont
}

export type Theme = IFormTheme


export interface FormSettings {
    oneQuestionAtATime: boolean
    showProgressBar: boolean
    allowMultipleSubmissions: boolean
    requireLogin: boolean
    collectIP: boolean
}

export type FieldType =
    | "shortText"
    | "longText"
    | "email"
    | "phone"
    | "number"
    | "date"
    | "time"
    | "radio"
    | "checkbox"
    | "select"
    | "multiSelect"
    | "dropdown"
    | "file"
    | "rating"
    | "yesNo"
    | "url"
    | "statement"
    | "address"
    | "opinionScale"
    | "signature"
    | "matrix"

// ---------------------------------------------------------------------------
// Cover image (available on every field type)
// ---------------------------------------------------------------------------

export interface CoverImage {
    url: string
    fileId?: string
    alt?: string
}

// ---------------------------------------------------------------------------
// Per-type field settings. Only the group matching the field's type is stored.
// See doc/field-settings-frontend.md.
// ---------------------------------------------------------------------------

export interface EmailSettings {
    businessEmailsOnly: boolean
    emailVerification: boolean
}

export type CountryCodeMode = "auto" | "specific"

export interface PhoneCountry {
    iso2: string
    name: string
    dialCode: string
}

export interface PhoneSettings {
    phoneVerification: boolean
    countryCodeMode: CountryCodeMode
    defaultCountry?: PhoneCountry | null
}

export type StatementEmbedProvider =
    | "youtube"
    | "loom"
    | "vimeo"
    | "pdf"
    | "image"
    | "other"

export interface StatementSettings {
    embedUrl: string
    embedProvider: StatementEmbedProvider
    embedTitle: string
}

export type SelectionLimitMode = "none" | "exact" | "range"

export interface SelectionLimit {
    mode: SelectionLimitMode
    exact?: number
    min?: number
    max?: number
}

export interface OptionsPerRow {
    desktop: number
    mobile: number
}

export interface ChoiceSettings {
    allowOther: boolean
    otherLabel: string
    horizontalAlign: boolean
    optionsPerRow: OptionsPerRow
    hideLabels: boolean
    selectionLimit?: SelectionLimit
}

export interface AddressFieldSetting {
    key: "address1" | "address2" | "city" | "state" | "zip" | "country"
    label: string
    placeholder: string
    required: boolean
    hidden: boolean
    order: number
}

export interface AddressSettings {
    fields: AddressFieldSetting[]
}

export type RatingStyle = "star" | "number"

export interface RatingSettings {
    style: RatingStyle
    max: number
}

export interface OpinionScaleSettings {
    min: number
    max: number
    leftLabel: string
    rightLabel: string
}

export interface UploadSettings {
    allowMultiple: boolean
    allowedFileTypes: string[]
    maxFileSizeMb: number
}

export interface MatrixRow {
    key: string
    label: string
    order: number
}

export interface MatrixColumn {
    key: string
    label: string
    order: number
}

export interface MatrixSettings {
    rows: MatrixRow[]
    columns: MatrixColumn[]
    allowMultiplePerRow: boolean
}

export interface FieldSettings {
    email?: EmailSettings
    phone?: PhoneSettings
    statement?: StatementSettings
    choice?: ChoiceSettings
    address?: AddressSettings
    rating?: RatingSettings
    opinionScale?: OpinionScaleSettings
    upload?: UploadSettings
    matrix?: MatrixSettings
}

export interface FormField {
    _id?: string
    formId?: string
    fieldKey: string
    label: string
    helperText: string
    placeholder: string
    type: FieldType
    required: boolean
    order: number
    options: Option[]
    validation?: Validation
    logic: LogicRule[]
    appearance: Appearance
    isActive: boolean
    coverImage?: CoverImage | null
    settings?: FieldSettings
}

export interface Form {
    id?: string
    title: string
    slug: string
    status: "draft" | "published" | "archived"
    theme: Theme
    settings: FormSettings
    createdBy: string
    updatedBy?: string
    fields: FormField[]
    createdAt?: string
    updatedAt?: string
}

export interface FormAnswer {
    fieldKey: string
    label: string
    type: string
    value: unknown
}

export interface FormResponse {
    _id?: string
    formId: string
    respondentId?: string
    sessionId: string
    answers: FormAnswer[]
    metadata: {
        ipAddress: string
        userAgent: string
        referrer: string
        country: string
        city: string
    }
    submittedAt: string
}

export interface User {
    _id: string
    name: string
    email: string
    avatarUrl: string
    role: "admin" | "editor" | "viewer"
    isActive: boolean
    lastLoginAt?: string
}