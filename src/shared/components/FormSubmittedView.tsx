import { motion } from "framer-motion"
import { Check, RotateCcw } from "lucide-react"
import { Button } from "../../components/ui/button"

interface FormSubmittedViewProps {
    onReset: () => void
}

export function FormSubmittedView({ onReset }: FormSubmittedViewProps) {
    return (
        <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-gradient-to-b from-muted/40 via-background to-background p-6">
            {/* Ambient background accents */}
            <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-green-500/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />

            <motion.div
                initial={{ y: 24, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="relative z-10 w-full max-w-md text-center"
            >
                {/* Success mark */}
                <div className="relative mx-auto mb-8 flex h-24 w-24 items-center justify-center">
                    <motion.span
                        initial={{ scale: 0.6, opacity: 0 }}
                        animate={{ scale: 1.35, opacity: 0 }}
                        transition={{ delay: 0.35, duration: 1, repeat: Infinity, repeatDelay: 0.4, ease: "easeOut" }}
                        className="absolute inset-0 rounded-full bg-green-500/20"
                    />
                    <motion.div
                        initial={{ scale: 0, rotate: -12 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: 0.15, type: "spring", stiffness: 220, damping: 14 }}
                        className="relative flex h-24 w-24 items-center justify-center rounded-full bg-green-500 text-white shadow-lg shadow-green-500/30 ring-8 ring-green-500/10"
                    >
                        <motion.div
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: 1 }}
                            transition={{ delay: 0.35, duration: 0.4 }}
                        >
                            <Check className="h-11 w-11" strokeWidth={3} />
                        </motion.div>
                    </motion.div>
                </div>

                <motion.h2
                    initial={{ y: 12, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.4 }}
                    className="text-3xl font-bold tracking-tight text-foreground"
                >
                    Thank you!
                </motion.h2>
                <motion.p
                    initial={{ y: 12, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.4 }}
                    className="mx-auto mt-3 max-w-sm text-base leading-relaxed text-muted-foreground"
                >
                    Your response has been submitted successfully. We appreciate you taking the time to fill this out.
                </motion.p>

                <motion.div
                    initial={{ y: 12, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.4 }}
                    className="mt-8"
                >
                    <Button variant="outline" size="lg" onClick={onReset} className="gap-2 px-6">
                        <RotateCcw className="h-4 w-4" />
                        Submit another response
                    </Button>
                </motion.div>
            </motion.div>
        </div>
    )
}
