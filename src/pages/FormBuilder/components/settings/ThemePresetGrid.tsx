import { Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { getCornerRadiusCss } from "@/shared/utils/theme"
import type { ThemePreset } from "./theme-presets"

interface ThemePresetCardProps {
    preset: ThemePreset
    selected: boolean
    onSelect: (preset: ThemePreset) => void
}

/**
 * A miniature of the form surface: background, question text, answer line and
 * submit button, all drawn with the preset's own colours and corner radius so
 * the card previews what applying it will do.
 */
function ThemePresetCard({ preset, selected, onSelect }: ThemePresetCardProps) {
    const { theme, name, mood } = preset
    const radius = getCornerRadiusCss(theme.roundCorners)
    const image = theme.backgroundImage

    return (
        <button
            type="button"
            onClick={() => onSelect(preset)}
            aria-pressed={selected}
            title={`${name} — ${mood}`}
            className={cn(
                "editorial-transition group overflow-hidden rounded-lg border text-left",
                "focus-visible:ring-[3px] focus-visible:ring-[var(--editorial-primary-ring)] focus-visible:outline-none",
                selected
                    ? "border-[var(--primary)] shadow-[0_2px_10px_rgba(238,125,105,.22)]"
                    : "border-[var(--editorial-border-light)] hover:-translate-y-0.5 hover:border-[var(--editorial-primary-ring)] hover:shadow-[0_8px_20px_rgba(90,70,50,.08)]"
            )}
        >
            {/* Preview surface */}
            <div
                className="relative isolate h-[104px] w-full overflow-hidden"
                style={{ backgroundColor: theme.backgroundColor }}
            >
                {image?.url && (
                    <div
                        aria-hidden
                        className="absolute inset-0 -z-10"
                        style={{
                            backgroundImage: `url(${image.url})`,
                            backgroundSize: image.tile ? "auto" : "cover",
                            backgroundRepeat: image.tile ? "repeat" : "no-repeat",
                            backgroundPosition: "center",
                            filter: `brightness(${(100 + (image.brightness ?? 0)) / 100})`,
                        }}
                    />
                )}

                <div
                    className={cn(
                        "flex h-full flex-col justify-center gap-1.5 px-3",
                        theme.alignment === "center" && "items-center text-center",
                        theme.alignment === "right" && "items-end text-right"
                    )}
                >
                    <span
                        className="text-[11px] leading-tight font-semibold"
                        style={{ color: theme.questionColor }}
                    >
                        Your question
                    </span>

                    <span
                        className="w-full max-w-[104px] border-b pb-1 text-[9px] leading-tight"
                        style={{
                            color: theme.answerColor,
                            borderColor: `color-mix(in oklab, ${theme.answerColor} 45%, transparent)`,
                        }}
                    >
                        Answer
                    </span>

                    <span
                        className="mt-0.5 px-2 py-1 text-[9px] leading-none font-medium"
                        style={{
                            backgroundColor: theme.buttonColor,
                            color: theme.buttonTextColor,
                            borderRadius: radius,
                        }}
                    >
                        Submit
                    </span>
                </div>
            </div>

            {/* Meta row */}
            <div className="flex items-center justify-between gap-2 border-t border-[var(--editorial-border-light)] bg-[var(--card)] px-3 py-2">
                <span className="min-w-0 flex-1">
                    <span className="block truncate text-xs font-medium text-[var(--foreground)]">
                        {name}
                    </span>
                    <span className="block text-[10px] text-[var(--editorial-subtle)]">
                        {mood}
                    </span>
                </span>
                {selected && (
                    <span
                        aria-hidden
                        className="flex size-4 shrink-0 items-center justify-center rounded-full bg-[var(--primary)] text-[var(--primary-foreground)]"
                    >
                        <Check className="size-3" />
                    </span>
                )}
            </div>
        </button>
    )
}

interface ThemePresetGridProps {
    presets: readonly ThemePreset[]
    /** Id of the preset matching the current draft, if any. */
    selectedId: string | null
    onSelect: (preset: ThemePreset) => void
}

/** Two-up grid of theme previews. */
export function ThemePresetGrid({ presets, selectedId, onSelect }: ThemePresetGridProps) {
    return (
        <div className="grid grid-cols-2 gap-3">
            {presets.map((preset) => (
                <ThemePresetCard
                    key={preset.id}
                    preset={preset}
                    selected={preset.id === selectedId}
                    onSelect={onSelect}
                />
            ))}
        </div>
    )
}
