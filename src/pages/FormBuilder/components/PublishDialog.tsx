import { useCallback, useState } from "react";
import {
  AlertCircle,
  Globe,
  Inbox,
} from "lucide-react";
import { CopyToClipboard } from "@/shared/components/CopyToClipboard";
import { showError, showSuccess } from "@/shared/hooks/useToast";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useFormStore } from "@/app/store/formStore";
import { cn } from "@/lib/utils";
import {
  PublishDialogFooter,
  type Busy,
  type Confirming,
  type PublishState,
  COPY,
  CONFIRM_COPY,
} from "./PublishDialogFooter";

interface PublishDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formId: string | undefined;
  isPublished: boolean;
  hasUnpublishedChanges?: boolean;
  title?: string;
  description?: string;
  onIsPublishedChange: (published: boolean) => void;
  onHasUnpublishedChangesChange?: (hasChanges: boolean) => void;
  onOpenForm: () => void;
  /**
   * Called after the server rewrites the form's pages (discarding a draft), so
   * the builder can re-sync the reverted content.
   */
  onAfterDiscard?: () => void | Promise<void>;
}

export function PublishDialog({
  open,
  onOpenChange,
  formId,
  isPublished,
  hasUnpublishedChanges = false,
  title,
  description,
  onIsPublishedChange,
  onHasUnpublishedChangesChange,
  onOpenForm,
  onAfterDiscard,
}: PublishDialogProps) {
  const { publishForm, unpublishForm, discardDraft } = useFormStore();
  const [busy, setBusy] = useState<Busy | null>(null);
  const [confirming, setConfirming] = useState<Confirming | null>(null);

  const isBusy = busy !== null;

  const closeDialog = useCallback(() => {
    setConfirming(null);
    onOpenChange(false);
  }, [onOpenChange]);

  const handlePublish = useCallback(async () => {
    if (!formId || formId === "new") return;
    setBusy("publish");
    try {
      const updated = await publishForm(formId);
      onIsPublishedChange(true);
      onHasUnpublishedChangesChange?.(updated.hasUnpublishedChanges ?? false);
      showSuccess("Form published", "Your form is live.");
    } catch (error) {
      showError("Failed to publish form", error);
    } finally {
      setBusy(null);
    }
  }, [
    formId,
    publishForm,
    onIsPublishedChange,
    onHasUnpublishedChangesChange,
  ]);

  const handleUnpublish = useCallback(async () => {
    if (!formId || formId === "new") return;
    setBusy("unpublish");
    try {
      const updated = await unpublishForm(formId);
      onIsPublishedChange(updated.status === "published");
      onHasUnpublishedChangesChange?.(updated.hasUnpublishedChanges ?? false);
      showSuccess("Form unpublished", "The public link is no longer active.");
    } catch (error) {
      showError("Failed to unpublish form", error);
    } finally {
      setBusy(null);
    }
  }, [
    formId,
    unpublishForm,
    onIsPublishedChange,
    onHasUnpublishedChangesChange,
  ]);

  const handleDiscard = useCallback(async () => {
    if (!formId || formId === "new") return;
    setBusy("discard");
    try {
      const updated = await discardDraft(formId);
      onIsPublishedChange(updated.status === "published");
      onHasUnpublishedChangesChange?.(updated.hasUnpublishedChanges ?? false);
      await onAfterDiscard?.();
      showSuccess("Changes discarded", "The form matches the live version.");
      closeDialog();
    } catch (error) {
      showError("Failed to discard changes", error);
    } finally {
      setBusy(null);
    }
  }, [
    formId,
    discardDraft,
    onIsPublishedChange,
    onHasUnpublishedChangesChange,
    onAfterDiscard,
    closeDialog,
  ]);

  const state: PublishState = !isPublished
    ? "draft"
    : hasUnpublishedChanges
      ? "pending"
      : "live";

  const copy = COPY[state];
  const confirmCopy = confirming ? CONFIRM_COPY[confirming] : null;
  const publishedFormUrl = `${window.location.origin}/form/${formId}`;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (isBusy) return;
        if (!next) setConfirming(null);
        onOpenChange(next);
      }}
      className="w-full max-w-lg overflow-hidden rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#141418] text-slate-900 dark:text-zinc-100 shadow-2xl p-0"
    >
      <DialogContent className="border-0 bg-transparent p-0 text-slate-900 dark:text-zinc-100">
        <div className="px-6 pt-6 sm:px-8 sm:pt-8">
          {/* Status pill */}
          <span
            className={cn(
              "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wider",
              state === "live" &&
                "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
              state === "pending" &&
                "border-[#FF5722]/30 bg-[#FF5722]/10 text-[#FF5722]",
              state === "draft" &&
                "border-slate-200 dark:border-zinc-800 bg-slate-100 dark:bg-zinc-800/80 text-slate-600 dark:text-zinc-400",
            )}
          >
            {state === "live" ? (
              <span className="relative flex size-1.5">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                <span className="relative inline-flex size-1.5 rounded-full bg-emerald-500" />
              </span>
            ) : (
              <span
                className={cn(
                  "size-1.5 rounded-full",
                  state === "pending"
                    ? "bg-[#FF5722]"
                    : "bg-slate-400 dark:bg-zinc-600",
                )}
              />
            )}
            {copy.badge}
          </span>

          <DialogHeader className="mt-4 mb-0 space-y-1.5">
            <DialogTitle className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {confirmCopy?.title ?? title ?? copy.title}
            </DialogTitle>
            <DialogDescription className="text-sm leading-relaxed text-slate-500 dark:text-zinc-400">
              {confirmCopy?.body ?? description ?? copy.body}
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* The confirmation step replaces the body entirely */}
        {!confirming && (
          <div className="space-y-5 px-6 pt-5 sm:px-8 sm:pt-6">
            {state === "pending" && (
              <Alert className="rounded-lg border border-[#FF5722]/30 bg-[#FF5722]/10 text-slate-900 dark:text-zinc-100">
                <AlertCircle className="text-[#FF5722] h-4 w-4" />
                <AlertTitle className="text-sm font-semibold text-slate-900 dark:text-white">
                  Respondents still see the old version
                </AlertTitle>
                <AlertDescription className="text-xs leading-relaxed text-slate-600 dark:text-zinc-400">
                  Publishing replaces the live form with your current draft.
                </AlertDescription>
              </Alert>
            )}

            {state === "draft" ? (
              <ul className="overflow-hidden rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-[#18181c] text-sm divide-y divide-slate-200 dark:divide-zinc-800">
                <li className="flex items-center gap-3 px-4 py-3">
                  <Globe className="size-4 shrink-0 text-slate-400 dark:text-zinc-500" />
                  <span className="text-slate-700 dark:text-zinc-300 font-medium">
                    Reachable at a public link
                  </span>
                </li>
                <li className="flex items-center gap-3 px-4 py-3">
                  <Inbox className="size-4 shrink-0 text-slate-400 dark:text-zinc-500" />
                  <span className="text-slate-700 dark:text-zinc-300 font-medium">
                    Starts collecting responses
                  </span>
                </li>
              </ul>
            ) : (
              <div className="space-y-1.5">
                <Label
                  htmlFor="published-form-url"
                  className="text-xs font-semibold text-slate-700 dark:text-zinc-300"
                >
                  Public link
                </Label>
                <div className="flex items-center gap-2 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-[#1a1a20] pl-3.5 pr-1.5 py-1 focus-within:border-[#FF5722] shadow-xs">
                  <Globe className="size-4 shrink-0 text-slate-400 dark:text-zinc-500" />
                  <input
                    id="published-form-url"
                    readOnly
                    value={publishedFormUrl}
                    onFocus={(event) => event.currentTarget.select()}
                    className="min-w-0 flex-1 bg-transparent py-1 font-mono text-xs text-slate-800 dark:text-zinc-200 outline-none"
                  />
                  <CopyToClipboard text={publishedFormUrl} />
                </div>
              </div>
            )}
          </div>
        )}

        <PublishDialogFooter
          state={state}
          confirming={confirming}
          isBusy={isBusy}
          busy={busy}
          confirmActionLabel={confirmCopy?.action}
          onClose={closeDialog}
          onCancelConfirm={() => setConfirming(null)}
          onConfirmAction={
            confirming === "unpublish" ? handleUnpublish : handleDiscard
          }
          onPublish={handlePublish}
          onOpenForm={onOpenForm}
          onStartConfirm={(type) => setConfirming(type)}
        />
      </DialogContent>
    </Dialog>
  );
}
