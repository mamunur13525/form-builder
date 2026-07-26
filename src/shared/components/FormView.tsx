import { useState } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { motion, AnimatePresence } from "motion/react"
import { submitPublicForm } from "@/entities/response/api/public-form.api"
import type { Form, FormField } from "../../shared/types/common"

interface FormViewProps {
    form: Form
    mode: "preview" | "published"
    onSubmit?: (answers: Record<string, unknown>) => void
}

export function FormView({ form, mode, onSubmit }: FormViewProps) {
    const [currentStep, setCurrentStep] = useState(0)
    const [answers, setAnswers] = useState<Record<string, unknown>>({})
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitted, setSubmitted] = useState(false)

    const activeFields = form.fields.filter((f) => f.isActive)
    const currentField = activeFields[currentStep]
    const isLastStep = currentStep === activeFields.length - 1
    const isPreview = mode === "preview"

    const handleAnswer = (fieldKey: string, value: unknown) => {
        setAnswers((prev) => ({ ...prev, [fieldKey]: value }))
    }

    const handleNext = () => {
        if (isLastStep) {
            handleSubmit()
        } else {
            setCurrentStep((prev) => prev + 1)
        }
    }

    const handlePrev = () => {
        if (currentStep > 0) setCurrentStep((prev) => prev - 1)
    }

    const handleSubmit = async () => {
        if (isPreview) {
            setSubmitted(true)
            return
        }

        setIsSubmitting(true)
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
        } finally {
            setIsSubmitting(false)
        }
    }

    const renderField = (field: FormField) => {
        switch (field.type) {
            case "shortText":
            case "email":
            case "phone":
            case "url":
                return (
                    <input
                        type={field.type === "email" ? "email" : field.type === "phone" ? "tel" : field.type === "url" ? "url" : "text"}
                        placeholder={field.placeholder}
                        value={(answers[field.fieldKey] as string) || ""}
                        onChange={(e) => handleAnswer(field.fieldKey, e.target.value)}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    />
                )
            case "longText":
                return (
                    <textarea
                        placeholder={field.placeholder}
                        value={(answers[field.fieldKey] as string) || ""}
                        onChange={(e) => handleAnswer(field.fieldKey, e.target.value)}
                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    />
                )
            case "number":
                return (
                    <input
                        type="number"
                        placeholder={field.placeholder}
                        value={(answers[field.fieldKey] as string) || ""}
                        onChange={(e) => handleAnswer(field.fieldKey, e.target.value)}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    />
                )
            case "date":
                return (
                    <input
                        type="date"
                        value={(answers[field.fieldKey] as string) || ""}
                        onChange={(e) => handleAnswer(field.fieldKey, e.target.value)}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    />
                )
            case "time":
                return (
                    <input
                        type="time"
                        value={(answers[field.fieldKey] as string) || ""}
                        onChange={(e) => handleAnswer(field.fieldKey, e.target.value)}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    />
                )
            case "select":
                return (
                    <select
                        value={(answers[field.fieldKey] as string) || ""}
                        onChange={(e) => handleAnswer(field.fieldKey, e.target.value)}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
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
                            <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name={field.fieldKey}
                                    value={opt.value}
                                    checked={answers[field.fieldKey] === opt.value}
                                    onChange={(e) => handleAnswer(field.fieldKey, e.target.value)}
                                    className="h-4 w-4"
                                />
                                <span className="text-sm">{opt.label}</span>
                            </label>
                        ))}
                    </div>
                )
            case "checkbox":
                return (
                    <div className="space-y-2">
                        {field.options.map((opt) => {
                            const checked = (answers[field.fieldKey] as string[]) || []
                            return (
                                <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        value={opt.value}
                                        checked={checked.includes(opt.value)}
                                        onChange={(e) => {
                                            const newVal = e.target.checked
                                                ? [...checked, opt.value]
                                                : checked.filter((v: string) => v !== opt.value)
                                            handleAnswer(field.fieldKey, newVal)
                                        }}
                                        className="h-4 w-4"
                                    />
                                    <span className="text-sm">{opt.label}</span>
                                </label>
                            )
                        })}
                    </div>
                )
            case "yesNo":
                return (
                    <div className="flex gap-4">
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
                                className="h-10 w-10"
                            >
                                {star}
                            </Button>
                        ))}
                    </div>
                )
            default:
                return (
                    <input
                        type="text"
                        placeholder={field.placeholder}
                        value={(answers[field.fieldKey] as string) || ""}
                        onChange={(e) => handleAnswer(field.fieldKey, e.target.value)}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    />
                )
        }
    }

    if (submitted) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <Card className="w-full max-w-md">
                        <CardContent className="text-center py-12">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                                className="text-6xl mb-4"
                            >
                                ✓
                            </motion.div>
                            <h2 className="text-2xl font-bold">Thank you!</h2>
                            <p className="text-muted-foreground mt-2">
                                Your response has been submitted successfully.
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
            <Card className="w-full max-w-2xl">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>{form.title}</CardTitle>
                            {form.description && <CardDescription>{form.description}</CardDescription>}
                        </div>
                        <span className="text-sm text-muted-foreground">
                            {currentStep + 1} / {activeFields.length}
                        </span>
                    </div>
                    {form.settings.showProgressBar && (
                        <div className="w-full bg-muted rounded-full h-2 mt-4">
                            <div
                                className="bg-primary h-2 rounded-full transition-all"
                                style={{
                                    width: `${((currentStep + 1) / activeFields.length) * 100}%`,
                                }}
                            />
                        </div>
                    )}
                </CardHeader>
                <CardContent>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentField.fieldKey}
                            initial={{ opacity: 0, x: 100 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -100 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="space-y-4"
                        >
                            <div>
                                <h3 className="text-xl font-semibold">{currentField.label}</h3>
                                {currentField.helperText && (
                                    <p className="text-sm text-muted-foreground mt-2">{currentField.helperText}</p>
                                )}
                            </div>
                            {renderField(currentField)}
                        </motion.div>
                    </AnimatePresence>
                </CardContent>
                <CardFooter className="flex justify-between">
                    <Button
                        variant="outline"
                        onClick={handlePrev}
                        disabled={currentStep === 0}
                    >
                        Previous
                    </Button>
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <Button onClick={handleNext} disabled={isSubmitting}>
                            {isSubmitting ? "Submitting..." : isLastStep ? "Submit" : "Next"}
                        </Button>
                    </motion.div>
                </CardFooter>
            </Card>
        </div>
    )
}
