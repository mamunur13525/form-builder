import type { MouseEvent } from "react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

// Same underline-only treatment as DatePage, with the native clock button
// hidden so the field reads as plain `--:-- --` text.
const inputBaseClasses =
    "pl-0 text-2xl rounded-none border-0 border-b focus:border-b-2 border-gray-500 focus:border-gray-200 outline-0! ring-0! focus:outline-0! focus:ring-0! focus-visible:outline-0! focus-visible:ring-0! focus-visible:ring-offset-0! focus-within:ring-0! focus-within:outline-0! bg-transparent duration-300 [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"

interface TimePageProps {
    value: string
    onChange?: (value: string) => void
    disabled?: boolean
    error?: string | null
    color?: string
    fontSizeClass?: string
}

export function TimePage({ value, onChange, disabled, error, color, fontSizeClass }: TimePageProps) {
    const isError = !!error
    const errorClasses = isError ? "border-destructive!" : ""

    // The indicator is hidden above, so clicking the field opens the picker.
    const openPicker = (event: MouseEvent<HTMLInputElement>) => {
        const input = event.currentTarget
        if (disabled || typeof input.showPicker !== "function") return
        try {
            input.showPicker()
        } catch {
            // No picker available: the field still accepts a typed time.
        }
    }

    return (
        <Input
            type="time"
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            onClick={openPicker}
            disabled={disabled}
            className={cn(inputBaseClasses, fontSizeClass, errorClasses)}
            style={
                color
                    ? {
                        color,
                        borderColor: isError ? undefined : `color-mix(in oklab, ${color} 40%, transparent)`,
                        ...({
                            "--input-placeholder-color": `color-mix(in oklab, ${color} 40%, transparent)`,
                        } as React.CSSProperties),
                    }
                    : undefined
            }
        />
    )
}
