import { motion } from "framer-motion"

interface FormProgressBarProps {
    currentStep: number
    totalSteps: number
}

export function FormProgressBar({ currentStep, totalSteps }: FormProgressBarProps) {
    return (
        <div className="w-full bg-muted h-1 shrink-0">
            <motion.div
                className="bg-primary h-1"
                initial={false}
                animate={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
                transition={{ duration: 0.4, ease: "easeOut" }}
            />
        </div>
    )
}