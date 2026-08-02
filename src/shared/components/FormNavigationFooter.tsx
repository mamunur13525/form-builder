import { ArrowLeft, ArrowRight } from "lucide-react"
import { Button } from "../../components/ui/button"
import { Badge } from "../../components/ui/badge"

interface FormNavigationFooterProps {
    currentStep: number
    isLastStep: boolean
    hasSubmittedCurrent: boolean
    onPrev: () => void
    onNavNext: () => void
}

export function FormNavigationFooter({
    currentStep,
    isLastStep,
    hasSubmittedCurrent,
    onPrev,
    onNavNext,
}: FormNavigationFooterProps) {
    return (
        <div className="flex items-center justify-between px-6 py-4 border-t shrink-0 bg-background">
            <Badge variant="outline" className="text-sm text-muted-foreground font-normal">
                powered by typeform alternative
            </Badge>
            <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={onPrev}
                    disabled={currentStep === 0}
                    className="h-12 w-12"
                >
                    <ArrowLeft className="h-8 w-8" />
                </Button>
                <Button
                    variant="outline"
                    size="icon"
                    onClick={onNavNext}
                    disabled={!hasSubmittedCurrent || isLastStep}
                    className="h-12 w-12"
                >
                    <ArrowRight className="h-8 w-8" />
                </Button>
            </div>
        </div>
    )
}