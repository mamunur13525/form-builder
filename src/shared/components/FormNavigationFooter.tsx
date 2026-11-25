import { ArrowLeft, ArrowRight } from "lucide-react"
import { Button } from "../../components/ui/button"
import { Badge } from "../../components/ui/badge"
import { getCornerRadiusCss } from "../utils/theme"

interface FormNavigationFooterProps {
    currentStep: number
    isLastStep: boolean
    hasSubmittedCurrent: boolean
    onPrev: () => void
    onNavNext: () => void
    buttonColor?: string
    buttonTextColor?: string
    roundCorners?: string
}

export function FormNavigationFooter({
    currentStep,
    isLastStep,
    hasSubmittedCurrent,
    onPrev,
    onNavNext,
    buttonColor,
    buttonTextColor,
    roundCorners,
}: FormNavigationFooterProps) {
    const buttonStyle: React.CSSProperties = {
        ...(buttonColor ? { backgroundColor: buttonColor, borderColor: buttonColor } : {}),
        ...(buttonTextColor ? { color: buttonTextColor } : {}),
        ...(roundCorners ? { borderRadius: getCornerRadiusCss(roundCorners) } : {}),
    }

    const badgeStyle: React.CSSProperties = {
        ...(buttonColor ? { backgroundColor: buttonColor, borderColor: buttonColor } : {}),
        ...(buttonTextColor ? { color: buttonTextColor } : {}),
    }

    return (
        <div className="absolute bottom-0 left-0 right-0 z-10 flex items-center justify-between px-6 py-4 pointer-events-none bg-transparent">
            <Badge
                variant="outline"
                className="text-sm font-normal pointer-events-auto border shadow-xs"
                style={badgeStyle}
            >
                powered by typeform alternative
            </Badge>
            <div className="flex items-center gap-2 pointer-events-auto">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={onPrev}
                    disabled={currentStep === 0}
                    className="h-9 w-9 hover:opacity-90 transition-opacity"
                    style={buttonStyle}
                >
                    <ArrowLeft className="h-6 w-6" />
                </Button>
                <Button
                    variant="outline"
                    size="icon"
                    onClick={onNavNext}
                    disabled={!hasSubmittedCurrent || isLastStep}
                    className="h-9 w-9 hover:opacity-90 transition-opacity"
                    style={buttonStyle}
                >
                    <ArrowRight className="h-6 w-6" />
                </Button>
            </div>
        </div>
    )
}