import { useEffect, useMemo, useRef, type CSSProperties } from "react"
import { cn } from "@/lib/utils"
import type { SliderSettings } from "@/shared/types/common"
import { formatSliderNumber } from "@/shared/utils/slider"

type SliderValue = number | [number, number]

interface SliderPageProps {
    value?: SliderValue | null
    onChange?: (value: SliderValue) => void
    settings: SliderSettings
    disabled?: boolean
    color?: string
    fontSizeClass?: string
}

const DEFAULT_MIN = 0
const DEFAULT_MAX = 100
const DEFAULT_STEP = 1

const clamp = (value: number, min: number, max: number) =>
    Math.min(Math.max(value, min), max)

/**
 * Slider answer page. Supports a single handle or a two-handle range, with
 * prefix/suffix decoration and a configurable thousand separator.
 */
export function SliderPage({
    value,
    onChange,
    settings,
    disabled,
    color,
    fontSizeClass,
}: SliderPageProps) {
    const min = settings.min ?? DEFAULT_MIN
    const max = settings.max ?? DEFAULT_MAX
    const step =
        settings.step && settings.step > 0 ? settings.step : DEFAULT_STEP
    const rangeMode = settings.rangeMode ?? false
    const separator = settings.thousandSeparator ?? "comma"
    const prefix = settings.prefix ?? ""
    const suffix = settings.suffix ?? ""

    const lowDefault = clamp(settings.defaultLow ?? min, min, max)
    const highDefault = clamp(settings.defaultHigh ?? max, min, max)

    const current = useMemo(() => {
        if (rangeMode) {
            const pair = Array.isArray(value) ? value : []
            const low = clamp(Number(pair[0] ?? lowDefault), min, max)
            const high = clamp(Number(pair[1] ?? highDefault), min, max)
            return low <= high ? ([low, high] as [number, number]) : ([high, low] as [number, number])
        }
        return clamp(typeof value === "number" ? value : lowDefault, min, max)
    }, [rangeMode, value, lowDefault, highDefault, min, max])

    const singleValue = Array.isArray(current) ? current[0] : current
    const lowValue = Array.isArray(current) ? current[0] : singleValue
    const highValue = Array.isArray(current) ? current[1] : singleValue

    // Seed the answer with the configured default so a required slider starts
    // at a valid value instead of being "unanswered" until it is touched.
    const seeded = useRef(false)
    useEffect(() => {
        if (seeded.current || disabled) return
        seeded.current = true
        if (value === undefined || value === null) {
            onChange?.(rangeMode ? [lowValue, highValue] : singleValue)
        }
        // Intentionally mount-only: later edits come from the handle handlers.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const span = max - min || 1
    const percent = (n: number) => ((n - min) / span) * 100
    const thumbColor = color || "#0f172a"
    const lowPercent = percent(lowValue)
    const highPercent = percent(highValue)

    const shellStyle = { "--slider-color": thumbColor } as CSSProperties

    const handleLow = (raw: number) => {
        const next = clamp(raw, min, highValue)
        onChange?.([next, highValue])
    }

    const handleHigh = (raw: number) => {
        const next = clamp(raw, lowValue, max)
        onChange?.([lowValue, next])
    }

    return (
        <div
            className={cn("w-full select-none", disabled && "opacity-60")}
            style={shellStyle}
        >
            <div
                className={cn(
                    "mb-4 flex items-baseline gap-1 font-semibold tabular-nums",
                    fontSizeClass || "text-2xl",
                    !color && "text-slate-900 dark:text-zinc-100",
                )}
                style={color ? { color } : undefined}
            >
                {rangeMode
                    ? `${prefix}${formatSliderNumber(lowValue, separator)} – ${formatSliderNumber(
                          highValue,
                          separator,
                      )}${suffix}`
                    : `${prefix}${formatSliderNumber(singleValue, separator)}${suffix}`}
            </div>

            <div className="relative h-6 w-full">
                <div className="absolute inset-x-0 top-1/2 h-2 -translate-y-1/2 rounded-full bg-slate-200 dark:bg-zinc-700" />

                {rangeMode && (
                    <div
                        className="absolute top-1/2 h-2 -translate-y-1/2 rounded-full"
                        style={{
                            left: `${lowPercent}%`,
                            width: `${Math.max(highPercent - lowPercent, 0)}%`,
                            backgroundColor: `color-mix(in oklab, ${thumbColor} 30%, transparent)`,
                        }}
                    />
                )}

                {rangeMode ? (
                    <>
                        <RangeInput
                            ariaLabel="Low value"
                            min={min}
                            max={max}
                            step={step}
                            value={lowValue}
                            disabled={disabled}
                            onChange={handleLow}
                            className="z-10"
                        />
                        <RangeInput
                            ariaLabel="High value"
                            min={min}
                            max={max}
                            step={step}
                            value={highValue}
                            disabled={disabled}
                            onChange={handleHigh}
                            className="z-20"
                        />
                    </>
                ) : (
                    <RangeInput
                        ariaLabel="Slider value"
                        min={min}
                        max={max}
                        step={step}
                        value={singleValue}
                        disabled={disabled}
                        onChange={(next) => onChange?.(clamp(next, min, max))}
                        className="z-20"
                    />
                )}
            </div>

            <div className="mt-2 flex items-center justify-between text-sm tabular-nums text-slate-500 dark:text-zinc-400">
                <span>{formatSliderNumber(min, separator)}</span>
                <span>{formatSliderNumber(max, separator)}</span>
            </div>
        </div>
    )
}

function RangeInput({
    ariaLabel,
    min,
    max,
    step,
    value,
    disabled,
    onChange,
    className,
}: {
    ariaLabel: string
    min: number
    max: number
    step: number
    value: number
    disabled?: boolean
    onChange: (value: number) => void
    className?: string
}) {
    return (
        <input
            type="range"
            aria-label={ariaLabel}
            min={min}
            max={max}
            step={step}
            value={value}
            disabled={disabled}
            onChange={(event) => onChange(Number(event.target.value))}
            className={cn(
                "pointer-events-none absolute inset-0 h-6 w-full appearance-none bg-transparent focus-visible:outline-none",
                "disabled:cursor-not-allowed",
                "[&::-webkit-slider-runnable-track]:h-2 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-transparent",
                "[&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-[var(--slider-color)] [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110",
                "[&::-moz-range-track]:h-2 [&::-moz-range-track]:rounded-full [&::-moz-range-track]:bg-transparent",
                "[&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:bg-[var(--slider-color)] [&::-moz-range-thumb]:shadow-md",
                className,
            )}
        />
    )
}
