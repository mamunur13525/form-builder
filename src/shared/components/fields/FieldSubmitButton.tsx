import { Button } from "@/components/ui/button"

interface FieldSubmitButtonProps {
    text: string
    color?: string
    onClick?: () => void
    disabled?: boolean
}

export function FieldSubmitButton({ text, color, onClick, disabled }: FieldSubmitButtonProps) {
    return (
        <div className="mt-8">
            <Button
                size="lg"
                className="w-full sm:w-auto px-8!"
                onClick={onClick}
                disabled={disabled}
                style={
                    color
                        ? { backgroundColor: color }
                        : undefined
                }
            >
                {text}
            </Button>
        </div>
    )
}