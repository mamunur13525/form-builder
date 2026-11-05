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
    whenPageKey: string
    operator: "equals" | "notEquals" | "contains" | "greaterThan" | "lessThan"
    value: unknown
    action: "show" | "hide" | "goToPage" | "goToEnd"
    targetPageKey?: string
}

// ---------------------------------------------------------------------------
// Form-level logic rules (Logic Builder)
// ---------------------------------------------------------------------------

export type LogicOperator =
    | "equals"
    | "notEquals"
    | "contains"
    | "notContains"
    | "greaterThan"
    | "greaterThanOrEquals"
    | "lessThan"
    | "lessThanOrEquals"
    | "isEmpty"
    | "isNotEmpty"

/** What a rule does at a glance — drives the Logic Builder sections. */
export type LogicCategory = "display" | "hidePage" | "branching" | "calculation"

/** Where a condition reads its value from. */
export type LogicSourceType = "page" | "variable"

/** How multiple conditions inside one rule combine. */
export type LogicCombinator = "and" | "or"

/** Runtime effects a rule can trigger. */
export type LogicActionType =
    | "showPage"
    | "hidePage"
    | "jumpToPage"
    | "goToEnd"
    | "setVariable"

/** Arithmetic operation a calculation rule applies to its target variable. */
export type LogicCalcOperation = "set" | "add" | "subtract" | "multiply" | "divide"

export interface LogicCondition {
    sourceType: LogicSourceType
    /** Page key or variable name the condition reads from. */
    sourceKey: string
    operator: LogicOperator
    value?: unknown
    /**
     * How this condition joins to the PREVIOUS one. Ignored on the first
     * condition. Falls back to the rule-level `combinator` when absent, so
     * legacy rules (single rule-level combinator) keep working.
     */
    combinator?: LogicCombinator
}

export interface LogicActionItem {
    action: LogicActionType
    /** showPage / hidePage / jumpToPage target. */
    targetPageKey?: string
    /** setVariable target. */
    variableName?: string
    /**
     * Arithmetic operation for calculation rules. `set` overwrites the target;
     * `add`/`subtract`/`multiply`/`divide` fold `value` onto the running value.
     */
    operation?: LogicCalcOperation
    /** Legacy arithmetic expression for calculation rules (`@pageKey + @variable`). */
    expression?: string
    /**
     * Operand for calculation rules: a literal number or a `@number-variable`
     * when `operation` is set; the static value otherwise.
     */
    value?: unknown
}

export interface FormLogicRule {
    id: string
    formId?: string
    category: LogicCategory
    name?: string
    enabled: boolean
    combinator: LogicCombinator
    conditions: LogicCondition[]
    actions: LogicActionItem[]
    order?: number
    createdAt?: string
    updatedAt?: string
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

/** A named value defined in the form's settings, referenced in text as `@name`. */
export type VariableType = "text" | "number"

export interface FormVariable {
    name: string
    type: VariableType
    value: string | number | boolean
}

export interface FormSettings {
    oneQuestionAtATime: boolean
    showProgressBar: boolean
    allowMultipleSubmissions: boolean
    requireLogin: boolean
    collectIP: boolean
    /**
     * Variables defined on the FormSettings page. Referenced inside page labels
     * and helper text as `@variable_name` and resolved to their value when the
     * form is rendered (preview and published views).
     */
    variables?: FormVariable[]
}

export type PageType =
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
// Cover image (available on every page type)
// ---------------------------------------------------------------------------

export interface CoverImage {
    url: string
    fileId?: string
    alt?: string
}

// ---------------------------------------------------------------------------
// Per-type page settings. Only the group matching the page's type is stored.
// See doc/page-settings-frontend.md.
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

export interface AddressPageSetting {
    key: "address1" | "address2" | "city" | "state" | "zip" | "country"
    label: string
    placeholder: string
    required: boolean
    hidden: boolean
    order: number
}

export interface AddressSettings {
    pages: AddressPageSetting[]
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

export interface PageSettings {
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

export interface FormPage {
    _id?: string
    formId?: string
    pageKey: string
    label: string
    helperText: string
    placeholder: string
    type: PageType
    required: boolean
    order: number
    options: Option[]
    validation?: Validation
    logic: LogicRule[]
    appearance: Appearance
    isActive: boolean
    coverImage?: CoverImage | null
    settings?: PageSettings
}

// ---------------------------------------------------------------------------
// End pages (Thank You / completion screens). A form can hold several; the
// first one is what respondents see after submitting. See doc/end-page-api.md.
// ---------------------------------------------------------------------------

export type EndPageEmbedProvider =
    | "youtube"
    | "loom"
    | "vimeo"
    | "pdf"
    | "image"
    | "other"

export interface EndPageEmbed {
    url: string
    provider?: EndPageEmbedProvider
    title?: string
}

export interface EndPageButton {
    text: string
    link: string
}

export interface EndPageRedirect {
    isRedirect: boolean
    link: string
}

export interface EndPageSocialShareMedia {
    facebook: boolean
    twitter: boolean
    linkedin: boolean
    whatsapp?: boolean
}

export interface EndPage {
    _id?: string
    key?: string
    title: string
    helperText?: string
    /** Backwards-compatible alias for helperText. */
    paragraph?: string
    coverImage?: CoverImage | null
    embed?: EndPageEmbed
    alignment: ContentAlignment
    button: EndPageButton
    redirect: EndPageRedirect
    showConfetti: boolean
    socialShareButtons: boolean
    socialShareMessage: string
    socialShareMedia: EndPageSocialShareMedia
    order: number
    createdAt?: string
    updatedAt?: string
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
    pages: FormPage[]
    endPages?: EndPage[]
    /**
     * Form-level logic rules (Logic Builder). Included in the public /
     * preview payloads so the respondent view can evaluate branching,
     * display rules and calculation variables.
     */
    logic?: FormLogicRule[]
    createdAt?: string
    updatedAt?: string
}

export interface FormAnswer {
    pageKey: string
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