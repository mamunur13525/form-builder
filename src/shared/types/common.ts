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
}

export interface Theme {
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