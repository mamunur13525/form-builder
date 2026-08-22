import { CircleDot } from "lucide-react"
import type { FormPage } from "@/shared/types/common"
import { OptionListEditor } from "./OptionListEditor"

interface EditorProps {
    page: FormPage
    pageIndex: number
    onUpdate: (index: number, updates: Partial<FormPage>) => void
    isMobileView?: boolean
}

export function RadioEditor(props: EditorProps) {
    return <OptionListEditor {...props} icon={CircleDot} />
}
