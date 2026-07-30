import { Input } from "../../components/ui/input"
import { Textarea } from "../../components/ui/textarea"
import { Button } from "../../components/ui/button"
import { cn } from "@/lib/utils"
import type { FormField } from "../types/common"

interface FormFieldRendererProps {
    field: FormField
    value: unknown
    error: string | null
    onAnswer: (fieldKey: string, value: unknown) => void
}

export function FormFieldRenderer({ field, value, error, onAnswer }: FormFieldRendererProps) {
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
                    value={(value as string) || ""}
                    onChange={(e) => onAnswer(field.fieldKey, e.target.value)}
                    className={errorClasses}
                    autoFocus
                />
            )
        case "longText":
            return (
                <Textarea
                    placeholder={field.placeholder || "Type your answer here..."}
                    value={(value as string) || ""}
                    onChange={(e) => onAnswer(field.fieldKey, e.target.value)}
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
                    value={(value as string) || ""}
                    onChange={(e) => onAnswer(field.fieldKey, e.target.value)}
                    className={errorClasses}
                    autoFocus
                />
            )
        case "date":
            return (
                <Input
                    type="date"
                    value={(value as string) || ""}
                    onChange={(e) => onAnswer(field.fieldKey, e.target.value)}
                    className={errorClasses}
                />
            )
        case "time":
            return (
                <Input
                    type="time"
                    value={(value as string) || ""}
                    onChange={(e) => onAnswer(field.fieldKey, e.target.value)}
                    className={errorClasses}
                />
            )
        case "select":
            return (
                <select
                    value={(value as string) || ""}
                    onChange={(e) => onAnswer(field.fieldKey, e.target.value)}
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
                                value === opt.value
                                    ? "bg-primary/5 border-primary"
                                    : "hover:bg-muted/50",
                            )}
                        >
                            <input
                                type="radio"
                                name={field.fieldKey}
                                value={opt.value}
                                checked={value === opt.value}
                                onChange={(e) => onAnswer(field.fieldKey, e.target.value)}
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
                        const checked = (value as string[]) || []
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
                                        onAnswer(field.fieldKey, newVal)
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
                            variant={value === opt ? "default" : "outline"}
                            onClick={() => onAnswer(field.fieldKey, opt)}
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
                            variant={value === star ? "default" : "outline"}
                            size="icon"
                            onClick={() => onAnswer(field.fieldKey, star)}
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
                    value={(value as string) || ""}
                    onChange={(e) => onAnswer(field.fieldKey, e.target.value)}
                    className={errorClasses}
                />
            )
    }
}