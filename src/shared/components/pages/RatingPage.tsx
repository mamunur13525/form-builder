import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface RatingPageProps {
    value?: number
    onChange?: (value: number) => void
    disabled?: boolean
    max?: number
    color?: string
}

export function RatingPage({ value, onChange, disabled, max = 5, color }: RatingPageProps) {
    return (
        <div className="flex gap-2">
            {Array.from({ length: max }, (_, i) => i + 1).map((star) => {
                const isSelected = value === star
                return (
                    <Button
                        key={star}
                        variant={isSelected ? "default" : "outline"}
                        size="icon"
                        onClick={() => onChange?.(star)}
                        disabled={disabled}
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
                        className={cn(
                            "h-12 w-12 text-lg",
                            disabled && "opacity-50 cursor-not-allowed",
                        )}
                    >
                        {star}
                    </Button>
                )
            })}
        </div>
    )
}