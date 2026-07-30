import { useState, useMemo } from "react"
import { Card, CardContent, CardFooter } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Textarea } from "../../components/ui/textarea"
import { Label } from "../../components/ui/label"
import { motion, AnimatePresence } from "framer-motion"
import { submitPublicForm } from "@/entities/response/api/public-form.api"
import type { Form, FormField } from "../../shared/types/common"
import { AlertTriangle, FileText } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { FIELD_TYPE_ICONS, FIELD_TYPE_LABELS } from "@/shared/constants/form-types"
import { cn } from "@/lib/utils"

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
    const [currentStep, setCurrentStep] = useState(0)
    const [direction, setDirection] = useState(1) // 1 = forward (next), -1 = backward (previous)
    const [answers, setAnswers] = useState<Record<string, unknown>>({})
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const activeFields = useMemo(() => form.fields.filter((f) => f.isActive), [form.fields])
    const currentField = activeFields[currentStep]
    const isLastStep = currentStep === activeFields.length - 1
    const isPreview = mode === "preview"

    const PageIcon: LucideIcon = currentField
        ? FIELD_TYPE_ICONS[currentField.type as keyof typeof FIELD_TYPE_ICONS] || FileText
        : FileText

    const validateField = (field: FormField, value: unknown): string | null => {
        if (field.required && !value && typeof value !== "number") {
            return field.validation?.message || "This field is required."
        }

        if (field.type === "email") {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            if (value && !emailRegex.test(value as string)) {
                return field.validation?.message || "Please enter a valid email address."
            }
        }

        if ((field.type === "shortText" || field.type === "longText") && typeof value === "string") {
            if (field.validation?.minLength && value.length < field.validation.minLength) {
                return field.validation?.message || `Minimum length is ${field.validation.minLength}.`
            }
            if (field.validation?.maxLength && value.length > field.validation.maxLength) {
                return field.validation?.message || `Maximum length is ${field.validation.maxLength}.`
            }
        }

        if (field.type === "number" && typeof value !== "undefined" && value !== "") {
            const numValue = Number(value)
            if (isNaN(numValue)) return field.validation?.message || "Please enter a valid number."
            if (field.validation?.min && numValue < field.validation.min) {
                return field.validation?.message || `Minimum value is ${field.validation.min}.`
            }
            if (field.validation?.max && numValue > field.validation.max) {
                return field.validation?.message || `Maximum value is ${field.validation.max}.`
            }
        }

        return null
    }

    const handleAnswer = (fieldKey: string, value: unknown) => {
        setAnswers((prev) => ({ ...prev, [fieldKey]: value }))
        if (error) setError(null) // Clear error on new input
    }

    const handleNext = () => {
        const validationError = validateField(currentField, answers[currentField.fieldKey])
        if (validationError) {
            setError(validationError)
            return
        }

        setDirection(1)
        if (isLastStep) {
            handleSubmit()
        } else {
            setCurrentStep((prev) => prev + 1)
        }
    }

    const handlePrev = () => {
        if (error) setError(null)
        if (currentStep > 0) {
            setDirection(-1)
            setCurrentStep((prev) => prev - 1)
        }
    }

    const handleSubmit = async () => {
        if (isPreview) {
            setSubmitted(true)
            return
        }

        setIsSubmitting(true)
        setError(null)
        try {
            const sessionId = `session_${Date.now()}`
            const answerList = Object.entries(answers).map(([fieldKey, value]) => {
                const field = form.fields.find((f) => f.fieldKey === fieldKey)
                return {
                    fieldKey,
                    label: field?.label || "",
                    type: field?.type || "text",
                    value,
                }
            })
            await submitPublicForm(form.slug, { answers: answerList, sessionId })
            setSubmitted(true)
            onSubmit?.(answers)
        } catch (error) {
            console.error("Failed to submit form:", error)
            setError("There was an issue submitting your form. Please try again.")
        } finally {
            setIsSubmitting(false)
        }
    }

    const renderField = (field: FormField) => {
        const isError = !!error
        const errorClasses = isError ? "border-destructive focus-visible:ring-destructive/50" : ""

        switch (field.type) {
            case "shortText":
            case "email":
            case "phone":
            case "url":
                return (
                    <Input
                        type={field.type === "email" ? "email" : field.type === "phone" ? "tel" : field.type === "url" ? "url" : "text"}
                        placeholder={field.placeholder || "Type your answer here..."}
                        value={(answers[field.fieldKey] as string) || ""}
                        onChange={(e) => handleAnswer(field.fieldKey, e.target.value)}
                        className={errorClasses}
                        autoFocus
                    />
                )
            case "longText":
                return (
                    <Textarea
                        placeholder={field.placeholder || "Type your answer here..."}
                        value={(answers[field.fieldKey] as string) || ""}
                        onChange={(e) => handleAnswer(field.fieldKey, e.target.value)}
                        rows={4}
                        className={errorClasses}
                        autoFocus
                    />
                )
            case "number":
                return (
                    <Input
                        type="number"
                        placeholder={field.placeholder || "Enter a number"}
                        value={(answers[field.fieldKey] as string) || ""}
                        onChange={(e) => handleAnswer(field.fieldKey, e.target.value)}
                        className={errorClasses}
                        autoFocus
                    />
                )
            case "date":
                return (
                    <Input
                        type="date"
                        value={(answers[field.fieldKey] as string) || ""}
                        onChange={(e) => handleAnswer(field.fieldKey, e.target.value)}
                        className={errorClasses}
                    />
                )
            case "time":
                return (
                    <Input
                        type="time"
                        value={(answers[field.fieldKey] as string) || ""}
                        onChange={(e) => handleAnswer(field.fieldKey, e.target.value)}
                        className={errorClasses}
                    />
                )
            case "select":
                return (
                    <select
                        value={(answers[field.fieldKey] as string) || ""}
                        onChange={(e) => handleAnswer(field.fieldKey, e.target.value)}
                        className={cn(
                            "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring",
                            errorClasses,
                        )}
                    >
                        <option value="">Select an option</option>
                        {field.options.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                )
            case "radio":
                return (
                    <div className="space-y-2">
                        {field.options.map((opt) => (
                            <label
                                key={opt.value}
                                className={cn(
                                    "flex items-center gap-2 p-2.5 rounded-md border cursor-pointer transition-colors",
                                    answers[field.fieldKey] === opt.value
                                        ? "bg-primary/5 border-primary"
                                        : "hover:bg-muted/50",
                                )}
                            >
                                <input
                                    type="radio"
                                    name={field.fieldKey}
                                    value={opt.value}
                                    checked={answers[field.fieldKey] === opt.value}
                                    onChange={(e) => handleAnswer(field.fieldKey, e.target.value)}
                                    className="h-4 w-4 accent-primary shrink-0"
                                />
                                <span className="text-sm">{opt.label}</span>
                            </label>
                        ))}
                    </div>
                )
            case "checkbox":
            case "multiSelect":
                return (
                    <div className="space-y-2">
                        {field.options.map((opt) => {
                            const checked = (answers[field.fieldKey] as string[]) || []
                            const isChecked = checked.includes(opt.value)
                            return (
                                <label
                                    key={opt.value}
                                    className={cn(
                                        "flex items-center gap-2 p-2.5 rounded-md border cursor-pointer transition-colors",
                                        isChecked ? "bg-primary/5 border-primary" : "hover:bg-muted/50",
                                    )}
                                >
                                    <input
                                        type="checkbox"
                                        value={opt.value}
                                        checked={isChecked}
                                        onChange={(e) => {
                                            const newVal = e.target.checked
                                                ? [...checked, opt.value]
                                                : checked.filter((v: string) => v !== opt.value)
                                            handleAnswer(field.fieldKey, newVal)
                                        }}
                                        className="h-4 w-4 accent-primary shrink-0"
                                    />
                                    <span className="text-sm">{opt.label}</span>
                                </label>
                            )
                        })}
                    </div>
                )
            case "yesNo":
                return (
                    <div className="flex gap-2">
                        {["Yes", "No"].map((opt) => (
                            <Button
                                key={opt}
                                variant={answers[field.fieldKey] === opt ? "default" : "outline"}
                                onClick={() => handleAnswer(field.fieldKey, opt)}
                            >
                                {opt}
                            </Button>
                        ))}
                    </div>
                )
            case "rating":
                return (
                    <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <Button
                                key={star}
                                variant={answers[field.fieldKey] === star ? "default" : "outline"}
                                size="icon"
                                onClick={() => handleAnswer(field.fieldKey, star)}
                                className="h-12 w-12 text-lg"
                            >
                                {star}
                            </Button>
                        ))}
                    </div>
                )
            default:
                return (
                    <Input
                        placeholder={field.placeholder || "Type your answer here..."}
                        value={(answers[field.fieldKey] as string) || ""}
                        onChange={(e) => handleAnswer(field.fieldKey, e.target.value)}
                        className={errorClasses}
                    />
                )
        }
    }

    if (submitted) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5 }}>
                    <Card className="w-full max-w-md">
                        <CardContent className="text-center py-12">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                                className="text-6xl mb-4 text-green-500"
                            >
                                ✓
                            </motion.div>
                            <h2 className="text-2xl font-bold">Thank you!</h2>
                            <p className="text-muted-foreground mt-2">Your response has been submitted successfully.</p>
                        </CardContent>
                        <CardFooter className="flex justify-center">
                            <Button onClick={() => { }}>
                                Submit another response
                            </Button>
                        </CardFooter>
                    </Card>
                </motion.div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex flex-col bg-background">
            {/* Top bar — form title + progress, mirrors builder topbar */}
            <div className="flex items-center justify-between px-6 py-3 border-b shrink-0">
                <div>
                    <h1 className="text-sm font-semibold">{form.title}</h1>
                </div>
                {form.settings.showStepCounter && (
                    <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-md">
                        {currentStep + 1} / {activeFields.length} s
                    </span>
                )}
            </div>
            {form.settings.showProgressBar && (
                <div className="w-full bg-muted h-1 shrink-0">
                    <motion.div
                        className="bg-primary h-1"
                        initial={false}
                        animate={{ width: `${((currentStep + 1) / activeFields.length) * 100}%` }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                    />
                </div>
            )}

            {/* Content — same open canvas as PageContentEditor */}
            <div className="flex-1 overflow-hidden relative">
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
                            <div className="mx-auto max-w-2xl w-full space-y-6 h-7/12">



                            {currentField && (
                                <>
                                    <div className="flex items-center gap-2 mb-2">
                                        <PageIcon className="h-5 w-5 text-muted-foreground" />
                                        <Badge variant="secondary">
                                            {FIELD_TYPE_LABELS[currentField.type as keyof typeof FIELD_TYPE_LABELS] ||
                                                currentField.type}
                                        </Badge>
                                        {currentField.required && (
                                            <Badge variant="destructive" className="text-[10px] text-white">
                                                Required
                                            </Badge>
                                        )}
                                    </div>

                                    <div className="space-y-1">
                                        <Label className="text-xs text-muted-foreground">Question</Label>
                                        <h2 className="text-2xl font-bold pb-1">{currentField.label}</h2>
                                        {currentField.helperText && (
                                            <p className="text-sm text-muted-foreground pb-1">{currentField.helperText}</p>
                                        )}
                                    </div>

                                    <div className="space-y-1">
                                        <Label className="text-xs text-muted-foreground">Your Answer</Label>
                                        {renderField(currentField)}
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
                                </>
                            )}
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {/* Bottom bar — navigation */}
            <div className="flex items-center justify-between px-6 py-3 border-t shrink-0 bg-background">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handlePrev}
                    className={cn("h-8 text-xs text-muted-foreground hover:text-foreground", currentStep === 0 && "invisible")}
                >
                    Previous
                </Button>
                <Button size="sm" className="h-8 text-xs font-medium" onClick={handleNext} disabled={isSubmitting}>
                    {isSubmitting ? "Submitting..." : isLastStep ? "Submit" : "Next"}
                </Button>
            </div>
        </div>
    )
}
