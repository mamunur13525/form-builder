import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { FormField } from "@/shared/types/common"

interface EditorProps {
    page: FormField
    pageIndex: number
    onUpdate: (index: number, updates: Partial<FormField>) => void
}

export function LongTextEditor({ page, pageIndex, onUpdate }: EditorProps) {
    return (
        <div className="space-y-1">
            <Label className="text-base text-muted-foreground">Placeholder</Label>
            <Textarea
                value={page.placeholder}
                onChange={(e) => onUpdate(pageIndex, { placeholder: e.target.value })}
                placeholder="Placeholder text..."
                rows={3}
            />
        </div>
    )
}
