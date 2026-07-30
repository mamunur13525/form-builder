import { motion } from "framer-motion"
import { Card, CardContent, CardFooter } from "../../components/ui/card"
import { Button } from "../../components/ui/button"

interface FormSubmittedViewProps {
    onReset: () => void
}

export function FormSubmittedView({ onReset }: FormSubmittedViewProps) {
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
                        <Button onClick={onReset}>
                            Submit another response
                        </Button>
                    </CardFooter>
                </Card>
            </motion.div>
        </div>
    )
}