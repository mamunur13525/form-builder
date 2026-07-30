import { useState } from "react"
import { ROUTES } from "@/shared/constants/routes";
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, Monitor, Smartphone, RotateCcw, X } from "lucide-react"
import { Button } from "../../components/ui/button"
import { Badge } from "../../components/ui/badge"
import { Switch } from "../../components/ui/switch"
import { Tooltip, TooltipTrigger, TooltipContent } from "../../components/ui/tooltip"
import { FormView } from "../../shared/components/FormView"
import { useForm } from "../../features/forms/hooks/useForms"
import { adaptApiForm } from "../../features/forms/model/adapters"
import { cn } from "@/lib/utils"

export function FormPreviewPage() {
    const { formId } = useParams()
    const navigate = useNavigate()
    const { data: apiForm, isLoading } = useForm(formId || "")
    const [isMobileView, setIsMobileView] = useState(false)
    const [skipValidation, setSkipValidation] = useState(false)
    const [key, setKey] = useState(0)
    console.log('form preveiw page.')

    const handleRestart = () => {
        setKey(prev => prev + 1)
    }

    if (isLoading) {
        return (
            <div className="text-center py-20">
                <p className="text-muted-foreground">Loading form...</p>
            </div>
        )
    }

    if (!apiForm) {
        return (
            <div className="text-center py-20">
                <h2 className="text-2xl font-bold">Form not found</h2>
                <Button className="mt-4" onClick={() => navigate(ROUTES.DASHBOARD)}>
                    Back to Dashboard
                </Button>
            </div>
        )
    }

    const form = adaptApiForm(apiForm)

    return (
        <div className="min-h-screen flex flex-col bg-muted/30">
            <div className="absolute top-4 left-1/2 -translate-x-1/2  w-fit flex items-center justify-between px-4 py-2 border-b bg-background">
                <div className="flex items-center gap-1">
                    <Tooltip>
                        <TooltipTrigger>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => navigate(ROUTES.FORM_BUILDER.replace(":formId", form.id ?? ""))}
                            >
                                <X className="h-5 w-5" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Exit</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setIsMobileView(prev => !prev)}
                            >
                                {isMobileView ? (
                                    <Monitor className="h-5 w-5" />
                                ) : (
                                    <Smartphone className="h-5 w-5" />
                                )}
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            {isMobileView ? "Desktop view" : "Mobile view"}
                        </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleRestart}
                            >
                                <RotateCcw className="h-5 w-5" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Restart</TooltipContent>
                    </Tooltip>
                </div>

                <div className="flex items-center gap-2">
                    <Badge variant="outline">Preview Mode</Badge>
                    <div className="flex items-center gap-2 ml-4">
                        <label htmlFor="skip-validation" className="text-sm text-muted-foreground cursor-pointer select-none">
                            Skip validation
                        </label>
                        <Switch
                            id="skip-validation"
                            checked={skipValidation}
                            onCheckedChange={setSkipValidation}
                            size="sm"
                        />
                    </div>
                </div>
            </div>

            {/* Preview Content */}
            <div className="w-full h-full flex-1 flex items-center justify-center p-4">
                <div
                    className={cn(
                        "w-full h-full bg-background transition-all duration-500 ease-in-out overflow-hidden flex flex-col justify-center",
                    )}
                    style={{ width: isMobileView ? "384px" : "100%" }}
                >
                    <FormView key={key} form={form} mode="preview" />
                </div>
            </div>
        </div>
    )
}