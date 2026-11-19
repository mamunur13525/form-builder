import { cn } from "@/lib/utils"
import type { OpinionScaleSettings } from "@/shared/types/common"

interface OpinionScalePageProps {
    value?: number
    onChange?: (value: number) => void
    settings: OpinionScaleSettings
    disabled?: boolean
    color?: string
}

export function OpinionScalePage({
    value,
    onChange,
    settings,
    disabled,
    color,
}: OpinionScalePageProps) {
    const { min, max, leftLabel, rightLabel } = settings
    const count = Math.max(0, max - min + 1)
    const numbers = Array.from({ length: count }, (_, i) => min + i)

    return (
        <div className="space-y-2">
            <div
                className="grid gap-2"
                style={{ gridTemplateColumns: `repeat(${count}, minmax(0, 1fr))` }}
            >
                {numbers.map((n) => {
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
                                "h-11 w-full rounded-lg border px-1 text-base transition-colors",
                                !color && (
                                    isSelected
                                        ? "border-primary bg-primary text-primary-foreground"
                                        : "hover:bg-muted/50"
                                ),
                                disabled && "opacity-50 pointer-events-none",
                            )}
                        >
                            {n}
                        </button>
                    )
                })}
            </div>
            {(leftLabel || rightLabel) && (
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{leftLabel}</span>
                    <span>{rightLabel}</span>
                </div>
            )}
        </div>
    )
}
