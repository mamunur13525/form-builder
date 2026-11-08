import { useCallback, useState } from "react";
import {
  AlertCircle,
  ExternalLink,
  Globe,
  Inbox,
  Loader2,
  Undo2,
} from "lucide-react";
import { CopyToClipboard } from "@/shared/components/CopyToClipboard";
import { showError, showSuccess } from "@/shared/hooks/useToast";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useFormStore } from "@/app/store/formStore";
import { cn } from "@/lib/utils";

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

/** The three mutually exclusive states this dialog represents. */
type PublishState = "draft" | "pending" | "live";

/** A destructive action awaiting confirmation. */
type Confirming = "unpublish" | "discard";

/** Which async action is in flight. */
type Busy = "publish" | "unpublish" | "discard";

const COPY: Record<PublishState, { badge: string; title: string; body: string }> =
{
  draft: {
    badge: "Draft",
    title: "Publish form",
    body: "Make this form public so people can start responding.",
  },
  pending: {
    badge: "Changes pending",
    title: "Publish changes",
    body: "Your latest edits are saved, but only as a draft.",
  },
  live: {
    badge: "Live",
    title: "Form published",
    body: "Your form is live and collecting responses.",
  },
};

const CONFIRM_COPY: Record<
  Confirming,
  { title: string; body: string; action: string }
> = {
  unpublish: {
    title: "Take this form offline?",
    body: "The public link will stop working and nobody will be able to submit a response until you publish again. Existing responses are kept.",
    action: "Unpublish",
  },
  discard: {
    title: "Discard your unpublished changes?",
    body: "Your draft edits will be deleted and the form will revert to the version that is currently live. This cannot be undone.",
    action: "Discard changes",
  },
};

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

  // Publishes (or republishes) the form, closing the dialog only on success so
  // the user can retry after a failure.
  const handlePublish = useCallback(async () => {
    if (!formId || formId === "new") return;
    setBusy("publish");
    try {
      const updated = await publishForm(formId);
      onIsPublishedChange(true);
      // Republishing brings the live form back in sync with the draft.
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

  // Takes the form offline. The draft content is untouched, so the pending
  // flag is preserved as reported by the server.
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

  // Throws away draft edits and reverts to the live version. The server
  // rewrites the pages, so the builder has to re-sync afterwards.
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

        <DialogFooter
          className={cn(
            "mt-8 flex flex-col gap-2.5 border-t border-slate-200/90 dark:border-zinc-800/90 bg-slate-50/80 dark:bg-[#18181c]/80 px-6 py-4 sm:flex-row sm:items-center sm:gap-2.5",
            !confirming && state !== "draft" ? "sm:justify-between" : "sm:justify-end",
          )}
        >
          {confirming ? (
            <>
              <Button
                variant="outline"
                onClick={() => setConfirming(null)}
                disabled={isBusy}
                className="h-10 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-[#1a1a20] px-4 text-sm font-medium text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer w-full sm:w-auto shadow-xs"
              >
                Keep it
              </Button>
              <Button
                variant="destructive"
                onClick={
                  confirming === "unpublish" ? handleUnpublish : handleDiscard
                }
                disabled={isBusy}
                className="h-10 rounded-lg bg-rose-600 hover:bg-rose-700 text-white px-5 text-sm font-semibold shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2 w-full sm:w-auto"
              >
                {isBusy && <Loader2 className="animate-spin h-4 w-4" />}
                {isBusy ? "Working…" : confirmCopy?.action}
              </Button>
            </>
          ) : state === "draft" ? (
            <>
              <Button
                variant="outline"
                onClick={closeDialog}
                disabled={isBusy}
                className="h-10 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-[#1a1a20] px-4 text-sm font-medium text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer w-full sm:w-auto shadow-xs"
              >
                Cancel
              </Button>
              <Button
                onClick={handlePublish}
                disabled={isBusy}
                className="h-10 rounded-lg bg-[#FF5722] hover:bg-[#F4511E] px-5 text-sm font-semibold text-white shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2 w-full sm:w-auto active:scale-[0.98]"
              >
                {busy === "publish" && <Loader2 className="animate-spin h-4 w-4" />}
                {busy === "publish" ? "Publishing…" : "Publish form"}
              </Button>
            </>
          ) : state === "pending" ? (
            <>
              <Button
                variant="ghost"
                className="h-10 rounded-lg border border-rose-500/20 bg-rose-500/10 px-3.5 text-sm font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 transition-colors cursor-pointer flex items-center justify-center gap-2 w-full sm:w-auto"
                onClick={() => setConfirming("discard")}
                disabled={isBusy}
              >
                <Undo2 className="h-4 w-4" />
                Discard changes
              </Button>
              <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:gap-2.5">
                <Button
                  variant="outline"
                  onClick={onOpenForm}
                  disabled={isBusy}
                  className="h-10 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-[#1a1a20] px-4 text-sm font-medium text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer flex items-center justify-center gap-2 w-full sm:w-auto shadow-xs"
                >
                  <ExternalLink className="h-4 w-4" />
                  Open form
                </Button>
                <Button
                  onClick={handlePublish}
                  disabled={isBusy}
                  className="h-10 rounded-lg bg-[#FF5722] hover:bg-[#F4511E] px-5 text-sm font-semibold text-white shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2 w-full sm:w-auto active:scale-[0.98]"
                >
                  {busy === "publish" && <Loader2 className="animate-spin h-4 w-4" />}
                  {busy === "publish" ? "Publishing…" : "Publish changes"}
                </Button>
              </div>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                className="h-10 rounded-lg border border-rose-500/20 bg-rose-500/10 px-3.5 text-sm font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 transition-colors cursor-pointer flex items-center justify-center gap-2 w-full sm:w-auto"
                onClick={() => setConfirming("unpublish")}
                disabled={isBusy}
              >
                Unpublish
              </Button>
              <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:gap-2.5">
                <Button
                  variant="outline"
                  onClick={closeDialog}
                  disabled={isBusy}
                  className="h-10 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-[#1a1a20] px-4 text-sm font-medium text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer w-full sm:w-auto shadow-xs"
                >
                  Cancel
                </Button>
                <Button
                  onClick={onOpenForm}
                  disabled={isBusy}
                  className="h-10 rounded-lg bg-[#FF5722] hover:bg-[#F4511E] px-5 text-sm font-semibold text-white shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2 w-full sm:w-auto active:scale-[0.98]"
                >
                  <ExternalLink className="h-4 w-4" />
                  Open form
                </Button>
              </div>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
