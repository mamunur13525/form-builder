import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

const inputBaseClasses =
    "text-2xl rounded-none border-0 border-b outline-0 ring-0 focus:outline-0 focus:ring-0 focus-visible:outline-0 focus-visible:ring-0 focus-within:ring-0 focus-within:outline-0"

interface DateFieldProps {
    value: string
    onChange?: (value: string) => void
    disabled?: boolean
    error?: string | null
}

export function DateField({ value, onChange, disabled, error }: DateFieldProps) {
    const isError = !!error
    const errorClasses = isError ? "border-destructive" : ""

    return (
        <Input
            type="date"
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            disabled={disabled}
            className={cn(inputBaseClasses, errorClasses)}
        />
    )
}