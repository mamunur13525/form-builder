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
import { Spinner } from "@/components/ui/spinner"

interface CancelDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    planName: string
    isPending: boolean
    onConfirm: () => void
}

/**
 * Confirms the "downgrade to Free" action, which cancels the subscription at
 * the end of the current billing period (paid access continues until then).
 */
export function CancelDialog({
    open,
    onOpenChange,
    planName,
    isPending,
    onConfirm,
}: CancelDialogProps) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="editorial editorial-shadow rounded-2xl bg-[var(--popover)] p-6 ring-0 sm:p-10">
                <AlertDialogHeader>
                    <AlertDialogTitle className="font-display text-2xl leading-tight text-[var(--foreground)] sm:text-[32px]">
                        Downgrade to Free
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-sm leading-6 text-[var(--editorial-body)] sm:text-base">
                        Your {planName} plan stays active until the end of the current
                        billing period. After that your account moves to the Free plan —
                        your forms and responses are never deleted.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="gap-3">
                    <AlertDialogCancel
                        onClick={() => onOpenChange(false)}
                        disabled={isPending}
                        variant="ghost"
                        className="w-full sm:w-auto"
                    >
                        Keep my plan
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={onConfirm}
                        disabled={isPending}
                        variant="destructive"
                        className="w-full sm:w-auto"
                    >
                        {isPending && <Spinner className="mr-2 h-4 w-4" />}
                        {isPending ? "Cancelling…" : "Cancel subscription"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
