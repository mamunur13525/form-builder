import { cn } from "@/lib/utils"

const inputBaseClasses =
    "text-2xl rounded-none border-0 border-b outline-0 ring-0 focus:outline-0 focus:ring-0 focus-visible:outline-0 focus-visible:ring-0 focus-within:ring-0 focus-within:outline-0"

interface SelectPageProps {
    value: string
    onChange?: (value: string) => void
    options: Array<{ label: string; value: string }>
    placeholder?: string
    disabled?: boolean
    error?: string | null
    color?: string
    fontSizeClass?: string
}

export function SelectPage({
    value,
    onChange,
    options,
    placeholder = "Select an option",
    disabled,
    error,
    color,
    fontSizeClass,
}: SelectPageProps) {
    const isError = !!error
    const errorClasses = isError ? "border-destructive" : ""

    return (
        <select
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            disabled={disabled}
            className={cn(
                inputBaseClasses,
                fontSizeClass,
                "flex h-10 w-full bg-background py-2 text-base placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
                errorClasses,
            )}
            style={color ? { color } : undefined}
        >
            <option value="">{placeholder}</option>
            {options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                    {opt.label}
                </option>
            ))}
        </select>
    )
}