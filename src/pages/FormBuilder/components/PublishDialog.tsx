import { useCallback } from "react";
import { CheckCircle, Copy } from "lucide-react";
import { CopyToClipboard } from "@/shared/components/CopyToClipboard";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useFormStore } from "../../../app/store/formStore";

interface PublishDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formId: string | undefined;
  isPublished: boolean;

  onIsPublishedChange: (published: boolean) => void;
  onOpenForm: () => void;
}

export function PublishDialog({
  open,
  onOpenChange,
  formId,
  isPublished,

  onIsPublishedChange,
  onOpenForm,
}: PublishDialogProps) {
  const { publishForm } = useFormStore();

  const handlePublish = useCallback(async () => {
    if (!formId || formId === "new") return;
    await publishForm(formId);
    onIsPublishedChange(true);
  }, [formId, publishForm, onIsPublishedChange]);

  const publishedFormUrl = `${window.location.origin}/form/${formId}`;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isPublished ? "Form Published" : "Publish Form"}
          </DialogTitle>
          <DialogDescription>
            {isPublished
              ? "Your form is live and ready to collect responses."
              : "Publish your form to make it available for users to fill out."}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {isPublished ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">Form is published</span>
              </div>
              <div className="space-y-2">
                <Label className="text-base text-muted-foreground">
                  Form Link
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    readOnly
                    value={publishedFormUrl}
                    className="text-sm"
                  />
                  <CopyToClipboard text={publishedFormUrl}>
                    <Button
                      variant="outline"
                      size="sm"
                      type="button"
                      className={'rounded-md py-4.5 cursor-pointer'}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </CopyToClipboard>
                </div>
              </div>
              <Button className="w-full" onClick={onOpenForm}>
                Open Form
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Are you sure you want to publish this form? Once published,
                users will be able to access and submit the form.
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1"
                  onClick={async () => {
                    await handlePublish();
                    onOpenChange(false);
                  }}
                >
                  Publish Now
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
