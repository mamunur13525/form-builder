import { cn } from "@/lib/utils"
import { VariableEditable } from "./VariableEditable"
import { renderVariableText, type VariableItem } from "./formVariables"

interface PageHelperTextProps {
    helperText?: string
    editable?: boolean
    onUpdate?: (helperText: string) => void
    color?: string
    fontSizeClass?: string
    /** Variables offered in the `@` menu (editable) and resolved (render). */
    variables?: VariableItem[]
}

export function PageHelperText({
    helperText,
    editable,
    onUpdate,
    color,
    fontSizeClass,
    variables = [],
}: PageHelperTextProps) {
    const sizeClass = fontSizeClass || "text-[18px]"

    if (!helperText && !editable) return null

    if (editable) {
        return (
            <div className="w-full space-y-1 mt-1">
                <VariableEditable
                    value={helperText || ""}
                    onCommit={(next) => onUpdate?.(next)}
                    variables={variables}
                    ariaLabel="Description"
                    placeholder="Description (optional)"
                    className={cn(
                        sizeClass,
                        "text-muted-foreground outline-none border-0 border-transparent pb-1 transition-colors cursor-text",
                    )}
                    style={color ? { color } : undefined}
                />
            </div>
        )
    }

    if (!helperText) return null

    return (
        <div className="w-full space-y-1 mt-1">
            <p
                className={cn(sizeClass, "w-full text-muted-foreground pb-1")}
                style={color ? { color } : undefined}
            >
                {renderVariableText(helperText, variables)}
            </p>
        </div>
    )
}
