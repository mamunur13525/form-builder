import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface YesNoFieldProps {
    value?: string
    onChange?: (value: string) => void
    disabled?: boolean
}

export function YesNoField({ value, onChange, disabled }: YesNoFieldProps) {
    return (
        <div className="flex gap-3">
            {["Yes", "No"].map((opt) => (
                <Button
                    key={opt}
                    variant={value === opt ? "default" : "outline"}
                    onClick={() => onChange?.(opt)}
                    disabled={disabled}
                    className={cn("px-8", disabled && "opacity-50 cursor-not-allowed")}
                >
                    {opt}
                </Button>
            ))}
        </div>
    )
}