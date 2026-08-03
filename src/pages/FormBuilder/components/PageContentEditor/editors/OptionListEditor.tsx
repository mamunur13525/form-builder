import type { LucideIcon } from "lucide-react"
import { Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import type { ChoiceSettings, FormField, Option } from "@/shared/types/common"

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

export interface OptionListEditorProps {
    page: FormField
    pageIndex: number
    onUpdate: (index: number, updates: Partial<FormField>) => void
    /** Mobile canvas uses `optionsPerRow.mobile`, desktop uses `.desktop`. */
    isMobileView?: boolean
    /** Leading glyph that hints at the input type (radio, checkbox, list…). */
    icon: LucideIcon
}

/**
 * Option editor for the choice field types. It mirrors the `choice` settings
 * from the settings panel so the builder preview matches what respondents see:
 * horizontal alignment lays the options out on a grid of `optionsPerRow`,
 * hidden labels collapse each row to its glyph, and the "Other" option is
 * previewed as a non-editable row.
 */
export function OptionListEditor({
    page,
    pageIndex,
    onUpdate,
    isMobileView = false,
    icon: Icon,
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
                        className={cn(
                            "flex items-center gap-2",
                            horizontalAlign && "min-w-0 rounded-md border p-2",
                        )}
                    >
                        <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
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
                                className="min-w-0 flex-1"
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
                        className={cn(
                            "flex items-center gap-2 text-muted-foreground",
                            horizontalAlign && "min-w-0 rounded-md border border-dashed p-2",
                        )}
                    >
                        <Icon className="h-4 w-4 shrink-0" />
                        {!hideLabels && (
                            <span className="truncate text-sm">{otherLabel || "Other"}</span>
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
