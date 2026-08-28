import { createElement, type CSSProperties, type ReactNode } from "react"
import { createVariablePattern, type VariableItem } from "./formVariables"

/**
 * Chip styling for a recognised `@token` in rendered (non-editable) text: the
 * brand green on a light tint of itself, matching the highlight used by
 * `VariableEditable` so tokens read the same in editors and previews.
 */
export const VARIABLE_TOKEN_COLOR = "#51871a"
export const VARIABLE_TOKEN_CLASS = "rounded px-1 py-0.5 font-medium"

function tokenStyle(): CSSProperties {
    return {
        color: VARIABLE_TOKEN_COLOR,
        backgroundColor: `color-mix(in srgb, ${VARIABLE_TOKEN_COLOR} 16%, transparent)`,
    }
}

/**
 * Split `text` so every known `@variable_name` token becomes a coloured chip,
 * leaving unknown tokens and all other text as-is. Returns the plain string
 * when there is nothing to highlight.
 */
export function renderVariableSegments(
    text: string,
    variables: VariableItem[],
): ReactNode {
    if (!text) return text ?? ""
    const pattern = createVariablePattern(variables)
    if (!pattern) return text

    const parts: ReactNode[] = []
    let lastIndex = 0
    let key = 0
    for (const match of text.matchAll(pattern)) {
        const index = match.index ?? 0
        if (index > lastIndex) parts.push(text.slice(lastIndex, index))
        parts.push(
            createElement(
                "span",
                {
                    key: key++,
                    className: VARIABLE_TOKEN_CLASS,
                    style: tokenStyle(),
                    "data-variable-token": "true",
                },
                match[0],
            ),
        )
        lastIndex = index + match[0].length
    }
    if (lastIndex < text.length) parts.push(text.slice(lastIndex))
    return parts
}
