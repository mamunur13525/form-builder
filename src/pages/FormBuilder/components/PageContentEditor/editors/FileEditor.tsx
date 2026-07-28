import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Upload } from "lucide-react"
import type { FormField } from "@/shared/types/common"

interface EditorProps {
    page: FormField
    pageIndex: number
    onUpdate: (index: number, updates: Partial<FormField>) => void
}

export function FileEditor({ page, pageIndex, onUpdate }: EditorProps) {
    return (
        <div className="space-y-3">
            <Label className="text-xs text-muted-foreground">File Upload Preview</Label>
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Click or drag files to upload</p>
            </div>
        </div>
    )
}
