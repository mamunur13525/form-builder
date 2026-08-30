/** Form, page, block, logic, and share types that match the backend API documentation. */

export type FormStatus = "draft" | "published" | "archived"

import type {
    IFormTheme,
    IThemeBackgroundImage,
    IThemeFont,
    ContentAlignment,
    FontSize,
    CornerRadius,
    ThemeFontSource,
    EndPage,
    EndPageButton,
    EndPageRedirect,
    EndPageEmbed,
    EndPageEmbedProvider,
    EndPageSocialShareMedia,
} from "@/shared/types/common"

export type {
    IFormTheme,
    IThemeBackgroundImage,
    IThemeFont,
    ContentAlignment,
    FontSize,
    CornerRadius,
    ThemeFontSource,
    EndPage,
    EndPageButton,
    EndPageRedirect,
    EndPageEmbed,
    EndPageEmbedProvider,
    EndPageSocialShareMedia,
}

export type FormTheme = IFormTheme

export interface FormSettings {
    oneQuestionAtATime: boolean
    showProgressBar: boolean
    allowMultipleSubmissions: boolean
    requireLogin: boolean
    collectIP: boolean
}

export interface Form {
    id: string
    title: string
    slug: string
    status: FormStatus
    theme: FormTheme
    settings: FormSettings
    createdBy: string
    updatedBy?: string
    pages: FormPage[]
    endPages?: EndPage[]
    createdAt: string
    updatedAt: string
    draftVersionId?: string
    publishedVersionId?: string | null
    hasUnpublishedChanges?: boolean
    version?: number
    responses_count?: number
}

export interface PublishedForm {
    id: string
    title: string
    slug: string
    status: FormStatus
    formVersionId: string
    version: number
    pages: FormPage[]
    endPages?: EndPage[]
    theme: FormTheme
    settings: FormSettings
    /** Form-level logic rules (branching / display / calculations). */
    logic?: FormLogic[]
}

export interface CreateFormRequest {
    title: string
}

export interface UpdateFormRequest {
    title?: string
}

export interface FormSlug {
    slug: string
    publicUrl: string
}

export interface FormShare {
    formId: string
    publicUrl: string
    isPublic: boolean
    password: string
    expiresAt?: string
    createdAt: string
    updatedAt: string
}

export interface UpdateFormShareRequest {
    isPublic?: boolean
    password?: string
    expiresAt?: string
}

export interface UpdateFormSettingsRequest {
    oneQuestionAtATime?: boolean
    showProgressBar?: boolean
    allowMultipleSubmissions?: boolean
    requireLogin?: boolean
    collectIP?: boolean
}

export type UpdateFormThemeRequest = IFormTheme

// ---------------------------------------------------------------------------
// Grouped form settings (edited on the FormSettings page)
//
// These live inside `FormVersion.formSchema.settings` alongside the legacy flat
// flags above. Reads/writes always target the draft version; every write sets
// `hasUnpublishedChanges = true` while a published version exists.
// ---------------------------------------------------------------------------

export interface GeneralSettingsValues {
    show_progress_bar: boolean
    initial_loader: boolean
    navigation_arrows: boolean
    refill_link: { isActive: boolean; link: string }
    show_powered_by_company_name: boolean
    anonymous_survey: boolean
}

export interface EmailSettingsValues {
    receive_email_notification: boolean
    multiple_recipients: { isActive: boolean; emails: string[] }
    reply_to: {
        automatic_first_email_field: boolean
        custom_email: { isActive: boolean; address: string }
    }
    email_subject: string
    email_body: string
}

export type DetectionMethod = "cookie" | "ip" | "cookie_ip"
export type ResponseLimitType = "single" | "multiple"
export type ResponseLimitPeriod = "day" | "month" | "year" | "lifetime"

export interface AccessSettingsValues {
    close_form: boolean
    close_form_by_date: { isActive: boolean; date: string | null }
    close_form_by_submissions: { isActive: boolean; submissions: number }
    auto_refresh_inactivity: { isActive: boolean; minutes: number }
    preventDuplicateSubmissions: boolean
    detectionMethod: DetectionMethod
    responseLimit: {
        type: ResponseLimitType
        count: number
        period: ResponseLimitPeriod
    }
}

