import type { FormField } from "@/shared/types/common";
import { FileField } from "@/shared/components/fields";

interface EditorProps {
    page: FormField
    pageIndex: number
    onUpdate: (index: number, updates: Partial<FormField>) => void
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function FileEditor(_props: EditorProps) {
    return (
        <div className="space-y-3">
            <FileField />
        </div>
    )
}