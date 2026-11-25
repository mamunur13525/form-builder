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
    | "contactInfo"
    | "opinionScale"
    | "nps"
    | "slider"
    | "signature"
    | "matrix"
    | "meeting"
    | "payment"

// ---------------------------------------------------------------------------
// Cover image (available on every page type)
// ---------------------------------------------------------------------------

/**
 * Where the cover image sits relative to the question:
 * - `top`       image above the question (default)
 * - `bottom`    image below the question
 * - `left`      image on the left, question on the right (desktop)
 * - `right`     image on the right, question on the left (desktop)
 * - `banner`    full-width top cover banner
 * - `wallpaper` full background wallpaper
 */
export type CoverImageLayout = "top" | "bottom" | "left" | "right" | "banner" | "wallpaper"
export type MobileCoverImageLayout = "top" | "bottom" | "banner" | "wallpaper"

export interface CoverImageFocalPoint {
    x: number
    y: number
}

export interface CoverImageCrop {
    x: number
    y: number
    width: number
    height: number
    aspect?: string
}

export interface CoverImageEdits {
    crop?: CoverImageCrop
    angle?: number
    rotate?: number
    flipH?: boolean
    flipV?: boolean
    contrast?: number
    saturation?: number
    filter?: string
}

export interface CoverImage {
    url: string
    fileId?: string
    alt?: string
    /** Placement of the image on desktop (and fallback on mobile). Defaults to `top`. */
    layout?: CoverImageLayout
    /** Placement of the image on mobile viewports. */
    mobileLayout?: MobileCoverImageLayout
    /** Relative brightness offset, -100..100, where 0 leaves the image untouched. */
    brightness?: number
    /** Image zoom percentage, 50..300, where 100 is unscaled. */
    zoom?: number
    /** Focal point percentages (0..100) for `object-position`. Defaults to center (50, 50). */
    focalPoint?: CoverImageFocalPoint
    /** Non-destructive image editor adjustments (crop, rotate, flip, color, filter). */
    edits?: CoverImageEdits
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

export type MeetingProvider =
    | "calendly"
    | "calcom"
    | "calid"
    | "savvycal"
    | "tidycal"

/** Maps an answer from an earlier question into a booking-page query param. */
export interface MeetingPrefillMapping {
    id: string
    /** `questionKey`/`blockKey` of the source question. */
    sourceKey: string
    /** Query param understood by the scheduling provider (e.g. `name`). */
    targetKey: string
}

export interface MeetingSettings {
    provider: MeetingProvider
    /** Full booking-page URL, e.g. `https://cal.com/jane/intro`. */
    link: string
    /** Label on the button that opens the scheduling dialog. */
    openerText: string
    prefillMappings: MeetingPrefillMapping[]
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

export type FieldWidth = "50%" | "100%"

export interface FieldsPerRow {
    desktop: number
    mobile: number
}

export interface AddressPageSetting {
    key: "address1" | "address2" | "city" | "state" | "zip" | "country"
    label: string
    placeholder: string
    required: boolean
    hidden: boolean
    order: number
    width?: FieldWidth
}

export interface AddressSettings {
    pages: AddressPageSetting[]
    fieldsPerRow?: FieldsPerRow
}

export type ContactInfoSubPageKey =
    | "firstName"
    | "lastName"
    | "email"
    | "phone"
    | "company"

export interface ContactInfoPageSetting {
    key: ContactInfoSubPageKey
    label: string
    placeholder: string
    required: boolean
    hidden: boolean
    order: number
    width?: FieldWidth
}

export interface ContactInfoSettings {
    pages: ContactInfoPageSetting[]
    phone?: PhoneSettings
    fieldsPerRow?: FieldsPerRow
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

export interface NpsSettings {
    leftLabel: string
    rightLabel: string
    /** Shrink the 0–10 buttons so they fit in one row on mobile. */
    singleRowOnMobile: boolean
}

export type SliderSeparator = "comma" | "period" | "space" | "none"

export interface SliderSettings {
    min?: number
    max?: number
    step?: number
    /** Show two handles so respondents pick a low/high range. */
    rangeMode?: boolean
    /** Value selected before the respondent interacts (single handle). */
    defaultLow?: number | null
    /** High value used as the starting point in range mode. */
    defaultHigh?: number | null
    prefix?: string
    suffix?: string
    thousandSeparator?: SliderSeparator
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

export interface PaymentSettings {
    /** Connected Stripe account that receives the charge. */
    stripeAccountId: string
    currency: string
    /** Fixed price in the currency's minor unit (cents). */
    amount: number
    allowInstallments: boolean
    /** Earlier email question key that receives the receipt. Empty = no receipt. */
    receiptEmailKey: string
}

export interface PageSettings {
    email?: EmailSettings
    phone?: PhoneSettings
    statement?: StatementSettings
    meeting?: MeetingSettings
    choice?: ChoiceSettings
    address?: AddressSettings
    contactInfo?: ContactInfoSettings
    rating?: RatingSettings
    opinionScale?: OpinionScaleSettings
    nps?: NpsSettings
    slider?: SliderSettings
    upload?: UploadSettings
    matrix?: MatrixSettings
    payment?: PaymentSettings
}

export interface FormQuestion {
    _id?: string
    id?: string
    questionKey?: string
    blockKey?: string
    type: PageType
    title: string
    description: string
    label?: string
    helperText?: string
    placeholder?: string
    required?: boolean
    order: number
    options?: Option[]
    validation?: Validation
    appearance?: Appearance
    coverImage?: CoverImage | null
    settings?: PageSettings
    isActive?: boolean
    createdAt?: string
    updatedAt?: string
}

export type FormBlock = FormQuestion

export interface FormPage {
    _id?: string
    formId?: string
    pageKey: string
    title?: string
    description?: string
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
    questions?: FormQuestion[]
    blocks?: FormQuestion[]
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
    blockKey?: string
    questionKey?: string
    title?: string
    label: string
    type: string
    value: unknown
}

export interface FormResponse {
    _id?: string
    formId: string
    respondentId?: string
    sessionId: string
    status?: "completed" | "partial"
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