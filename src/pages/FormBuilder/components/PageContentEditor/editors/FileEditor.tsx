import type { FormPage } from "@/shared/types/common";
import { FilePage } from "@/shared/components/pages";

interface EditorProps {
    page: FormPage
    pageIndex: number
    onUpdate: (index: number, updates: Partial<FormPage>) => void
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function FileEditor(_props: EditorProps) {
    return (
        <div className="space-y-3">
            <FilePage />
        </div>
    )
}