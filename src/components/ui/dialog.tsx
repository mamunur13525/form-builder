import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "../../shared/utils/cn"

interface DialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    children: React.ReactNode
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
    return (
        <AnimatePresence>
            {open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <motion.div
                        className="fixed inset-0 bg-black/50"
                        onClick={() => onOpenChange(false)}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    />
                    <motion.div
                        className="relative z-50 w-full max-w-lg rounded-lg border bg-background p-6 shadow-lg mx-4"
                        initial={{ opacity: 0, scale: 0.96, y: -12 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: 12 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                    >
                        {children}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}

export function DialogHeader({ children, className }: { children: React.ReactNode; className?: string }) {
    return <div className={cn("mb-4", className)}>{children}</div>
}

export function DialogTitle({ children, className }: { children: React.ReactNode; className?: string }) {
    return <h2 className={cn("text-lg font-semibold", className)}>{children}</h2>
}

export function DialogDescription({ children, className }: { children: React.ReactNode; className?: string }) {
    return <p className={cn("text-sm text-muted-foreground", className)}>{children}</p>
}

export function DialogFooter({ children, className }: { children: React.ReactNode; className?: string }) {
    return <div className={cn("flex justify-end gap-2 mt-4", className)}>{children}</div>
}

export function DialogContent({ children, className }: { children: React.ReactNode; className?: string }) {
    return <div className={cn("", className)}>{children}</div>
}