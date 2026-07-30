interface FieldHelperTextProps {
    helperText?: string
    editable?: boolean
    onUpdate?: (helperText: string) => void
}

export function FieldHelperText({ helperText, editable, onUpdate }: FieldHelperTextProps) {
    if (!helperText && !editable) return null

    if (editable) {
        return (
            <div className="space-y-1 mt-1">
                <div
                    contentEditable
                    suppressContentEditableWarning
                    data-placeholder="Description (optional)"
                    className="text-[18px] text-muted-foreground outline-none border-b border-transparent focus:border-primary pb-1 transition-colors cursor-text"
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
            <p className="text-[18px] text-muted-foreground pb-1">
                {helperText}
            </p>
        </div>
    )
}