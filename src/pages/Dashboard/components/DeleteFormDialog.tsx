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
            <AlertDialogContent className="editorial editorial-shadow rounded-2xl bg-[var(--popover)] p-6 sm:p-10 ring-0">
                <AlertDialogHeader>
                    <AlertDialogTitle className="font-display text-2xl leading-tight text-[var(--foreground)] sm:text-[32px]">
                        Delete Form
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-sm leading-6 text-[var(--editorial-body)] sm:text-base">
                        Are you sure you want to delete "{formTitle}"? This action cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="gap-3">
                    <AlertDialogCancel
                        onClick={() => onOpenChange(false)}
                        disabled={deleteFormMutation.isPending}
                        variant="ghost"
                        className="w-full sm:w-auto"
                    >
                        Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDelete}
                        disabled={deleteFormMutation.isPending}
                        variant="destructive"
                        className="w-full sm:w-auto"
                    >
                        {deleteFormMutation.isPending ? "Deleting..." : "Delete"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}