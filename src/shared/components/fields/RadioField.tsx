import { cn } from "@/lib/utils"

interface RadioFieldProps {
    value: string
    onChange?: (value: string) => void
    options: Array<{ label: string; value: string }>
    name: string
    disabled?: boolean
}

export function RadioField({ value, onChange, options, name, disabled }: RadioFieldProps) {
    return (
        <div className="space-y-2">
            {options.map((opt) => (
                <label
                    key={opt.value}
                    className={cn(
                        "flex items-center gap-2 p-2.5 rounded-md border cursor-pointer transition-colors",
                        value === opt.value
                            ? "bg-primary/5 border-primary"
                            : "hover:bg-muted/50",
                        disabled && "opacity-50 pointer-events-none",
                    )}
                >
                    <input
                        type="radio"
                        name={name}
                        value={opt.value}
                        checked={value === opt.value}
                        onChange={(e) => onChange?.(e.target.value)}
                        disabled={disabled}
                        className="h-4 w-4 accent-primary shrink-0"
                    />
                    <span className="text-sm">{opt.label}</span>
                </label>
            ))}
        </div>
    )
}