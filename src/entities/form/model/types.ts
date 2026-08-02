/** Form, field, block, logic, and share types that match the backend API documentation. */

export type FormStatus = "draft" | "published" | "archived"

export interface FormTheme {
    primaryColor: string
    backgroundColor: string
    textColor: string
}

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
    fields: FormField[]
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
    fields: FormField[]
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

export interface UpdateFormThemeRequest {
    primaryColor?: string
    backgroundColor?: string
    textColor?: string
}

// ---------------------------------------------------------------------------
// Fields
// ---------------------------------------------------------------------------

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

export interface FieldOption {
    label?: string
    value?: string
}

export interface FieldCoverImage {
    url: string
    fileId?: string
    alt?: string
}

export interface FieldEmailSettings {
    businessEmailsOnly: boolean
    emailVerification: boolean
}

export interface FieldPhoneSettings {
    phoneVerification: boolean
    countryCodeMode: "auto" | "specific"
    defaultCountry?: { iso2: string; name: string; dialCode: string } | null
}

export interface FieldStatementSettings {
    embedUrl: string
    embedProvider: "youtube" | "loom" | "vimeo" | "pdf" | "image" | "other"
    embedTitle: string
}

export interface FieldChoiceSettings {
    allowOther: boolean
    otherLabel: string
    horizontalAlign: boolean
    optionsPerRow: { desktop: number; mobile: number }
    hideLabels: boolean
    selectionLimit?: { mode: "none" | "exact" | "range"; exact?: number; min?: number; max?: number }
}

export interface FieldAddressSettings {
    fields: Array<{
        key: "address1" | "address2" | "city" | "state" | "zip" | "country"
        label: string
        placeholder: string
        required: boolean
        hidden: boolean
        order: number
    }>
}

export interface FieldRatingSettings {
    style: "star" | "number"
    max: number
}

export interface FieldOpinionScaleSettings {
    min: number
    max: number
    leftLabel: string
    rightLabel: string
}

export interface FieldUploadSettings {
    allowMultiple: boolean
    allowedFileTypes: string[]
    maxFileSizeMb: number
}

export interface FieldMatrixSettings {
    rows: Array<{ key: string; label: string; order: number }>
    columns: Array<{ key: string; label: string; order: number }>
    allowMultiplePerRow: boolean
}

export interface FieldSettings {
    email?: FieldEmailSettings
    phone?: FieldPhoneSettings
    statement?: FieldStatementSettings
    choice?: FieldChoiceSettings
    address?: FieldAddressSettings
    rating?: FieldRatingSettings
    opinionScale?: FieldOpinionScaleSettings
    upload?: FieldUploadSettings
    matrix?: FieldMatrixSettings
}

export interface FieldValidation {
    minLength?: number
    maxLength?: number
    min?: number
    max?: number
    pattern?: string
    message?: string
}

export interface FieldLogic {
    whenFieldKey?: string
    operator?: "equals" | "notEquals" | "contains" | "greaterThan" | "lessThan"
    value?: unknown
    action?: "show" | "hide" | "goToField" | "goToEnd"
    targetFieldKey?: string
}

export interface FieldAppearance {
    width: "full" | "half"
    icon: string
    submitButtonText?: string
    submitButtonColor?: string
}

export interface FormField {
    _id: string
    formId: string
    fieldKey: string
    label: string
    helperText: string
    placeholder: string
    type: FieldType
    required: boolean
    order: number
    options: FieldOption[]
    validation?: FieldValidation
    logic: FieldLogic[]
    appearance: FieldAppearance
    isActive: boolean
    coverImage?: FieldCoverImage | null
    settings?: FieldSettings
    createdAt: string
    updatedAt: string
}

export interface CreateFieldRequest {
    type: FieldType
    label: string
    helperText?: string
    placeholder?: string
    required?: boolean
    options?: FieldOption[]
    validation?: FieldValidation
    appearance?: FieldAppearance
    coverImage?: FieldCoverImage | null
    settings?: FieldSettings
}

export interface UpdateFieldRequest {
    label?: string
    helperText?: string
    placeholder?: string
    required?: boolean
    options?: FieldOption[]
    validation?: FieldValidation
    appearance?: FieldAppearance
    coverImage?: FieldCoverImage | null
    settings?: FieldSettings
}

export interface ReorderFieldsRequest {
    fieldIds: string[]
}

export interface UpdateFieldLogicRequest {
    logic: FieldLogic[]
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
export type LogicAction = "show" | "hide" | "goToField" | "goToEnd" | "skipTo"

export interface LogicCondition {
    fieldKey: string
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