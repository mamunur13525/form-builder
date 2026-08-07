import { cn } from "@/lib/utils"

interface FieldHelperTextProps {
    helperText?: string
    editable?: boolean
    onUpdate?: (helperText: string) => void
    color?: string
    fontSizeClass?: string
}

export function FieldHelperText({ helperText, editable, onUpdate, color, fontSizeClass }: FieldHelperTextProps) {
    const sizeClass = fontSizeClass || "text-[18px]"

    if (!helperText && !editable) return null

    if (editable) {
        return (
            <div className="space-y-1 mt-1">
                <div
                    contentEditable
                    suppressContentEditableWarning
                    data-placeholder="Description (optional)"
                    className={cn(sizeClass, "text-muted-foreground outline-none border-b border-transparent focus:border-primary pb-1 transition-colors cursor-text")}
                    style={color ? { color } : undefined}
                    onBlur={(e) =>
                        onUpdate?.(e.currentTarget.textContent || "")
                    }
                    dangerouslySetInnerHTML={{ __html: helperText || "" }}
                />
            </div>
        )
    }

    if (!helperText) return null

    return (
        <div className="space-y-1 mt-1">
            <p
                className={cn(sizeClass, "text-muted-foreground pb-1")}
                style={color ? { color } : undefined}
            >
                {helperText}
            </p>
        </div>
    )
}