import type { FormPage } from "@/shared/types/common";
import { RatingPage } from "@/shared/components/pages";

interface EditorProps {
    page: FormPage
    pageIndex: number
    onUpdate: (index: number, updates: Partial<FormPage>) => void
    color?: string
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function RatingEditor({ color }: EditorProps) {
    return (
        <div className="space-y-2">
            <RatingPage color={color} />
        </div>
    )
}