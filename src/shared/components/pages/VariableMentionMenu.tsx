import React from "react"
import { createPortal } from "react-dom"
import { cn } from "@/lib/utils"
import type { VariableItem } from "./formVariables"

export interface MenuState {
    /** Text typed after the `@`, used to filter the list. */
    query: string
    /** Viewport coordinates of the caret, used to anchor the menu. */
    top: number
    left: number
}

interface VariableMentionMenuProps {
    menu: MenuState
    menuRef: React.RefObject<HTMLDivElement | null>
    filtered: VariableItem[]
    activeIndex: number
    onSelectIndex: (index: number) => void
    onInsert: (name: string) => void
}

export function VariableMentionMenu({
    menu,
    menuRef,
    filtered,
    activeIndex,
    onSelectIndex,
    onInsert,
}: VariableMentionMenuProps) {
    return createPortal(
        <div
            ref={menuRef}
            className="light editorial"
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
                className="max-h-60 w-60 overflow-y-auto rounded-lg border border-[var(--border)] bg-[var(--popover)] p-1 text-[var(--popover-foreground)] editorial-shadow-md"
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
                            onMouseDown={(e) => e.preventDefault()}
                            onMouseEnter={() => onSelectIndex(index)}
                            onClick={() => onInsert(item.name)}
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
    )
}
