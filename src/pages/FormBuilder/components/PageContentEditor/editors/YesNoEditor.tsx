import type { FormField } from "@/shared/types/common";
import { YesNoField } from "@/shared/components/fields";

interface EditorProps {
    page: FormField
    pageIndex: number
    onUpdate: (index: number, updates: Partial<FormField>) => void
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function YesNoEditor(_props: EditorProps) {
    return (
        <div className="space-y-2">
            <YesNoField />
        </div>
    )
}