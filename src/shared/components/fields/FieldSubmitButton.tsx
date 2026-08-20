import { cn } from "@/lib/utils"
import { getCornerRadiusCss } from "@/shared/utils/theme"

interface FieldSubmitButtonProps {
    text: string
    color?: string
    textColor?: string
    roundCorners?: string
    fontSizeClass?: string
    onClick?: () => void
    disabled?: boolean
}

export function FieldSubmitButton({
    text,
    color,
    textColor,
    roundCorners,
    fontSizeClass,
    onClick,
    disabled,
}: FieldSubmitButtonProps) {
    return (
        <div className="mt-8">
            <button
                type="button"
                className={cn("w-full h-10 sm:w-auto px-8!", fontSizeClass)}
                onClick={onClick}
                disabled={disabled}
                style={{
                    ...(color ? { backgroundColor: color } : {}),
                    ...(textColor ? { color: textColor } : {}),
                    ...(roundCorners ? { borderRadius: getCornerRadiusCss(roundCorners) } : {}),
                }}
            >
                {text}
            </button>
        </div>
    )
}