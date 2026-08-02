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
   * Called after the server rewrites the form's fields (discarding a draft), so
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
      closeDialog();
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
    closeDialog,
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
      closeDialog();
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
    closeDialog,
  ]);

  // Throws away draft edits and reverts to the live version. The server
  // rewrites the fields, so the builder has to re-sync afterwards.
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
      className="max-w-lg overflow-hidden rounded-2xl p-0"
    >
      <DialogContent>
        <div className="px-6 pt-6">
          {/* Status pill. Colours are alpha-composited so they hold up in
              both light and dark themes. */}
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium uppercase tracking-wider",
              state === "live" &&
              "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
              state === "pending" &&
              "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400",
              state === "draft" && "border-border bg-muted text-muted-foreground",
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
                  state === "pending" ? "bg-amber-500" : "bg-muted-foreground/50",
                )}
              />
            )}
            {copy.badge}
          </span>

          <DialogHeader className="mt-3 mb-0 space-y-1.5">
            <DialogTitle className="text-xl tracking-tight">
              {confirmCopy?.title ?? title ?? copy.title}
            </DialogTitle>
            <DialogDescription className="leading-relaxed">
              {confirmCopy?.body ?? description ?? copy.body}
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* The confirmation step replaces the body entirely to keep focus on
            the decision being made. */}
        {!confirming && (
          <div className="space-y-4 px-6 pt-5">
            {state === "pending" && (
              <Alert className="rounded-xl border-amber-500/25 bg-amber-500/[0.07]">
                <AlertCircle className="text-amber-600 dark:text-amber-500" />
                <AlertTitle className="text-amber-900 dark:text-amber-200">
                  Respondents still see the old version
                </AlertTitle>
                <AlertDescription className="text-xs leading-relaxed">
                  Publishing replaces the live form with your current draft.
                </AlertDescription>
              </Alert>
            )}

            {state === "draft" ? (
              <ul className="divide-y rounded-xl border bg-muted/30 text-sm">
                <li className="flex items-center gap-3 px-3.5 py-3">
                  <Globe className="size-4 shrink-0 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    Reachable at a public link
                  </span>
                </li>
                <li className="flex items-center gap-3 px-3.5 py-3">
                  <Inbox className="size-4 shrink-0 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    Starts collecting responses
                  </span>
                </li>
              </ul>
            ) : (
              <div className="space-y-2">
                <Label
                  htmlFor="published-form-url"
                  className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground"
                >
                  Public link
                </Label>
                <div className="flex items-center gap-1 rounded-xl border bg-muted/40 pl-3 transition-colors focus-within:border-ring/60 focus-within:bg-muted/60">
                  <Globe className="size-4 shrink-0 text-muted-foreground" />
                  <input
                    id="published-form-url"
                    readOnly
                    value={publishedFormUrl}
                    onFocus={(event) => event.currentTarget.select()}
                    className="min-w-0 flex-1 bg-transparent py-2.5 font-mono text-xs text-foreground outline-none"
                  />
                  <CopyToClipboard text={publishedFormUrl} />
                </div>
              </div>
            )}
          </div>
        )}

        <DialogFooter
          className={cn(
            "mt-6 items-center border-t bg-muted/30 px-6 py-4",
            !confirming && state !== "draft" && "justify-between",
          )}
        >
          {confirming ? (
            <>
              <Button
                variant="ghost"
                onClick={() => setConfirming(null)}
                disabled={isBusy}
              >
                Keep it
              </Button>
              <Button
                variant="destructive"
                onClick={
                  confirming === "unpublish" ? handleUnpublish : handleDiscard
                }
                disabled={isBusy}
              >
                {isBusy && <Loader2 className="animate-spin" />}
                {isBusy ? "Working…" : confirmCopy?.action}
              </Button>
            </>
          ) : state === "draft" ? (
            <>
              <Button variant="ghost" onClick={closeDialog} disabled={isBusy}>
                Cancel
              </Button>
              <Button onClick={handlePublish} disabled={isBusy}>
                {busy === "publish" && <Loader2 className="animate-spin" />}
                {busy === "publish" ? "Publishing…" : "Publish form"}
              </Button>
            </>
          ) : state === "pending" ? (
            <>
              <Button
                variant="ghost"
                className="text-muted-foreground hover:text-destructive"
                onClick={() => setConfirming("discard")}
                disabled={isBusy}
              >
                <Undo2 />
                Discard changes
              </Button>
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={onOpenForm} disabled={isBusy}>
                  <ExternalLink />
                  Open form
                </Button>
                <Button onClick={handlePublish} disabled={isBusy}>
                  {busy === "publish" && <Loader2 className="animate-spin" />}
                  {busy === "publish" ? "Publishing…" : "Publish changes"}
                </Button>
              </div>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                className="text-muted-foreground hover:text-destructive"
                onClick={() => setConfirming("unpublish")}
                disabled={isBusy}
              >
                Unpublish
              </Button>
              <div className="flex items-center gap-2">
                <Button variant="ghost" onClick={closeDialog} disabled={isBusy}>
                  Done
                </Button>
                <Button onClick={onOpenForm} disabled={isBusy}>
                  <ExternalLink />
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
