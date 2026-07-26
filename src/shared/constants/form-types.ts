import {
    Type,
    AlignLeft,
    Mail,
    Phone,
    Hash,
    Calendar,
    Clock,
    CircleDot,
    CheckSquare,
    List,
    ListChecks,
    Upload,
    Star,
    ThumbsUp,
    Link,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

export const FIELD_TYPES = [
    "shortText",
    "longText",
    "email",
    "phone",
    "number",
    "date",
    "time",
    "radio",
    "checkbox",
    "select",
    "multiSelect",
    "file",
    "rating",
    "yesNo",
    "url",
] as const

export type FieldType = (typeof FIELD_TYPES)[number]

export const FIELD_TYPE_LABELS: Record<FieldType, string> = {
    shortText: "Short Text",
    longText: "Long Text",
    email: "Email",
    phone: "Phone",
    number: "Number",
    date: "Date",
    time: "Time",
    radio: "Radio",
    checkbox: "Checkbox",
    select: "Select",
    multiSelect: "Multi Select",
    file: "File Upload",
    rating: "Rating",
    yesNo: "Yes/No",
    url: "URL",
}

export const FIELD_TYPE_ICONS: Record<FieldType, LucideIcon> = {
    shortText: Type,
    longText: AlignLeft,
    email: Mail,
    phone: Phone,
    number: Hash,
    date: Calendar,
    time: Clock,
    radio: CircleDot,
    checkbox: CheckSquare,
    select: List,
    multiSelect: ListChecks,
    file: Upload,
    rating: Star,
    yesNo: ThumbsUp,
    url: Link,
}

export const FORM_STATUS = ["draft", "published", "archived"] as const
export type FormStatus = (typeof FORM_STATUS)[number]