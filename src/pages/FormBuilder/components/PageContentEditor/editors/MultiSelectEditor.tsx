import { ListChecks, Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { FormField } from "@/shared/types/common"

interface EditorProps {
    page: FormField
    pageIndex: number
    onUpdate: (index: number, updates: Partial<FormField>) => void
}

export function MultiSelectEditor({ page, pageIndex, onUpdate }: EditorProps) {
    return (
        <div className="space-y-3">
            <Label className="text-xs text-muted-foreground">Options</Label>
            {page.options.map((opt, optIndex) => (
                <div key={optIndex} className="flex items-center gap-2">
                    <ListChecks className="h-4 w-4 text-muted-foreground shrink-0" />
                    <Input
                        value={opt.label}
                        onChange={(e) => {
                            const newOpts = [...page.options]
                            newOpts[optIndex] = {
                                label: e.target.value,
                                value: e.target.value.toLowerCase().replace(/\s+/g, "_"),
                            }
                            onUpdate(pageIndex, { options: newOpts })
                        }}
                        placeholder="Option label"
                        className="flex-1"
                    />
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0"
                        onClick={() => {
                            const newOpts = page.options.filter((_, i) => i !== optIndex)
                            onUpdate(pageIndex, { options: newOpts })
                        }}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            ))}
            <Button
                variant="outline"
                size="sm"
                onClick={() => {
                    onUpdate(pageIndex, {
                        options: [...page.options, { label: "", value: "" }],
                    })
                }}
            >
                <Plus className="mr-2 h-4 w-4" />
                Add Option
            </Button>
        </div>
    )
}
