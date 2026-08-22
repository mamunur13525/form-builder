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

export type LogicOperator = "equals" | "notEquals" | "contains" | "greaterThan" | "lessThan"
export type LogicAction = "show" | "hide" | "goToPage" | "goToEnd" | "skipTo"

export interface LogicCondition {
    pageKey: string
    operator: LogicOperator
    value: unknown
}

export interface LogicActionItem {
    action: LogicAction
    target?: string
}

export interface FormLogic {
    id: string
    formId: string
    conditions: LogicCondition[]
    actions: LogicActionItem[]
    createdAt: string
    updatedAt: string
}

export interface CreateLogicRequest {
    conditions: LogicCondition[]
    actions: LogicActionItem[]
}

export interface UpdateLogicRequest {
    conditions?: LogicCondition[]
    actions?: LogicActionItem[]
}