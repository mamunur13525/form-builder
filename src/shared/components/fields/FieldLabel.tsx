import { cn } from "@/lib/utils"

interface FieldLabelProps {
    label: string
    pageNumber?: number
    editable?: boolean
    onUpdate?: (label: string) => void
    color?: string
    fontSizeClass?: string
}

export function FieldLabel({ label, pageNumber, editable, onUpdate, color, fontSizeClass }: FieldLabelProps) {
    const sizeClass = fontSizeClass || "text-[26px]"

    if (editable) {
        return (
            <div className="w-full relative space-y-1">
                {pageNumber !== undefined && (
                    <span className="absolute right-[102%] top-2 text-xs font-bold text-muted select-none bg-gray-900 px-1 rounded">
                        {pageNumber}
                    </span>
                )}
                <div
                    contentEditable
                    suppressContentEditableWarning
                    data-placeholder="Type your question... Use @ to recall information."
                    className={cn(sizeClass, "outline-none border-b border-transparent focus:border-primary pb-1 transition-colors cursor-text font-semibold")}
                    style={color ? { color } : undefined}
                    onBlur={(e) =>
                        onUpdate?.(e.currentTarget.textContent || "")
                    }
                    dangerouslySetInnerHTML={{ __html: label }}
                />
            </div>
        )
    }

    return (
        <div className="w-full relative space-y-1">
            {pageNumber !== undefined && (
                <span className="absolute right-[102%] top-2 text-xs font-bold text-muted select-none bg-gray-900 px-1 rounded">
                    {pageNumber}
                </span>
            )}
            <h2
                className={cn(sizeClass, "outline-none border-b border-transparent pb-1 font-semibold")}
                style={color ? { color } : undefined}
            >
                {label}
            </h2>
        </div>
    )
}