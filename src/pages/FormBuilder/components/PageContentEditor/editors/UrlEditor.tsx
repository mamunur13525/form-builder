import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import type { FormField } from "@/shared/types/common"

interface EditorProps {
    page: FormField
    pageIndex: number
    onUpdate: (index: number, updates: Partial<FormField>) => void
}

export function UrlEditor({ page, pageIndex, onUpdate }: EditorProps) {
    return (
        <div className="space-y-1">
            <Label className="text-base text-muted-foreground">Placeholder</Label>
            <Input
                value={page.placeholder}
                onChange={(e) => onUpdate(pageIndex, { placeholder: e.target.value })}
                placeholder="https://example.com"
            />
        </div>
    )
}
