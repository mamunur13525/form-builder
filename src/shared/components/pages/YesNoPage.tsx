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
            {["Yes", "No"].map((opt) => {
                const isSelected = value === opt
                return (
                    <Button
                        key={opt}
                        variant={isSelected ? "default" : "outline"}
                        onClick={() => onChange?.(opt)}
                        disabled={disabled}
                        className={cn("px-8", fontSizeClass, disabled && "opacity-50 cursor-not-allowed")}
                        style={
                            color
                                ? isSelected
                                    ? {
                                        borderColor: color,
                                        backgroundColor: color,
                                        color: "#ffffff",
                                    }
                                    : {
                                        borderColor: `color-mix(in oklab, ${color} 30%, transparent)`,
                                        backgroundColor: `color-mix(in oklab, ${color} 5%, transparent)`,
                                        color,
                                    }
                                : undefined
                        }
                    >
                        {opt}
                    </Button>
                )
            })}
        </div>
    )
}
