import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import type { FormField } from "@/shared/types/common"

interface EditorProps {
    page: FormField
    pageIndex: number
    onUpdate: (index: number, updates: Partial<FormField>) => void
}

export function YesNoEditor({ page, pageIndex, onUpdate }: EditorProps) {
    return (
        <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Yes/No Preview</Label>
            <div className="flex gap-3">
                <Button variant="outline" className="px-8">Yes</Button>
                <Button variant="outline" className="px-8">No</Button>
            </div>
        </div>
    )
}
