import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface YesNoPageProps {
    value?: string
    onChange?: (value: string) => void
    disabled?: boolean
    color?: string
    fontSizeClass?: string
}

export function YesNoPage({ value, onChange, disabled, color, fontSizeClass }: YesNoPageProps) {
    return (
        <div className="flex gap-3">
            {["Yes", "No"].map((opt) => (
                <Button
                    key={opt}
                    variant={value === opt ? "default" : "outline"}
                    onClick={() => onChange?.(opt)}
                    disabled={disabled}
                    className={cn("px-8", fontSizeClass, disabled && "opacity-50 cursor-not-allowed")}
                    style={color ? { color } : undefined}
                >
                    {opt}
                </Button>
            ))}
        </div>
    )
}
