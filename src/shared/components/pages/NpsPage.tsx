import { cn } from "@/lib/utils"
import type { NpsSettings } from "@/shared/types/common"

interface NpsPageProps {
    value?: number
    onChange?: (value: number) => void
    settings: NpsSettings
    isMobileView?: boolean
    disabled?: boolean
    color?: string
}

export function NpsPage({
    value,
    onChange,
    settings,
    isMobileView,
    disabled,
    color,
}: NpsPageProps) {
    const { leftLabel, rightLabel, singleRowOnMobile } = settings
    const numbers = Array.from({ length: 11 }, (_, i) => i)
    // Two rows of 6 + 5 by default; "single row" shrinks the buttons instead.
    // A 12-col grid lets the 5-button second row start at column 2 to sit centered.
    const columns = singleRowOnMobile
        ? "grid-cols-11"
        : isMobileView
            ? "grid-cols-12"
            : "grid-cols-12 sm:grid-cols-11"
    const cellSpan = singleRowOnMobile
        ? ""
        : isMobileView
            ? "col-span-2"
            : "col-span-2 sm:col-span-1"
    const buttonSize = singleRowOnMobile
        ? isMobileView
            ? "h-8 rounded-md px-0 text-xs"
            : "h-8 rounded-md px-0 text-xs sm:h-11 sm:rounded-lg sm:text-base"
        : "h-11 rounded-lg text-base"

    return (
        <div className="space-y-2">
            <div className={cn("grid gap-0.5 sm:gap-1", columns)}>
                {numbers.map((n) => {
                    const isSelected = value === n
                    // 12-col grid: start the five-button second row at column 2.
                    const secondRowStart =
                        !singleRowOnMobile && n === 6
                            ? isMobileView
                                ? "col-start-2"
                                : "col-start-2 sm:col-start-auto"
                            : ""
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
                                "w-full border transition-colors",
                                cellSpan,
                                secondRowStart,
                                buttonSize,
                                !color &&
                                    (isSelected
                                        ? "border-primary bg-primary text-primary-foreground"
                                        : "hover:bg-muted/50"),
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
