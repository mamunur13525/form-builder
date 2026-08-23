import {
    useCallback,
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
} from "react"
import { createPortal } from "react-dom"
import { cn } from "@/lib/utils"
import { createVariablePattern, type VariableItem } from "./formVariables"

/**
 * Chip styling for a recognised `@token` inside the editor: the brand green on
 * a light tint of itself, so it reads the same on any form theme background.
 */
const TOKEN_COLOR = "#51871a"
const TOKEN_CLASS = "rounded px-1 py-0.5 font-medium"
const TOKEN_STYLE = [
    `color:${TOKEN_COLOR}`,
    `background-color:color-mix(in srgb, ${TOKEN_COLOR} 16%, transparent)`,
].join(";")

function escapeHtml(value: string): string {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
}

/**
 * Wrap every known `@token` in a highlight chip, leaving all other text as-is.
 * Returns `null` when nothing would change, so callers can skip a DOM write.
 */
function toHighlightedHtml(
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
function getCaretOffset(el: HTMLElement): number | null {
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
function setCaretOffset(el: HTMLElement, offset: number): void {
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

interface VariableEditableProps {
    /** Current plain-text value (may contain `@variable_name` tokens). */
    value: string
    /** Called with the new plain text when editing is committed. */
    onCommit?: (value: string) => void
    /** Variables offered in the `@` menu. */
    variables: VariableItem[]
    placeholder?: string
    className?: string
    style?: React.CSSProperties
    ariaLabel?: string
}

interface MenuState {
    /** Text typed after the `@`, used to filter the list. */
    query: string
    /** Viewport coordinates of the caret, used to anchor the menu. */
    top: number
    left: number
}

/** `@` (start-or-whitespace) followed by an optional token, anchored to caret. */
const MENTION_RE = /(?:^|\s)@([\w.-]*)$/

/**
 * A single-line-friendly `contentEditable` surface that lets authors insert
 * form variables with an `@` mention. It is intentionally *uncontrolled*: React
 * seeds the DOM text once (and re-seeds only when `value` changes while the
 * field is not focused), so typing never resets the caret. The value is
 * committed on blur and immediately after a variable is inserted.
 */
export function VariableEditable({
    value,
    onCommit,
    variables,
    placeholder,
    className,
    style,
    ariaLabel,
}: VariableEditableProps) {
    const editableRef = useRef<HTMLDivElement>(null)
    const menuRef = useRef<HTMLDivElement>(null)
    const composingRef = useRef(false)
    const [menu, setMenu] = useState<MenuState | null>(null)
    const [activeIndex, setActiveIndex] = useState(0)

    const filtered = menu
        ? variables.filter((v) =>
              v.name.toLowerCase().includes(menu.query.toLowerCase()),
          )
        : []

    /**
     * Re-wrap recognised `@tokens` in highlight chips. The element's plain text
     * is the source of truth, so the markup is rebuilt from `textContent` each
     * time — that also normalises any styling the browser tried to carry over
     * from an adjacent chip. The caret is restored by text offset.
     */
    const paintTokens = useCallback(() => {
        const el = editableRef.current
        if (!el || composingRef.current) return

        const text = el.textContent ?? ""
        const html = toHighlightedHtml(text, variables)
        const focused = document.activeElement === el

        if (html === null) {
            // No tokens left — strip any stale chips back to plain text.
            if (!el.querySelector("[data-variable-token]")) return
            const offset = focused ? getCaretOffset(el) : null
            el.textContent = text
            if (offset !== null) setCaretOffset(el, offset)
            return
        }

        if (el.innerHTML === html) return
        const offset = focused ? getCaretOffset(el) : null
        el.innerHTML = html
        if (offset !== null) setCaretOffset(el, offset)
    }, [variables])

    // Seed the DOM from `value` on mount and whenever an external change arrives
    // (e.g. switching pages) — but never while the user is typing in it.
    useLayoutEffect(() => {
        const el = editableRef.current
        if (!el || document.activeElement === el) return
        if (el.textContent !== value) el.textContent = value ?? ""
        paintTokens()
    }, [value, paintTokens])

    const closeMenu = useCallback(() => setMenu(null), [])

    const commit = useCallback(() => {
        onCommit?.(editableRef.current?.textContent ?? "")
    }, [onCommit])

    /** Inspect the caret and open/close the menu based on an `@` token. */
    const syncMenu = useCallback(() => {
        if (!variables.length) {
            setMenu(null)
            return
        }
        const selection = window.getSelection()
        const el = editableRef.current
        if (!selection || selection.rangeCount === 0 || !el) {
            setMenu(null)
            return
        }
        const range = selection.getRangeAt(0)
        if (!el.contains(range.startContainer)) {
            setMenu(null)
            return
        }
        const textToCaret = (range.startContainer.textContent ?? "").slice(
            0,
            range.startOffset,
        )
        const match = MENTION_RE.exec(textToCaret)
        if (!match) {
            setMenu(null)
            return
        }
        const rect = range.getBoundingClientRect()
        const anchor =
            rect && (rect.width || rect.height || rect.top)
                ? rect
                : el.getBoundingClientRect()
        setMenu({ query: match[1] ?? "", top: anchor.bottom + 4, left: anchor.left })
        setActiveIndex(0)
    }, [variables.length])

    /** Replace the in-progress `@query` before the caret with `@name `. */
    const insertVariable = useCallback(
        (name: string) => {
            const el = editableRef.current
            const selection = window.getSelection()
            if (!el || !selection || selection.rangeCount === 0) return

            const range = selection.getRangeAt(0)
            const node = range.startContainer
            const token = `@${name} `

            if (node.nodeType === Node.TEXT_NODE) {
                const textNode = node as Text
                const full = textNode.textContent ?? ""
                const caret = range.startOffset
                const atIndex = full.slice(0, caret).lastIndexOf("@")
                if (atIndex === -1) return
                const nextText = full.slice(0, atIndex) + token + full.slice(caret)
                textNode.textContent = nextText
                const nextCaret = atIndex + token.length
                const nextRange = document.createRange()
                nextRange.setStart(textNode, Math.min(nextCaret, nextText.length))
                nextRange.collapse(true)
                selection.removeAllRanges()
                selection.addRange(nextRange)
            } else {
                // Empty field / caret directly in the element: just append.
                el.textContent = `${el.textContent ?? ""}${token}`
                const nextRange = document.createRange()
                nextRange.selectNodeContents(el)
                nextRange.collapse(false)
                selection.removeAllRanges()
                selection.addRange(nextRange)
            }

            closeMenu()
            el.focus()
            paintTokens()
            commit()
        },
        [closeMenu, commit, paintTokens],
    )

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (!menu || filtered.length === 0) {
            if (menu && event.key === "Escape") {
                event.preventDefault()
                closeMenu()
            }
            return
        }
        switch (event.key) {
            case "ArrowDown":
                event.preventDefault()
                setActiveIndex((i) => (i + 1) % filtered.length)
                break
            case "ArrowUp":
                event.preventDefault()
                setActiveIndex((i) => (i - 1 + filtered.length) % filtered.length)
                break
            case "Enter":
            case "Tab": {
                event.preventDefault()
                const choice = filtered[activeIndex]
                if (choice) insertVariable(choice.name)
                break
            }
            case "Escape":
                event.preventDefault()
                closeMenu()
                break
        }
    }

    // Close the menu on outside pointer-downs and on scroll (it is caret-anchored
    // and would otherwise drift away from the text).
    useEffect(() => {
        if (!menu) return
        const onPointerDown = (event: PointerEvent) => {
            const target = event.target as Node
            if (
                editableRef.current?.contains(target) ||
                menuRef.current?.contains(target)
            )
                return
            closeMenu()
        }
        const onScroll = () => closeMenu()
        document.addEventListener("pointerdown", onPointerDown, true)
        window.addEventListener("scroll", onScroll, true)
        window.addEventListener("resize", onScroll)
        return () => {
            document.removeEventListener("pointerdown", onPointerDown, true)
            window.removeEventListener("scroll", onScroll, true)
            window.removeEventListener("resize", onScroll)
        }
    }, [menu, closeMenu])

    return (
        <>
            <div
                ref={editableRef}
                role="textbox"
                aria-label={ariaLabel}
                aria-multiline="false"
                contentEditable
                suppressContentEditableWarning
                data-placeholder={placeholder}
                className={className}
                style={style}
                onInput={() => {
                    // Repaint first so the caret rect below reflects final DOM.
                    paintTokens()
                    syncMenu()
                }}
                onCompositionStart={() => {
                    composingRef.current = true
                }}
                onCompositionEnd={() => {
                    composingRef.current = false
                    paintTokens()
                }}
                onPaste={(e) => {
                    // Plain text only — pasted markup would fight the chips.
                    e.preventDefault()
                    const text = e.clipboardData.getData("text/plain")
                    document.execCommand("insertText", false, text)
                }}
                onKeyUp={(e) => {
                    // Arrow keys / clicks move the caret without an input event.
                    if (
                        e.key === "ArrowLeft" ||
                        e.key === "ArrowRight" ||
                        e.key === "Home" ||
                        e.key === "End"
                    )
                        syncMenu()
                }}
                onMouseUp={syncMenu}
                onKeyDown={handleKeyDown}
                onBlur={() => {
                    paintTokens()
                    commit()
                }}
            />

            {menu &&
                createPortal(
                    <div
                        ref={menuRef}
                        className="editorial"
                        style={{
                            position: "fixed",
                            top: menu.top,
                            left: menu.left,
                            zIndex: 60,
                        }}
                    >
                        <div
                            role="listbox"
                            aria-label="Insert variable"
                            className="max-h-60 w-60 overflow-y-auto rounded-xl border border-[var(--border)] bg-[var(--popover)] p-1 text-[var(--popover-foreground)] editorial-shadow-md"
                        >
                            {filtered.length === 0 ? (
                                <p className="px-2.5 py-2 text-[13px] text-[var(--muted-foreground)]">
                                    No matching variables
                                </p>
                            ) : (
                                filtered.map((item, index) => (
                                    <button
                                        key={item.name}
                                        type="button"
                                        role="option"
                                        aria-selected={index === activeIndex}
                                        // Keep focus in the editable so the caret /
                                        // selection survives until the click fires.
                                        onMouseDown={(e) => e.preventDefault()}
                                        onMouseEnter={() => setActiveIndex(index)}
                                        onClick={() => insertVariable(item.name)}
                                        className={cn(
                                            "editorial-transition flex w-full items-center justify-between gap-3 rounded-lg px-2.5 py-1.5 text-left",
                                            index === activeIndex
                                                ? "bg-[var(--secondary)]"
                                                : "hover:bg-[var(--secondary)]/60",
                                        )}
                                    >
                                        <span className="truncate font-mono text-[13px] text-[var(--foreground)]">
                                            @{item.name}
                                        </span>
                                        {item.value !== "" && (
                                            <span className="max-w-[45%] truncate text-[12px] text-[var(--muted-foreground)]">
                                                {item.value}
                                            </span>
                                        )}
                                    </button>
                                ))
                            )}
                        </div>
                    </div>,
                    document.body,
                )}
        </>
    )
}
