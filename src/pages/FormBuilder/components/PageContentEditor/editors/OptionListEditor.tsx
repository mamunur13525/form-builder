import { Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import type { ChoiceSettings, FormPage, Option } from "@/shared/types/common"

/**
 * Column classes are written out literally so Tailwind keeps them at build
 * time. The builder canvas is resized by an inline width (not the viewport),
 * so responsive prefixes cannot be used here: `isMobileView` decides which
 * of the two option-per-row values applies.
 */
const COLS: Record<number, string> = {
    1: "grid-cols-1",
    2: "grid-cols-2",
    3: "grid-cols-3",
    4: "grid-cols-4",
    5: "grid-cols-5",
    6: "grid-cols-6",
}

const FALLBACK_CHOICE: ChoiceSettings = {
    allowOther: false,
    otherLabel: "Other",
    horizontalAlign: false,
    optionsPerRow: { desktop: 3, mobile: 1 },
    hideLabels: false,
}

/** Slugify a label into a stable option value. */
function toValue(label: string) {
    return label.toLowerCase().trim().replace(/\s+/g, "_")
}

/** Same A–Z marker the answer page shows, so the builder and preview match. */
function optionBadge(index: number) {
    return index < 26 ? String.fromCharCode(65 + index) : String(index + 1)
}

export interface OptionListEditorProps {
    page: FormPage
    pageIndex: number
    onUpdate: (index: number, updates: Partial<FormPage>) => void
    /** Mobile canvas uses `optionsPerRow.mobile`, desktop uses `.desktop`. */
    isMobileView?: boolean
    color?: string
    fontSizeClass?: string
}

/**
 * Option editor for the choice page types. It mirrors the `choice` settings
 * from the settings panel so the builder preview matches what respondents see:
 * horizontal alignment lays the options out on a grid of `optionsPerRow`,
 * hidden labels collapse each row to its marker, and the "Other" option is
 * previewed as a non-editable row.
 */
export function OptionListEditor({
    page,
    pageIndex,
    onUpdate,
    isMobileView = false,
    color,
    fontSizeClass,
}: OptionListEditorProps) {
    const choice = page.settings?.choice ?? FALLBACK_CHOICE
    const { allowOther, otherLabel, horizontalAlign, optionsPerRow, hideLabels } = choice

    const perRow = isMobileView ? optionsPerRow.mobile : optionsPerRow.desktop

    const patchOptions = (options: Option[]) => onUpdate(pageIndex, { options })

    return (
        <div className="space-y-3">
            <div
                className={cn(
                    !horizontalAlign && "space-y-2",
                    horizontalAlign && ["grid items-start gap-2", COLS[perRow] ?? "grid-cols-1"],
                )}
            >
                {page.options.map((opt, optIndex) => (
                    <div
                        key={optIndex}
                        style={
                            color
                                ? {
                                    borderColor: `color-mix(in oklab, ${color} 25%, transparent)`,
                                    backgroundColor: `color-mix(in oklab, ${color} 5%, transparent)`,
                                    color,
                                }
                                : undefined
                        }
                        className={cn(
                            "flex min-w-0 items-center gap-2.5 rounded-xl border-2 p-2",
                            !color && "border-border bg-muted",
                        )}
                    >
                        <span
                            aria-hidden
                            style={
                                color
                                    ? {
                                        borderColor: `color-mix(in oklab, ${color} 35%, transparent)`,
                                        backgroundColor: "transparent",
                                        color,
                                    }
                                    : undefined
                            }
                            className={cn(
                                "flex size-8 shrink-0 items-center justify-center rounded-md border text-sm font-semibold",
                                !color && "border-border bg-background text-foreground",
                            )}
                        >
                            {optionBadge(optIndex)}
                        </span>
                        {!hideLabels && (
                            <Input
                                value={opt.label}
                                onChange={(e) =>
                                    patchOptions(
                                        page.options.map((o, i) =>
                                            i === optIndex
                                                ? {
                                                    label: e.target.value,
                                                    value: toValue(e.target.value),
                                                }
                                                : o,
                                        ),
                                    )
                                }
                                placeholder="Option label"
                                className={cn(
                                    "h-auto min-w-0 flex-1 border-0 bg-transparent p-0 text-sm shadow-none focus-visible:ring-0",
                                    fontSizeClass,
                                )}
                                style={
                                    color
                                        ? {
                                            color,
                                            ...({
                                                "--input-placeholder-color": `color-mix(in oklab, ${color} 40%, transparent)`,
                                            } as React.CSSProperties),
                                        }
                                        : undefined
                                }
                            />
                        )}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 shrink-0"
                            aria-label={`Remove option ${optIndex + 1}`}
                            onClick={() =>
                                patchOptions(page.options.filter((_, i) => i !== optIndex))
                            }
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                ))}

                {/* "Other" is configured in the settings panel, so preview only. */}
                {allowOther && (
                    <div
                        style={
                            color
                                ? {
                                    borderColor: `color-mix(in oklab, ${color} 25%, transparent)`,
                                    backgroundColor: `color-mix(in oklab, ${color} 5%, transparent)`,
                                    color,
                                }
                                : undefined
                        }
                        className={cn(
                            "flex min-w-0 items-center gap-2.5 rounded-xl border-2 p-2",
                            !color && "border-border bg-muted text-muted-foreground",
                        )}
                    >
                        <span
                            aria-hidden
                            style={
                                color
                                    ? {
                                        borderColor: `color-mix(in oklab, ${color} 35%, transparent)`,
                                        backgroundColor: "transparent",
                                        color,
                                    }
                                    : undefined
                            }
                            className={cn(
                                "flex size-8 shrink-0 items-center justify-center rounded-md border text-sm font-semibold",
                                !color && "border-border bg-background text-foreground",
                            )}
                        >
                            {optionBadge(page.options.length)}
                        </span>
                        {!hideLabels && (
                            <span
                                className={cn("truncate text-sm", fontSizeClass)}
                                style={color ? { color } : undefined}
                            >
                                {otherLabel || "Other"}
                            </span>
                        )}
                    </div>
                )}
            </div>

            <Button
                variant="outline"
                size="sm"
                onClick={() => patchOptions([...page.options, { label: "", value: "" }])}
            >
                <Plus className="mr-2 h-4 w-4" />
                Add Option
            </Button>
        </div>
    )
}
