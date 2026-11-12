import { useState } from "react"
import { cn } from "@/lib/utils"
import type { ChoiceSettings, Option } from "@/shared/types/common"

/** Sentinel stored while "Other" is selected but no text has been typed yet. */
const OTHER_VALUE = "__other__"

interface ChoicePageProps {
    /** Single value for radio/select, array for checkbox/multiSelect. */
    value: string | string[]
    onChange?: (value: string | string[]) => void
    options: Option[]
    settings: ChoiceSettings
    multiple: boolean
    name: string
    disabled?: boolean
    color?: string
    fontSizeClass?: string
}

// Literal class strings so Tailwind keeps them at build time.
const MOBILE_COLS: Record<number, string> = {
    1: "grid-cols-1",
    2: "grid-cols-2",
    3: "grid-cols-3",
    4: "grid-cols-4",
    5: "grid-cols-5",
    6: "grid-cols-6",
}
const DESKTOP_COLS: Record<number, string> = {
    1: "md:grid-cols-1",
    2: "md:grid-cols-2",
    3: "md:grid-cols-3",
    4: "md:grid-cols-4",
    5: "md:grid-cols-5",
    6: "md:grid-cols-6",
}

/** Option badge letters: A–Z, then 27, 28, … for very long lists. */
function optionBadge(index: number) {
    return index < 26 ? String.fromCharCode(65 + index) : String(index + 1)
}

/**
 * Choice renderer that honours the `choice` settings group:
 * allowOther (with a free-text answer), horizontalAlign + optionsPerRow,
 * hideLabels, and selectionLimit.
 *
 * Value model: the answer holds the selected option values. When "Other" is
 * picked, the answer holds either the sentinel (nothing typed yet) or the
 * respondent's free text, so the typed answer is what gets submitted.
 */
