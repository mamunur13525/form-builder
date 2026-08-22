import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface RatingPageProps {
    value?: number
    onChange?: (value: number) => void
    disabled?: boolean
    max?: number
}

export function RatingPage({ value, onChange, disabled, max = 5 }: RatingPageProps) {
    return (
        <div className="flex gap-2">
            {Array.from({ length: max }, (_, i) => i + 1).map((star) => (
                <Button
                    key={star}
                    variant={value === star ? "default" : "outline"}
                    size="icon"
                    onClick={() => onChange?.(star)}
                    disabled={disabled}
                    className={cn(
                        "h-12 w-12 text-lg",
                        disabled && "opacity-50 cursor-not-allowed",
                    )}
                >
                    {star}
                </Button>
            ))}
        </div>
    )
}