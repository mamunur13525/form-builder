import { CircleDot } from "lucide-react"
import type { FormField } from "@/shared/types/common"
import { OptionListEditor } from "./OptionListEditor"

interface EditorProps {
    page: FormField
    pageIndex: number
    onUpdate: (index: number, updates: Partial<FormField>) => void
    isMobileView?: boolean
}

export function RadioEditor(props: EditorProps) {
    return <OptionListEditor {...props} icon={CircleDot} />
}
