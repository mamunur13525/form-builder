import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

const inputBaseClasses =
    "pl-0 text-2xl rounded-none border-0 border-b outline-0 ring-0 focus:outline-0 focus:ring-0 focus-visible:outline-0 focus-visible:ring-0 focus-within:ring-0 focus-within:outline-0 bg-transparent"

interface TextFieldProps {
    value: string
    onChange?: (value: string) => void
    placeholder?: string
    type?: "text" | "email" | "tel" | "url" | "number"
    disabled?: boolean
    autoFocus?: boolean
    error?: string | null
    color?: string
    fontSizeClass?: string
}

export function TextField({
    value,
    onChange,
    placeholder,
    type = "text",
    disabled,
    autoFocus,
    error,
    color,
    fontSizeClass,
}: TextFieldProps) {
    const isError = !!error
    const errorClasses = isError ? "border-destructive" : ""

    return (
        <Input
            type={type}
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            autoFocus={autoFocus}
            className={cn(inputBaseClasses, fontSizeClass, errorClasses)}
            style={color ? { color } : undefined}
        />
    )
}
