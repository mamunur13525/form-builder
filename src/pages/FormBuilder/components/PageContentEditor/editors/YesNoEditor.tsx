import type { FormField } from "@/shared/types/common";
import { YesNoField } from "@/shared/components/fields";

interface EditorProps {
    page: FormField
    pageIndex: number
    onUpdate: (index: number, updates: Partial<FormField>) => void
    color?: string
    fontSizeClass?: string
}

export function YesNoEditor({ color, fontSizeClass }: EditorProps) {
    return (
        <div className="space-y-2">
            <YesNoField color={color} fontSizeClass={fontSizeClass} />
        </div>
    )
}
