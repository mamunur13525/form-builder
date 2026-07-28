import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import type { FormField } from "@/shared/types/common"

interface EditorProps {
    page: FormField
    pageIndex: number
    onUpdate: (index: number, updates: Partial<FormField>) => void
}

export function RatingEditor({ page, pageIndex, onUpdate }: EditorProps) {
    return (
        <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Rating Preview</Label>
            <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Button key={star} variant="outline" size="icon" className="h-12 w-12 text-lg">
                        {star}
                    </Button>
                ))}
            </div>
        </div>
    )
}
