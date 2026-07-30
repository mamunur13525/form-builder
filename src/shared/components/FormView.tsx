import { motion, AnimatePresence } from "framer-motion"
import { Label } from "../../components/ui/label"
import { Button } from "../../components/ui/button"
import { Badge } from "../../components/ui/badge"
import { AlertTriangle, FileText } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import type { Form, FormField } from "../../shared/types/common"
import { FIELD_TYPE_ICONS, FIELD_TYPE_LABELS } from "@/shared/constants/form-types"
import { cn } from "@/lib/utils"
import { useFormNavigation } from "../hooks/useFormNavigation"
import { FormFieldRenderer } from "./FormFieldRenderer"
import { FormProgressBar } from "./FormProgressBar"
import { FormSubmittedView } from "./FormSubmittedView"
import { FormNavigationFooter } from "./FormNavigationFooter"

const slideVariants = {
    enter: (direction: number) => ({
        x: direction * 40,
        opacity: 0,
    }),
    center: {
        x: 0,
        opacity: 1,
    },
    exit: (direction: number) => ({
        x: -direction * 40,
        opacity: 0,
    }),
}

interface FormViewProps {
    form: Form
    mode: "preview" | "published"
    onSubmit?: (answers: Record<string, unknown>) => void
}

export function FormView({ form, mode, onSubmit }: FormViewProps) {
    const {
        currentStep,
        direction,
        answers,
        isSubmitting,
        submitted,
        error,
        submittedPages,
        activeFields,
        currentField,
        isLastStep,
        handleAnswer,
        handleNext,
        handlePrev,
        handleNavNext,
    } = useFormNavigation({ form, mode, onSubmit })

    // Debug: log form data to check what's being received
    console.log("[FormView] form fields:", form.fields?.length, "activeFields:", activeFields.length, "currentField:", currentField?.fieldKey)

    const PageIcon: LucideIcon = currentField
        ? FIELD_TYPE_ICONS[currentField.type as keyof typeof FIELD_TYPE_ICONS] || FileText
        : FileText

    const renderFieldQuestion = (field: FormField) => (
        <>
            <div className="flex items-center gap-2 mb-2">
                <PageIcon className="h-5 w-5 text-muted-foreground" />
                <Badge variant="secondary">
                    {FIELD_TYPE_LABELS[field.type as keyof typeof FIELD_TYPE_LABELS] || field.type}
                </Badge>
                {field.required && (
                    <Badge variant="destructive" className="text-[10px] text-white">
                        Required
                    </Badge>
                )}
            </div>

            <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Question</Label>
                <h2 className="text-2xl font-bold pb-1">{field.label}</h2>
                {field.helperText && (
                    <p className="text-sm text-muted-foreground pb-1">{field.helperText}</p>
                )}
            </div>

            <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Your Answer</Label>
                <FormFieldRenderer
                    field={field}
                    value={answers[field.fieldKey]}
                    error={error}
                    onAnswer={handleAnswer}
                />
                {error && (
                    <motion.div
                        initial={{ y: -4, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="flex items-center gap-1.5 text-xs text-destructive font-medium pt-1"
                    >
                        <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                        {error}
                    </motion.div>
                )}
            </div>

            <div className="pt-2">
                <Button
                    size="lg"
                    className="w-full sm:w-auto"
                    onClick={handleNext}
                    disabled={isSubmitting}
                >
                    {isSubmitting
                        ? "Submitting..."
                        : isLastStep
                            ? "Submit"
                            : "Next"}
                </Button>
            </div>
        </>
    )

    if (submitted) {
        return <FormSubmittedView onReset={() => {}} />
    }

    return (
        <div className={cn("flex flex-col bg-background h-full")}>
            {/* Progress bar */}
            {form.settings?.showProgressBar && (
                <FormProgressBar currentStep={currentStep} totalSteps={activeFields.length} />
            )}

            {/* Content area */}
            <div className="flex-1 min-h-0 relative">
                <div className="absolute inset-0">
                    <AnimatePresence initial={false} custom={direction} mode="wait">
                        <motion.div
                            key={currentStep}
                            custom={direction}
                            variants={slideVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{
                                x: { type: "spring", stiffness: 300, damping: 30 },
                                opacity: { duration: 0.2 },
                            }}
                            className="absolute inset-0 overflow-y-auto px-6 py-10 flex items-center"
                        >
                            <div className="mx-auto max-w-2xl w-full">
                                {activeFields.length === 0 ? (
                                    <div className="text-center py-20 text-muted-foreground">
                                        <p className="text-lg">No fields in this form yet.</p>
                                        <p className="text-sm mt-2">Add fields in the form builder to see them here.</p>
                                    </div>
                                ) : currentField ? (
                                    renderFieldQuestion(currentField)
                                ) : (
                                    <div className="text-center py-20 text-muted-foreground">
                                        <p>Loading field...</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {/* Footer */}
            <FormNavigationFooter
                currentStep={currentStep}
                isLastStep={isLastStep}
                hasSubmittedCurrent={submittedPages.has(currentStep)}
                onPrev={handlePrev}
                onNavNext={handleNavNext}
            />
        </div>
    )
}