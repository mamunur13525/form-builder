import { List } from "lucide-react"
import type { FormPage } from "@/shared/types/common"
import { OptionListEditor } from "./OptionListEditor"

interface EditorProps {
    page: FormPage
    pageIndex: number
    onUpdate: (index: number, updates: Partial<FormPage>) => void
    isMobileView?: boolean
}

export function SelectEditor(props: EditorProps) {
    return <OptionListEditor {...props} icon={List} />
}
