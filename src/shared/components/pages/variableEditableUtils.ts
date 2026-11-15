import { createVariablePattern, type VariableItem } from "./formVariables"

const TOKEN_COLOR = "#51871a"
const TOKEN_CLASS = "rounded px-1 py-0.5 font-medium"
const TOKEN_STYLE = [
    `color:${TOKEN_COLOR}`,
    `background-color:color-mix(in srgb, ${TOKEN_COLOR} 16%, transparent)`,
].join(";")

export function escapeHtml(value: string): string {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
}

/**
 * Wrap every known `@token` in a highlight chip, leaving all other text as-is.
 * Returns `null` when nothing would change, so callers can skip a DOM write.
 */
export function toHighlightedHtml(
    text: string,
    items: VariableItem[],
): string | null {
    const pattern = createVariablePattern(items)
    if (!pattern || !text) return null

    let found = false
    const html = escapeHtml(text).replace(pattern, (match) => {
        found = true
        return `<span class="${TOKEN_CLASS}" style="${TOKEN_STYLE}" data-variable-token="true">${match}</span>`
    })
    return found ? html : null
}

/** Caret position as a plain-text offset from the start of the element. */
export function getCaretOffset(el: HTMLElement): number | null {
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return null
    const range = selection.getRangeAt(0)
    if (!el.contains(range.startContainer)) return null

    const probe = document.createRange()
    probe.selectNodeContents(el)
    probe.setEnd(range.startContainer, range.startOffset)
    return probe.toString().length
}

/** Place the caret at a plain-text offset, walking the element's text nodes. */
export function setCaretOffset(el: HTMLElement, offset: number): void {
    const selection = window.getSelection()
    if (!selection) return

    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT)
    let remaining = offset
    let node = walker.nextNode() as Text | null
    let last: Text | null = null

    while (node) {
        const length = node.textContent?.length ?? 0
        if (remaining <= length) {
            const range = document.createRange()
            range.setStart(node, remaining)
            range.collapse(true)
            selection.removeAllRanges()
            selection.addRange(range)
            return
        }
        remaining -= length
        last = node
        node = walker.nextNode() as Text | null
    }

    // Offset ran past the content — fall back to the very end.
    const range = document.createRange()
    if (last) {
        range.setStart(last, last.textContent?.length ?? 0)
    } else {
        range.selectNodeContents(el)
    }
    range.collapse(false)
    selection.removeAllRanges()
    selection.addRange(range)
}
