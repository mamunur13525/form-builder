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
    description: string
    slug: string
    status: FormStatus
    theme: FormTheme
    settings: FormSettings
    createdBy: string
    createdAt: string
    updatedAt: string
}

export interface CreateFormRequest {
    title: string
    description: string
}

export interface UpdateFormRequest {
    title?: string
    description?: string
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
    | "file"
    | "rating"
    | "yesNo"
    | "url"

export interface FieldOption {
    label?: string
    value?: string
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
    operator?: string
    value?: unknown
    action?: string
    targetFieldKey?: string
}

export interface FieldAppearance {
    width: "full" | "half"
    icon: string
}

export interface FormField {
    id: string
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
}

export interface UpdateFieldRequest {
    label?: string
    helperText?: string
    placeholder?: string
    required?: boolean
    options?: FieldOption[]
    validation?: FieldValidation
    appearance?: FieldAppearance
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