export interface HiddenField {
    key: string
    value: string
}

export interface HiddenFieldsSettings {
    enabled: boolean
    fields: HiddenField[]
}

export type VariableType = "text" | "number"

export interface FormVariable {
    name: string
    type: VariableType
    value: string | number | boolean
}

/** The full normalized settings object returned by GET /forms/:id/settings. */
export interface GroupedFormSettings extends FormSettings {
    general?: GeneralSettingsValues
    emailSettings?: EmailSettingsValues
    access?: AccessSettingsValues
    hiddenFields?: HiddenFieldsSettings
    variables?: FormVariable[]
}

/** Envelope `data` for GET /forms/:id/settings. */
export interface FormSettingsResponse {
    formId: string
    settings: GroupedFormSettings
    hasUnpublishedChanges: boolean
}

// Per-section PATCH bodies. Missing fields are kept from the current draft.
export type UpdateGeneralSettingsRequest = Partial<GeneralSettingsValues>
export type UpdateEmailSettingsRequest = Partial<EmailSettingsValues>
export type UpdateAccessSettingsRequest = Partial<AccessSettingsValues>
/** `fields` is replaced wholesale. */
export type UpdateHiddenFieldsRequest = HiddenFieldsSettings
/** `variables` is replaced wholesale. */
export interface UpdateVariablesRequest {
    variables: FormVariable[]
}

// ---------------------------------------------------------------------------
// Pages
// ---------------------------------------------------------------------------

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

export interface PageOption {
    label?: string
    value?: string
}

export interface PageCoverImage {
    url: string
    fileId?: string
    alt?: string
}

export interface PageEmailSettings {
    businessEmailsOnly: boolean
    emailVerification: boolean
}

export interface PagePhoneSettings {
    phoneVerification: boolean
    countryCodeMode: "auto" | "specific"
    defaultCountry?: { iso2: string; name: string; dialCode: string } | null
}

export interface PageStatementSettings {
    embedUrl: string
    embedProvider: "youtube" | "loom" | "vimeo" | "pdf" | "image" | "other"
    embedTitle: string
}

export interface PageChoiceSettings {
    allowOther: boolean
    otherLabel: string
    horizontalAlign: boolean
    optionsPerRow: { desktop: number; mobile: number }
    hideLabels: boolean
    selectionLimit?: { mode: "none" | "exact" | "range"; exact?: number; min?: number; max?: number }
}

export interface PageAddressSettings {
    pages: Array<{
        key: "address1" | "address2" | "city" | "state" | "zip" | "country"
        label: string
        placeholder: string
        required: boolean
        hidden: boolean
        order: number
    }>
}

export interface PageRatingSettings {
    style: "star" | "number"
    max: number
}

export interface PageOpinionScaleSettings {
    min: number
    max: number
    leftLabel: string
    rightLabel: string
}

export interface PageUploadSettings {
    allowMultiple: boolean
    allowedFileTypes: string[]
    maxFileSizeMb: number
}

export interface PageMatrixSettings {
    rows: Array<{ key: string; label: string; order: number }>
    columns: Array<{ key: string; label: string; order: number }>
    allowMultiplePerRow: boolean
}

export interface PageSettings {
    email?: PageEmailSettings
    phone?: PagePhoneSettings
    statement?: PageStatementSettings
    choice?: PageChoiceSettings
    address?: PageAddressSettings
    rating?: PageRatingSettings
    opinionScale?: PageOpinionScaleSettings
    upload?: PageUploadSettings
    matrix?: PageMatrixSettings
}

export interface PageValidation {
    minLength?: number
    maxLength?: number
    min?: number
    max?: number
    pattern?: string
    message?: string
}

export interface PageLogic {
    whenPageKey?: string
    operator?: "equals" | "notEquals" | "contains" | "greaterThan" | "lessThan"
    value?: unknown
    action?: "show" | "hide" | "goToPage" | "goToEnd"
    targetPageKey?: string
}

export interface PageAppearance {
    width: "full" | "half"
    icon: string
    submitButtonText?: string
    submitButtonColor?: string
}

