import {
    useCallback,
    useLayoutEffect,
    useRef,
} from "react"
import { type VariableItem } from "./formVariables"
import {
    getCaretOffset,
    setCaretOffset,
    toHighlightedHtml,
} from "./variableEditableUtils"
import { VariableMentionMenu } from "./VariableMentionMenu"
import { useVariableMention } from "./useVariableMention"

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
    const composingRef = useRef(false)

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

    const commit = useCallback(() => {
        onCommit?.(editableRef.current?.textContent ?? "")
    }, [onCommit])

    const {
        menuRef,
        menu,
        activeIndex,
        setActiveIndex,
        filtered,
        syncMenu,
        insertVariable,
        handleKeyDown,
    } = useVariableMention({
        variables,
        editableRef,
        paintTokens,
        commit,
    })

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
                onKeyDownCapture={(e) => {
                    // Stop key events in capture phase so ancestor listeners (such as react-movable List)
                    // cannot intercept Space or other typing keys.
                    e.stopPropagation()
                }}
                onKeyDown={handleKeyDown}
                onBlur={() => {
                    paintTokens()
                    commit()
                }}
            />

            {menu && (
                <VariableMentionMenu
                    menu={menu}
                    menuRef={menuRef}
                    filtered={filtered}
                    activeIndex={activeIndex}
                    onSelectIndex={setActiveIndex}
                    onInsert={insertVariable}
                />
            )}
        </>
    )
}
