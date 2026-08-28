import { createElement, type CSSProperties } from "react"
import { cn } from "@/lib/utils"
import { renderVariableSegments } from "./variableTokens"
import type { VariableItem } from "./formVariables"

interface VariableTextProps {
    /** Text that may contain `@variable_name` tokens. */
    text: string
    /** Variables whose tokens should be highlighted. */
    variables?: VariableItem[]
    /** Element to render (defaults to `span`). */
    as?: "span" | "p" | "h2"
    className?: string
    style?: CSSProperties
}

/**
 * Render text with `@variable` tokens highlighted as coloured chips. Used by
 * non-editable `PageLabel` / `PageHelperText` when callers opt into
 * `highlightVariables` (e.g. the Logic Builder page nodes).
 */
export function VariableText({
    text,
    variables = [],
    as = "span",
    className,
    style,
}: VariableTextProps) {
    return createElement(
        as,
        { className: cn(className), style },
        renderVariableSegments(text, variables),
    )
}
