import { cn } from "@/lib/utils"
import { VariableEditable } from "./VariableEditable"
import { renderVariableText, type VariableItem } from "./formVariables"

interface PageLabelProps {
    label: string
    pageNumber?: number
    editable?: boolean
    onUpdate?: (label: string) => void
    color?: string
    fontSizeClass?: string
    /** Variables offered in the `@` menu (editable) and resolved (render). */
    variables?: VariableItem[]
}

export function PageLabel({
    label,
    pageNumber,
    editable,
    onUpdate,
    color,
    fontSizeClass,
    variables = [],
}: PageLabelProps) {
    const sizeClass = fontSizeClass || "text-[26px]"

    if (editable) {
        return (
            <div className="w-full relative space-y-1">
                {pageNumber !== undefined && (
                    <span className="absolute right-[102%] top-2 text-xs font-bold text-muted select-none bg-gray-900 px-1 rounded">
                        {pageNumber}
                    </span>
                )}
                <VariableEditable
                    value={label}
                    onCommit={(next) => onUpdate?.(next)}
                    variables={variables}
                    ariaLabel="Question"
                    placeholder="Type your question... Use @ to recall information."
                    className={cn(
                        sizeClass,
                        "outline-none border-0 border-transparent pb-1 transition-colors cursor-text",
                    )}
                    style={color ? { color } : undefined}
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
                {renderVariableText(label, variables)}
            </h2>
        </div>
    )
}
