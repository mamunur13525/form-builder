import { Star } from "lucide-react"
import { cn } from "@/lib/utils"
import type { RatingSettings } from "@/shared/types/common"

interface StarRatingPageProps {
    value?: number
    onChange?: (value: number) => void
    settings: RatingSettings
    disabled?: boolean
}

/** Rating renderer that honours the `rating` settings group (star vs number, max). */
export function StarRatingPage({
    value = 0,
    onChange,
    settings,
    disabled,
}: StarRatingPageProps) {
    const { style, max } = settings
    const items = Array.from({ length: max }, (_, i) => i + 1)

    if (style === "number") {
        return (
            <div className="flex flex-wrap gap-2">
                {items.map((n) => (
                    <button
                        key={n}
                        type="button"
                        disabled={disabled}
                        onClick={() => onChange?.(n)}
                        className={cn(
                            "h-12 min-w-12 rounded-md border px-2 text-lg transition-colors",
                            value === n
                                ? "border-primary bg-primary text-primary-foreground"
                                : "hover:bg-muted/50",
                            disabled && "pointer-events-none opacity-50",
                        )}
                    >
                        {n}
                    </button>
                ))}
            </div>
        )
    }

    return (
        <div className="flex flex-wrap items-center gap-1">
            {items.map((n) => (
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
                            n <= value
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-muted-foreground/40",
                        )}
                    />
                </button>
            ))}
        </div>
    )
}
