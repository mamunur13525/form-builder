import { CircleDot, CheckSquare, Plus, X, FileText } from "lucide-react"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Label } from "../../../components/ui/label"
import { Badge } from "../../../components/ui/badge"
import { FIELD_TYPE_LABELS, FIELD_TYPE_ICONS } from "../../../shared/constants/form-types"
import type { FormField } from "../../../shared/types/common"
import type { LucideIcon } from "lucide-react"

interface PageContentEditorProps {
    page: FormField
    pageIndex: number
    onUpdate: (index: number, updates: Partial<FormField>) => void
}

export function PageContentEditor({
    page,
    pageIndex,
    onUpdate,
}: PageContentEditorProps) {
    const PageIcon: LucideIcon = FIELD_TYPE_ICONS[page.type as keyof typeof FIELD_TYPE_ICONS] || FileText

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-2 mb-2">
                <PageIcon className="h-5 w-5 text-muted-foreground" />
                <Badge variant="secondary">
                    {FIELD_TYPE_LABELS[page.type as keyof typeof FIELD_TYPE_LABELS] || page.type}
                </Badge>
                {page.required && (
                    <Badge variant="destructive" className="text-[10px]">Required</Badge>
                )}
            </div>

            {/* Editable Label */}
            <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Question</Label>
                <div
                    contentEditable
                    suppressContentEditableWarning
                    className="text-2xl font-bold outline-none border-b border-transparent focus:border-primary pb-1 transition-colors cursor-text"
                    onBlur={(e) => onUpdate(pageIndex, { label: e.currentTarget.textContent || "" })}
                    dangerouslySetInnerHTML={{ __html: page.label }}
                />
            </div>

            {/* Editable Helper Text */}
            <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Description / Helper Text</Label>
                <div
                    contentEditable
                    suppressContentEditableWarning
                    className="text-sm text-muted-foreground outline-none border-b border-transparent focus:border-primary pb-1 transition-colors cursor-text"
                    onBlur={(e) => onUpdate(pageIndex, { helperText: e.currentTarget.textContent || "" })}
                    dangerouslySetInnerHTML={{ __html: page.helperText || "Click to add description..." }}
                />
            </div>

            {/* Placeholder */}
            {(page.type === "shortText" || page.type === "longText" || page.type === "email" || page.type === "phone" || page.type === "number" || page.type === "url") && (
                <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Placeholder</Label>
                    <Input
                        value={page.placeholder}
                        onChange={(e) => onUpdate(pageIndex, { placeholder: e.target.value })}
                        placeholder="Placeholder text..."
                    />
                </div>
            )}

            {/* Options for choice-based fields */}
            {(page.type === "radio" || page.type === "checkbox" || page.type === "select" || page.type === "multiSelect") && (
                <div className="space-y-3">
                    <Label className="text-xs text-muted-foreground">Options</Label>
                    {page.options.map((opt, optIndex) => (
                        <div key={optIndex} className="flex items-center gap-2">
                            {page.type === "radio" || page.type === "select" ? (
                                <CircleDot className="h-4 w-4 text-muted-foreground shrink-0" />
                            ) : (
                                <CheckSquare className="h-4 w-4 text-muted-foreground shrink-0" />
                            )}
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
            )}

            {/* Rating preview */}
            {page.type === "rating" && (
                <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <Button key={star} variant="outline" size="icon" className="h-12 w-12 text-lg">
                            {star}
                        </Button>
                    ))}
                </div>
            )}

            {/* Yes/No preview */}
            {page.type === "yesNo" && (
                <div className="flex gap-3">
                    <Button variant="outline" className="px-8">Yes</Button>
                    <Button variant="outline" className="px-8">No</Button>
                </div>
            )}
        </div>
    )
}