export function ChoicePage({
    value,
    onChange,
    options,
    settings,
    multiple,
    name,
    disabled,
    color,
    fontSizeClass,
}: ChoicePageProps) {
    const { allowOther, otherLabel, horizontalAlign, optionsPerRow, hideLabels } = settings
    const knownValues = options.map((o) => o.value)

    // Normalise the incoming answer into a list.
    const raw: string[] = multiple
        ? Array.isArray(value)
            ? value
            : value
                ? [value]
                : []
        : typeof value === "string" && value
            ? [value]
            : []

    // Split the answer into known option values and the "Other" answer.
    const base = raw.filter((v) => knownValues.includes(v))
    const otherAnswer =
        allowOther
            ? (raw.find((v) => v === OTHER_VALUE || (v !== "" && !knownValues.includes(v))) ?? null)
            : null
    const otherSelected = otherAnswer !== null
    const otherStoredText = otherAnswer && otherAnswer !== OTHER_VALUE ? otherAnswer : ""

    const [otherDraft, setOtherDraft] = useState("")
    const otherText = otherStoredText || otherDraft

    /** Emit a new answer from the parts. */
    const emit = (nextBase: string[], nextOther: string | null) => {
        const parts = nextOther !== null ? [...nextBase, nextOther] : nextBase
        onChange?.(multiple ? parts : (parts[0] ?? ""))
    }

    const isSelected = (v: string) => (v === OTHER_VALUE ? otherSelected : base.includes(v))

    const selectedCount = base.length + (otherSelected ? 1 : 0)

    const atLimit = (() => {
        const limit = settings.selectionLimit
        if (!multiple || !limit) return false
        if (limit.mode === "exact" && limit.exact !== undefined) {
            return selectedCount >= limit.exact
        }
        if (limit.mode === "range" && limit.max !== undefined) {
            return selectedCount >= limit.max
        }
        return false
    })()

    const toggle = (v: string) => {
        if (disabled) return

        if (v === OTHER_VALUE) {
            if (!multiple) {
                emit([], otherSelected ? null : OTHER_VALUE)
                return
            }
            emit(base, otherSelected ? null : OTHER_VALUE)
            return
        }

        if (!multiple) {
            emit([v], null)
            return
        }

        const next = base.includes(v) ? base.filter((s) => s !== v) : [...base, v]
        emit(next, otherAnswer)
    }

    /** Write the typed "Other" text into the answer so it is submitted. */
    const changeOtherText = (text: string) => {
        setOtherDraft(text)
        emit(multiple ? base : [], text.trim() === "" ? OTHER_VALUE : text)
    }

    const allOptions: Option[] = allowOther
        ? [...options, { label: otherLabel || "Other", value: OTHER_VALUE }]
        : options

    return (
        <div className="space-y-3">
            <div
                className={cn(
                    !horizontalAlign && "space-y-2",
                    horizontalAlign && [
                        "grid gap-2",
                        MOBILE_COLS[optionsPerRow.mobile] ?? "grid-cols-1",
                        DESKTOP_COLS[optionsPerRow.desktop] ?? "md:grid-cols-3",
                    ],
                )}
            >
                {allOptions.map((opt, index) => {
                    const checked = isSelected(opt.value)
                    const blocked = !checked && atLimit

                    const itemStyle: React.CSSProperties | undefined = color
                        ? checked
                            ? {
                                borderColor: color,
                                backgroundColor: `color-mix(in oklab, ${color} 12%, transparent)`,
                                color,
                            }
                            : {
                                borderColor: `color-mix(in oklab, ${color} 25%, transparent)`,
                                backgroundColor: `color-mix(in oklab, ${color} 5%, transparent)`,
                                color,
                            }
                        : undefined

                    const badgeStyle: React.CSSProperties | undefined = color
                        ? checked
                            ? {
                                borderColor: color,
                                backgroundColor: color,
                                color: "#ffffff",
                            }
                            : {
                                borderColor: `color-mix(in oklab, ${color} 35%, transparent)`,
                                backgroundColor: "transparent",
                                color,
                            }
                        : undefined

                    return (
                        <label
                            key={opt.value}
                            style={itemStyle}
                            className={cn(
                                "flex cursor-pointer items-center gap-2.5 rounded-xl border-2 p-2 transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring/40",
                                !color && (
                                    checked
                                        ? "border-foreground bg-background"
                                        : "border-border bg-muted hover:bg-muted/70"
                                ),
                                (disabled || blocked) && "pointer-events-none opacity-50",
                                hideLabels && "justify-center",
                            )}
                        >
                            <input
                                type={multiple ? "checkbox" : "radio"}
                                name={name}
                                value={opt.value}
                                checked={checked}
                                onChange={() => toggle(opt.value)}
                                disabled={disabled || blocked}
                                className="sr-only"
                            />
                            <span
                                aria-hidden
                                style={badgeStyle}
                                className={cn(
                                    "flex size-8 shrink-0 items-center justify-center rounded-md border text-sm font-semibold transition-colors",
                                    !color && (
                                        checked
                                            ? "border-foreground bg-foreground text-background"
                                            : "border-border bg-background text-foreground"
                                    ),
                                )}
                            >
                                {optionBadge(index)}
                            </span>
                            {!hideLabels && (
                                <span
                                    className={cn("text-sm", fontSizeClass)}
                                    style={color ? { color } : undefined}
                                >
                                    {opt.label}
                                </span>
                            )}
                        </label>
                    )
                })}
            </div>

            {/* Free-text answer for the "Other" choice */}
            {allowOther && otherSelected && (
                <input
                    type="text"
                    value={otherText}
                    disabled={disabled}
                    placeholder={`${otherLabel || "Other"}...`}
                    onChange={(e) => changeOtherText(e.target.value)}
                    className={cn(
                        "h-10 w-full rounded-lg border bg-transparent px-3 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        fontSizeClass,
                    )}
                    style={
                        color
                            ? {
                                color,
                                borderColor: `color-mix(in oklab, ${color} 40%, transparent)`,
                                backgroundColor: `color-mix(in oklab, ${color} 5%, transparent)`,
                                ...({
                                    "--tw-ring-color": color,
                                } as React.CSSProperties),
                            }
                            : undefined
                    }
                />
            )}

            {/* Selection-limit hint */}
            {multiple && settings.selectionLimit && settings.selectionLimit.mode !== "none" && (
                <p className="text-xs text-muted-foreground">
                    {settings.selectionLimit.mode === "exact"
                        ? `Select exactly ${settings.selectionLimit.exact} option(s).`
                        : `Select between ${settings.selectionLimit.min ?? 0} and ${settings.selectionLimit.max ?? 0
                        } option(s).`}
                </p>
            )}
        </div>
    )
}

export { OTHER_VALUE }
