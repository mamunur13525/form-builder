import type { FormField } from "@/shared/types/common";
import { RatingField } from "@/shared/components/fields";

interface EditorProps {
    page: FormField
    pageIndex: number
    onUpdate: (index: number, updates: Partial<FormField>) => void
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function RatingEditor(_props: EditorProps) {
    return (
        <div className="space-y-2">
            <RatingField />
        </div>
    )
}