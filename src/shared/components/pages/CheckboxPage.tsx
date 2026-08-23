import { cn } from "@/lib/utils"

interface CheckboxPageProps {
    value: string[]
    onChange?: (value: string[]) => void
    options: Array<{ label: string; value: string }>
    disabled?: boolean
}

export function CheckboxPage({ value, onChange, options, disabled }: CheckboxPageProps) {
    const checked = value || []

    return (
        <div className="space-y-2">
            {options.map((opt) => {
                const isChecked = checked.includes(opt.value)
                return (
                    <label
                        key={opt.value}
                        className={cn(
                            "flex items-center gap-2 p-2.5 rounded-md border cursor-pointer transition-colors",
                            isChecked ? "bg-primary/5 border-primary" : "hover:bg-muted/50",
                            disabled && "opacity-50 pointer-events-none",
                        )}
                    >
                        <input
                            type="checkbox"
                            value={opt.value}
                            checked={isChecked}
                            onChange={(e) => {
                                const newVal = e.target.checked
                                    ? [...checked, opt.value]
                                    : checked.filter((v: string) => v !== opt.value)
                                onChange?.(newVal)
                            }}
                            disabled={disabled}
                            className="h-4 w-4 accent-primary shrink-0"
                        />
                        <span className="text-sm">{opt.label}</span>
                    </label>
                )
            })}
        </div>
    )
}