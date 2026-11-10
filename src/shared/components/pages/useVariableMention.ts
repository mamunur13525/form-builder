import { useCallback, useEffect, useRef, useState } from "react"
import type { VariableItem } from "./formVariables"
import type { MenuState } from "./VariableMentionMenu"

/** `@` (start-or-whitespace) followed by an optional token, anchored to caret. */
const MENTION_RE = /(?:^|\s)@([\w.-]*)$/

interface UseVariableMentionOptions {
    variables: VariableItem[]
    editableRef: React.RefObject<HTMLDivElement | null>
    paintTokens: () => void
    commit: () => void
}

export function useVariableMention({
    variables,
    editableRef,
    paintTokens,
    commit,
}: UseVariableMentionOptions) {
    const menuRef = useRef<HTMLDivElement>(null)
    const [menu, setMenu] = useState<MenuState | null>(null)
    const [activeIndex, setActiveIndex] = useState(0)

    const filtered = menu
        ? variables.filter((v) =>
              v.name.toLowerCase().includes(menu.query.toLowerCase()),
          )
        : []

    const closeMenu = useCallback(() => setMenu(null), [])

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
    }, [variables.length, editableRef])

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
        [closeMenu, commit, editableRef, paintTokens],
    )

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
        // Prevent outer keyboard drag handlers (such as react-movable intercepting Space)
        // from capturing typing events inside this editable field.
        event.stopPropagation()

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
    }, [menu, closeMenu, editableRef])

    return {
        menuRef,
        menu,
        activeIndex,
        setActiveIndex,
        filtered,
        syncMenu,
        insertVariable,
        handleKeyDown,
    }
}
