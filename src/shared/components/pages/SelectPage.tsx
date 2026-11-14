import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { getDropdownItemStyle, getDropdownMenuStyle } from "@/shared/utils/theme"

/** Shared by the fill view and the builder preview so both look the same. */
export const dropdownTriggerClasses =
    "flex h-11 w-full items-center justify-between gap-2 rounded-lg border bg-transparent px-4 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"

interface SelectPageProps {
    value: string
    onChange?: (value: string) => void
    options: Array<{ label: string; value: string }>
    placeholder?: string
    disabled?: boolean
    error?: string | null
    color?: string
    fontSizeClass?: string
}

export function SelectPage({
    value,
    onChange,
    options,
    placeholder = "Please select an option",
    disabled,
    error,
    color,
    fontSizeClass,
}: SelectPageProps) {
    const [open, setOpen] = useState(false)
    const [activeIndex, setActiveIndex] = useState(0)
    const triggerRef = useRef<HTMLButtonElement>(null)
    const wrapperRef = useRef<HTMLDivElement>(null)
    const listId = useId()
    const selectedIndex = options.findIndex((opt) => opt.value === value)
    const selected = selectedIndex >= 0 ? options[selectedIndex] : undefined
    const isError = !!error

    // Clicking anywhere else closes the menu.
    useEffect(() => {
        if (!open) return
        const onPointerDown = (event: PointerEvent) => {
            if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false)
        }
        document.addEventListener("pointerdown", onPointerDown)
        return () => document.removeEventListener("pointerdown", onPointerDown)
    }, [open])

    const openMenu = () => {
        setActiveIndex(Math.max(selectedIndex, 0))
        setOpen(true)
    }

    const choose = (index: number) => {
        const option = options[index]
        if (!option) return
        onChange?.(option.value)
        setOpen(false)
        triggerRef.current?.focus()
    }

    const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
        if (event.key === "Escape" && open) {
            event.preventDefault()
            setOpen(false)
            return
        }
        if (!open) {
            if (event.key === "ArrowDown" || event.key === "ArrowUp") {
                event.preventDefault()
                openMenu()
            }
            return
        }
        if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault()
            if (options.length === 0) return
            setActiveIndex((index) => {
                const next = event.key === "ArrowDown" ? index + 1 : index - 1
                return (next + options.length) % options.length
            })
        } else if (event.key === "Home" || event.key === "End") {
            event.preventDefault()
            setActiveIndex(event.key === "Home" ? 0 : Math.max(options.length - 1, 0))
        } else if (event.key === "Enter" || event.key === " ") {
            event.preventDefault()
            choose(activeIndex)
        } else if (event.key === "Tab") {
            setOpen(false)
        }
    }

    return (
        <div ref={wrapperRef} className="relative w-full">
            <button
                ref={triggerRef}
                type="button"
                disabled={disabled}
                role="combobox"
                aria-haspopup="listbox"
                aria-expanded={open}
                aria-controls={listId}
                aria-activedescendant={open ? `${listId}-option-${activeIndex}` : undefined}
                aria-invalid={isError || undefined}
                onClick={() => (open ? setOpen(false) : openMenu())}
                onKeyDown={handleKeyDown}
                className={cn(
                    dropdownTriggerClasses,
                    fontSizeClass,
                    isError
                        ? "border-destructive!"
                        : !color && "border-slate-600 dark:border-zinc-500",
                    "cursor-pointer disabled:cursor-not-allowed",
                )}
                style={
                    color
                        ? {
                            color,
                            borderColor: isError ? undefined : `color-mix(in oklab, ${color} 30%, transparent)`,
                            backgroundColor: `color-mix(in oklab, ${color} 5%, transparent)`,
                        }
                        : undefined
                }
            >
                <span className="truncate">{selected ? selected.label : placeholder}</span>
                <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-70" />
            </button>

            {open && (
                <div
                    id={listId}
                    role="listbox"
                    aria-label={placeholder}
                    style={getDropdownMenuStyle(color)}
                    className="absolute left-0 right-0 top-full z-30 mt-1 max-h-60 overflow-y-auto rounded-lg border border-slate-200 bg-white py-1 shadow-lg dark:border-zinc-700 dark:bg-zinc-900"
                >
                    {options.map((option, index) => {
                        const isSelected = index === selectedIndex
                        const isActive = index === activeIndex
                        return (
                            <button
                                key={option.value || index}
                                type="button"
                                id={`${listId}-option-${index}`}
                                role="option"
                                tabIndex={-1}
                                aria-selected={isSelected}
                                onClick={() => choose(index)}
                                onMouseMove={() => {
                                    if (!isActive) setActiveIndex(index)
                                }}
                                style={getDropdownItemStyle(color, isActive)}
                                className={cn(
                                    "flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm transition-colors",
                                    isActive && !color && "bg-slate-100 dark:bg-zinc-800",
                                    isSelected && "font-medium",
                                    !color &&
                                        (isSelected
                                            ? "text-slate-900 dark:text-white"
                                            : "text-slate-700 dark:text-zinc-200"),
                                )}
                            >
                                <span className="truncate">{option.label || option.value}</span>
                                {isSelected && <Check className="h-4 w-4 shrink-0" />}
                            </button>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
