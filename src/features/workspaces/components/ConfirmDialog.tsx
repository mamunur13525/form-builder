import type { ReactNode } from "react"
import { Loader2 } from "lucide-react"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface ConfirmDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    title: string
    description: ReactNode
    confirmLabel: string
    cancelLabel?: string
    /** Renders the confirm button in destructive styling. */
    destructive?: boolean
    isPending?: boolean
    onConfirm: () => void
}

/**
 * Confirmation gate for actions that cannot be undone — removing a member,
 * leaving, deleting a workspace, transferring ownership.
 *
 * Wrapped once here rather than inlined at each call site so every destructive
 * action in the feature gets the same treatment and none can ship without a
 * confirmation step.
 */
export function ConfirmDialog({
    open,
    onOpenChange,
    title,
    description,
    confirmLabel,
    cancelLabel = "Cancel",
    destructive = false,
    isPending = false,
    onConfirm,
}: ConfirmDialogProps) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            {/* Portalled by Base UI, so the theme class must be re-applied. */}
            <AlertDialogContent className="editorial rounded-[24px] border border-[var(--border)] bg-[var(--card)] p-8">
                <AlertDialogHeader>
                    <AlertDialogTitle className="font-display text-xl text-[var(--foreground)]">
                        {title}
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-sm leading-6 text-[var(--editorial-body)]">
                        {description}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel
                        disabled={isPending}
                        className="h-11 rounded-[16px] border-[var(--border)] px-6"
                    >
                        {cancelLabel}
                    </AlertDialogCancel>
                    <AlertDialogAction
                        type="button"
                        disabled={isPending}
                        onClick={onConfirm}
                        className={
                            destructive
                                ? "editorial-transition h-11 rounded-[16px] bg-[var(--destructive)] px-6 text-sm font-medium text-white hover:opacity-90 active:scale-[.98]"
                                : "editorial-transition h-11 rounded-[16px] bg-[var(--primary)] px-6 text-sm font-medium text-white hover:bg-[var(--editorial-primary-hover)] active:scale-[.98]"
                        }
                    >
                        {isPending ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Working…
                            </>
                        ) : (
                            confirmLabel
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