export interface FormPage {
    _id: string
    formId: string
    pageKey: string
    label: string
    helperText: string
    placeholder: string
    type: PageType
    required: boolean
    order: number
    options: PageOption[]
    validation?: PageValidation
    logic: PageLogic[]
    appearance: PageAppearance
    isActive: boolean
    coverImage?: PageCoverImage | null
    settings?: PageSettings
    createdAt: string
    updatedAt: string
}

export interface CreatePageRequest {
    type: PageType
    label: string
    helperText?: string
    placeholder?: string
    required?: boolean
    options?: PageOption[]
    validation?: PageValidation
    appearance?: PageAppearance
    coverImage?: PageCoverImage | null
    settings?: PageSettings
}

export interface UpdatePageRequest {
    label?: string
    helperText?: string
    placeholder?: string
    required?: boolean
    options?: PageOption[]
    validation?: PageValidation
    appearance?: PageAppearance
    coverImage?: PageCoverImage | null
    settings?: PageSettings
}

export interface ReorderPagesRequest {
    pageIds: string[]
}

export interface UpdatePageLogicRequest {
    logic: PageLogic[]
}

// ---------------------------------------------------------------------------
// End Pages
// ---------------------------------------------------------------------------

export interface CreateEndPageRequest {
    title?: string
    helperText?: string
    paragraph?: string
    coverImage?: PageCoverImage | null
    embed?: EndPageEmbed
    alignment?: ContentAlignment
    button?: EndPageButton
    redirect?: EndPageRedirect
    showConfetti?: boolean
    socialShareButtons?: boolean
    socialShareMessage?: string
    socialShareMedia?: EndPageSocialShareMedia
}

export interface UpdateEndPageRequest {
    title?: string
    helperText?: string
    paragraph?: string
    coverImage?: PageCoverImage | null
    embed?: EndPageEmbed
    alignment?: ContentAlignment
    button?: EndPageButton
    redirect?: EndPageRedirect
    showConfetti?: boolean
    socialShareButtons?: boolean
    socialShareMessage?: string
    socialShareMedia?: EndPageSocialShareMedia
}

export interface ReorderEndPagesRequest {
    endPageIds: string[]
}

// ---------------------------------------------------------------------------
// Blocks
// ---------------------------------------------------------------------------

export interface FormBlock {
    id: string
    formId: string
    title: string
    description: string
    type: string
    order: number
    createdAt: string
    updatedAt: string
}

export interface CreateBlockRequest {
    title: string
    description?: string
    type?: string
}

export interface UpdateBlockRequest {
    title?: string
    description?: string
}

export interface ReorderBlocksRequest {
    blockIds: string[]
}

// ---------------------------------------------------------------------------
// Logic (form-level)
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

export type LogicCategory = "display" | "hidePage" | "branching" | "calculation"
export type LogicSourceType = "page" | "variable"
export type LogicCombinator = "and" | "or"
export type LogicActionType =
    | "showPage"
    | "hidePage"
    | "jumpToPage"
    | "goToEnd"
    | "setVariable"

export interface LogicCondition {
    sourceType: LogicSourceType
    /** Page key or variable name the condition reads from. */
    sourceKey: string
    operator: LogicOperator
    value?: unknown
    /** How this condition joins to the previous one (ignored on the first). */
    combinator?: LogicCombinator
}

export interface LogicActionItem {
    action: LogicActionType
    targetPageKey?: string
    variableName?: string
    expression?: string
    value?: unknown
}

export interface FormLogic {
    id: string
    formId?: string
    category: LogicCategory
    name?: string
    enabled: boolean
    combinator: LogicCombinator
    conditions: LogicCondition[]
    actions: LogicActionItem[]
    order?: number
    createdAt: string
    updatedAt: string
}

export interface CreateLogicRequest {
    category?: LogicCategory
    name?: string
    enabled?: boolean
    combinator?: LogicCombinator
    conditions: LogicCondition[]
    actions: LogicActionItem[]
    order?: number
}

export interface UpdateLogicRequest {
    category?: LogicCategory
    name?: string
    enabled?: boolean
    combinator?: LogicCombinator
    conditions?: LogicCondition[]
    actions?: LogicActionItem[]
    order?: number
}