import { Star } from "lucide-react"
import { cn } from "@/lib/utils"
import type { RatingSettings } from "@/shared/types/common"

interface StarRatingPageProps {
    value?: number
    onChange?: (value: number) => void
    settings: RatingSettings
    disabled?: boolean
    color?: string
}

/** Rating renderer that honours the `rating` settings group (star vs number, max). */
export function StarRatingPage({
    value = 0,
    onChange,
    settings,
    disabled,
    color,
}: StarRatingPageProps) {
    const { style, max } = settings
    const items = Array.from({ length: max }, (_, i) => i + 1)

    if (style === "number") {
        return (
            <div className="flex flex-wrap gap-2">
                {items.map((n) => {
                    const isSelected = value === n
                    return (
                        <button
                            key={n}
                            type="button"
                            disabled={disabled}
                            onClick={() => onChange?.(n)}
                            style={
                                color
                                    ? isSelected
                                        ? {
                                            borderColor: color,
                                            backgroundColor: color,
                                            color: "#ffffff",
                                        }
                                        : {
                                            borderColor: `color-mix(in oklab, ${color} 30%, transparent)`,
                                            backgroundColor: `color-mix(in oklab, ${color} 5%, transparent)`,
                                            color,
                                        }
                                    : undefined
                            }
                            className={cn(
                                "h-12 min-w-12 rounded-lg border px-2 text-lg transition-colors",
                                !color && (
                                    isSelected
                                        ? "border-primary bg-primary text-primary-foreground"
                                        : "hover:bg-muted/50"
                                ),
                                disabled && "pointer-events-none opacity-50",
                            )}
                        >
                            {n}
                        </button>
                    )
                })}
            </div>
        )
    }

    return (
        <div className="flex flex-wrap items-center gap-1">
            {items.map((n) => {
                const isFilled = n <= value
                return (
                    <button
                        key={n}
                        type="button"
                        disabled={disabled}
                        onClick={() => onChange?.(n)}
                        aria-label={`Rate ${n} of ${max}`}
                        className={cn(
                            "rounded p-1 transition-transform hover:scale-110",
                            disabled && "pointer-events-none opacity-50",
                        )}
                    >
                        <Star
                            className={cn(
                                "h-8 w-8",
                                !color && (isFilled ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/40"),
                            )}
                            style={
                                color
                                    ? {
                                        color: isFilled ? color : `color-mix(in oklab, ${color} 35%, transparent)`,
                                        fill: isFilled ? color : "transparent",
                                    }
                                    : undefined
                            }
                        />
                    </button>
                )
            })}
        </div>
    )
}
