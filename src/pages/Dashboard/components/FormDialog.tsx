import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect } from "react";
import {
    Dialog,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogContent,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useCreateForm, useUpdateForm } from "@/features/forms/hooks/useForms";
import { Spinner } from "@/components/ui/spinner";
import { showWarning } from "@/shared/hooks/useToast";

const formSchema = z.object({
    title: z.string().min(1, "Form name is required"),
});

type FormValues = z.infer<typeof formSchema>;

type FormDialogType = "create" | "rename";

interface FormDialogProps {
    type: FormDialogType;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialTitle?: string;
    formId?: string;
    onSuccess?: (title?: string) => void;
}

export function FormDialog({
    type,
    open,
    onOpenChange,
    initialTitle = "",
    formId,
    onSuccess,
}: FormDialogProps) {
    const navigate = useNavigate();
    const createForm = useCreateForm();
    const updateFormMutation = useUpdateForm();

    const {
        register,
        handleSubmit: handleFormSubmit,
        reset,
        formState: { errors },
    } = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: initialTitle,
        },
    });

    const isCreate = type === "create";
    const isPending = createForm.isPending || updateFormMutation.isPending;

    const onSubmit = async (values: FormValues) => {
        const trimmedTitle = values.title.trim() || "Untitled Form";

        if (type === "create") {
            createForm.mutate(
                { title: trimmedTitle },
                {
                    onSuccess: (created) => {
                        reset();
                        onOpenChange(false);
                        navigate(`/form-builder/${created.id}`);
                    },
                }
            );
        } else if (type === "rename" && formId) {
            if (trimmedTitle === initialTitle) {
                showWarning("Please change the form title");
                return;
            }

            updateFormMutation.mutate(
                { formId, data: { title: trimmedTitle } },
                {
                    onSuccess: (updated) => {
                        onOpenChange(false);
                        onSuccess?.(updated.title);
                    },
                    onError: (error) => {
                        console.error("Failed to rename form:", error);
                    },
                }
            );
        }
    };

    // Reset form when dialog opens
    useEffect(() => {
        if (open) {
            reset({ title: initialTitle });
        }
    }, [open, initialTitle, reset]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{isCreate ? "Create New Form" : "Rename Form"}</DialogTitle>
                    {isCreate && (
                        <DialogDescription>
                            Give your form a name to get started.
                        </DialogDescription>
                    )}
                </DialogHeader>
                <form onSubmit={handleFormSubmit(onSubmit)}>
                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label htmlFor="form-title">Form Name</Label>
                            <Input
                                id="form-title"
                                placeholder={isCreate ? "e.g. Customer Feedback Survey" : "Enter form title"}
                                autoFocus
                                {...register("title")}
                            />
                            {errors.title && (
                                <p className="text-sm text-destructive">{errors.title.message}</p>
                            )}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isPending}>
                            {isPending ? (isCreate ? "Creating..." : "Saving...") : isCreate ? "Create Form" : "Save"}
                            {isPending && <Spinner data-icon="inline-start" />}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}