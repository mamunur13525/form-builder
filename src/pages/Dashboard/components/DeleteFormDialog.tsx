import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogFooter,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogCancel,
    AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { useDeleteForm } from "@/features/forms/hooks/useForms";

interface DeleteFormDialogProps {
    formId: string;
    formTitle: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export function DeleteFormDialog({
    formId,
    formTitle,
    open,
    onOpenChange,
    onSuccess,
}: DeleteFormDialogProps) {
    const deleteFormMutation = useDeleteForm();

    const handleDelete = () => {
        deleteFormMutation.mutate(formId, {
            onSuccess: () => {
                onOpenChange(false);
                onSuccess?.();
            },
        });
    };

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="editorial editorial-shadow rounded-[30px] bg-[var(--popover)] p-10 ring-0">
                <AlertDialogHeader>
                    <AlertDialogTitle className="font-display text-[32px] leading-tight text-[var(--foreground)]">
                        Delete Form
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-base leading-6 text-[var(--editorial-body)]">
                        Are you sure you want to delete "{formTitle}"? This action cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="gap-3">
                    <AlertDialogCancel
                        onClick={() => onOpenChange(false)}
                        disabled={deleteFormMutation.isPending}
                        className="editorial-transition h-[52px] rounded-[16px] border-[var(--border)] bg-[var(--card)] px-6 text-sm text-[var(--foreground)] hover:-translate-y-0.5 hover:border-[var(--editorial-primary-ring)] hover:bg-[var(--editorial-primary-light)] active:translate-y-0 active:scale-[.98]"
                    >
                        Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDelete}
                        disabled={deleteFormMutation.isPending}
                        className="editorial-transition h-[52px] rounded-[16px] border border-[var(--destructive)]/25 bg-[var(--destructive)]/10 px-6 text-sm font-medium text-[var(--destructive)] hover:-translate-y-0.5 hover:bg-[var(--destructive)]/16 active:translate-y-0 active:scale-[.98]"
                    >
                        {deleteFormMutation.isPending ? "Deleting..." : "Delete"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}