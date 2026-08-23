import type { FormPage } from "@/shared/types/common";
import { YesNoPage } from "@/shared/components/pages";

interface EditorProps {
    page: FormPage
    pageIndex: number
    onUpdate: (index: number, updates: Partial<FormPage>) => void
    color?: string
    fontSizeClass?: string
}

export function YesNoEditor({ color, fontSizeClass }: EditorProps) {
    return (
        <div className="space-y-2">
            <YesNoPage color={color} fontSizeClass={fontSizeClass} />
        </div>
    )
}
