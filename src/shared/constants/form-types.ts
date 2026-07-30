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

export const FIELD_TYPE_COLORS: Record<FieldType, string> = {
    shortText: "from-blue-500/20 to-blue-600/10 text-blue-600 dark:text-blue-400",
    longText: "from-sky-500/20 to-sky-600/10 text-sky-600 dark:text-sky-400",
    email: "from-violet-500/20 to-violet-600/10 text-violet-600 dark:text-violet-400",
    phone: "from-emerald-500/20 to-emerald-600/10 text-emerald-600 dark:text-emerald-400",
    number: "from-amber-500/20 to-amber-600/10 text-amber-600 dark:text-amber-400",
    date: "from-rose-500/20 to-rose-600/10 text-rose-600 dark:text-rose-400",
    time: "from-cyan-500/20 to-cyan-600/10 text-cyan-600 dark:text-cyan-400",
    radio: "from-orange-500/20 to-orange-600/10 text-orange-600 dark:text-orange-400",
    checkbox: "from-indigo-500/20 to-indigo-600/10 text-indigo-600 dark:text-indigo-400",
    select: "from-teal-500/20 to-teal-600/10 text-teal-600 dark:text-teal-400",
    multiSelect: "from-purple-500/20 to-purple-600/10 text-purple-600 dark:text-purple-400",
    file: "from-pink-500/20 to-pink-600/10 text-pink-600 dark:text-pink-400",
    rating: "from-yellow-500/20 to-yellow-600/10 text-yellow-600 dark:text-yellow-400",
    yesNo: "from-green-500/20 to-green-600/10 text-green-600 dark:text-green-400",
    url: "from-slate-500/20 to-slate-600/10 text-slate-600 dark:text-slate-400",
}

export const FORM_STATUS = ["draft", "published", "archived"] as const
export type FormStatus = (typeof FORM_STATUS)[number]