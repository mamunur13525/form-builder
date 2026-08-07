import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

const inputBaseClasses =
    "text-2xl rounded-none border-0 border-b outline-0 ring-0 focus:outline-0 focus:ring-0 focus-visible:outline-0 focus-visible:ring-0 focus-within:ring-0 focus-within:outline-0"

interface TextareaFieldProps {
    value: string
    onChange?: (value: string) => void
    placeholder?: string
    rows?: number
    disabled?: boolean
    autoFocus?: boolean
    error?: string | null
    color?: string
    fontSizeClass?: string
}

export function TextareaField({
    value,
    onChange,
    placeholder,
    rows = 4,
    disabled,
    autoFocus,
    error,
    color,
    fontSizeClass,
}: TextareaFieldProps) {
    const isError = !!error
    const errorClasses = isError ? "border-destructive" : ""

    return (
        <Textarea
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            placeholder={placeholder}
            rows={rows}
            disabled={disabled}
            autoFocus={autoFocus}
            className={cn(inputBaseClasses, fontSizeClass, errorClasses)}
            style={color ? { color } : undefined}
        />
    )
}
