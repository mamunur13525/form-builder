interface FieldLabelProps {
    label: string
    pageNumber?: number
    editable?: boolean
    onUpdate?: (label: string) => void
}

export function FieldLabel({ label, pageNumber, editable, onUpdate }: FieldLabelProps) {
    if (editable) {
        return (
            <div className="relative space-y-1">
                {pageNumber !== undefined && (
                    <span className="absolute right-[102%] top-2 text-xs font-bold text-muted select-none bg-gray-900 px-1 rounded">
                        {pageNumber}
                    </span>
                )}
                <div
                    contentEditable
                    suppressContentEditableWarning
                    data-placeholder="Type your question... Use @ to recall information."
                    className="text-[26px] outline-none border-b border-transparent focus:border-primary pb-1 transition-colors cursor-text"
                    onBlur={(e) =>
                        onUpdate?.(e.currentTarget.textContent || "")
                    }
                    dangerouslySetInnerHTML={{ __html: label }}
                />
            </div>
        )
    }

    return (
        <div className="relative space-y-1">
            {pageNumber !== undefined && (
                <span className="absolute right-[102%] top-2 text-xs font-bold text-muted select-none bg-gray-900 px-1 rounded">
                    {pageNumber}
                </span>
            )}
            <h2 className="text-[26px] outline-none border-b border-transparent pb-1">
                {label}
            </h2>
        </div>
    )
}