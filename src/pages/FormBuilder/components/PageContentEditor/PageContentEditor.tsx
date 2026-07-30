import { FileText } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { FIELD_TYPE_LABELS, FIELD_TYPE_ICONS } from "@/shared/constants/form-types"
import type { FormField } from "@/shared/types/common"
import type { LucideIcon } from "lucide-react"

import {
    ShortTextEditor,
    LongTextEditor,
    EmailEditor,
    PhoneEditor,
    NumberEditor,
    DateEditor,
    TimeEditor,
    UrlEditor,
    FileEditor,
    RatingEditor,
    YesNoEditor,
    RadioEditor,
    CheckboxEditor,
    SelectEditor,
    MultiSelectEditor,
} from "./editors"
import { cn } from "@/lib/utils"

interface PageContentEditorProps {
    page: FormField
    pageIndex: number
    onUpdate: (index: number, updates: Partial<FormField>) => void
    isMobileView: boolean
}

const editorMap: Record<string, React.ComponentType<{ page: FormField; pageIndex: number; onUpdate: (index: number, updates: Partial<FormField>) => void }>> = {
    shortText: ShortTextEditor,
    longText: LongTextEditor,
    email: EmailEditor,
    phone: PhoneEditor,
    number: NumberEditor,
    date: DateEditor,
    time: TimeEditor,
    url: UrlEditor,
    file: FileEditor,
    rating: RatingEditor,
    yesNo: YesNoEditor,
    radio: RadioEditor,
    checkbox: CheckboxEditor,
    select: SelectEditor,
    multiSelect: MultiSelectEditor,

}

export function PageContentEditor({
    page,
    pageIndex,
    onUpdate,
    isMobileView,
}: PageContentEditorProps) {
    const PageIcon: LucideIcon = FIELD_TYPE_ICONS[page.type as keyof typeof FIELD_TYPE_ICONS] || FileText
    const FieldEditor = editorMap[page.type]

    return (
        <div className="w-full h-3/4 flex flex-col">
            {/* Editor Content */}
            <div className={cn("flex-1 overflow-y-auto")}>
                <div
                    className={cn("mx-auto space-y-6 transition-all duration-500 ease-in-out px-6", isMobileView ? "w-full " : "w-11/12")}
                >
                    <div className="flex items-center gap-2 mb-2">
                        <PageIcon className="h-5 w-5 text-muted-foreground" />
                        <Badge variant="secondary">
                            {FIELD_TYPE_LABELS[page.type as keyof typeof FIELD_TYPE_LABELS] || page.type}
                        </Badge>
                        {page.required && (
                            <Badge variant="destructive" className="text-[10px] text-white">Required</Badge>
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

                    {/* Field-specific editor */}
                    {FieldEditor && (
                        <FieldEditor
                            page={page}
                            pageIndex={pageIndex}
                            onUpdate={onUpdate}
                        />
                    )}

                    {/* Submit button preview */}
                    <div className="pt-2">
                        <Button
                            size="lg"
                            className="w-full sm:w-auto"
                            style={
                                page.appearance.submitButtonColor
                                    ? { backgroundColor: page.appearance.submitButtonColor }
                                    : undefined
                            }
                        >
                            {page.appearance.submitButtonText || "Submit"}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
