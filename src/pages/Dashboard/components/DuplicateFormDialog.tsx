import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDuplicateForm } from "@/features/forms/hooks/useForms";

interface DuplicateFormDialogProps {
  formId: string;
  formTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function DuplicateFormDialog({
  formId,
  formTitle,
  open,
  onOpenChange,
  onSuccess,
}: DuplicateFormDialogProps) {
  const [title, setTitle] = useState(formTitle);
  const duplicateFormMutation = useDuplicateForm();

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setTitle(formTitle);
    }
    onOpenChange(isOpen);
  };

  const handleDuplicate = () => {
    if (!title.trim()) return;

    duplicateFormMutation.mutate(
      { formId, title: title.trim() },
      {
        onSuccess: () => {
          onOpenChange(false);
          setTitle(formTitle);
          onSuccess?.();
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="editorial editorial-shadow rounded-2xl bg-[var(--popover)] p-6 ring-0 sm:px-7 sm:py-7 w-full">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl leading-tight text-[var(--foreground)] sm:text-[32px]">
            Duplicate Form
          </DialogTitle>
          <DialogDescription className="text-sm leading-6 text-[var(--editorial-body)] sm:text-base">
            Enter a name for the duplicated form. The new form will be created
            as a draft.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 mb-4">
          <label
            htmlFor="duplicate-form-title"
            className="text-sm font-medium text-[var(--foreground)]"
          >
            Form Name
          </label>
          <Input
            id="duplicate-form-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter form name"
            onKeyDown={(e) => {
              if (e.key === "Enter" && title.trim()) {
                handleDuplicate();
              }
            }}
          />
        </div>

        <DialogFooter className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button
                variant="ghost"
                onClick={() => handleOpenChange(false)}
                disabled={duplicateFormMutation.isPending}
                className="w-full sm:w-auto"
            >
                Cancel
          </Button>
          <Button
                onClick={handleDuplicate}
                disabled={duplicateFormMutation.isPending || !title.trim()}
                className="w-full sm:w-auto"
            >
                {duplicateFormMutation.isPending ? "Duplicating..." : "Duplicate"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
