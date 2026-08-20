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
      className="editorial editorial-shadow max-w-xl overflow-hidden rounded-[30px] border-[var(--border)] bg-[var(--popover)] p-0"
    >
      <DialogContent>
        <div className="px-10 pt-10">
          {/* Status pill. Muted, warm tints keep the palette calm — the coral
              accent stays reserved for the primary action. */}
          <span
            className={cn(
              "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[12px] font-semibold uppercase tracking-[0.08em]",
              state === "live" &&
              "border-[var(--editorial-success)]/30 bg-[var(--editorial-success)]/12 text-[#4E7F62]",
              state === "pending" &&
              "border-[var(--editorial-purple)]/25 bg-[var(--editorial-purple-light)] text-[var(--editorial-purple)]",
              state === "draft" &&
              "border-[var(--border)] bg-[var(--secondary)] text-[var(--editorial-subtle)]",
            )}
          >
            {state === "live" ? (
              <span className="relative flex size-1.5">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-[var(--editorial-success)] opacity-75" />
                <span className="relative inline-flex size-1.5 rounded-full bg-[var(--editorial-success)]" />
              </span>
            ) : (
              <span
                className={cn(
                  "size-1.5 rounded-full",
                  state === "pending"
                    ? "bg-[var(--editorial-purple)]"
                    : "bg-[var(--editorial-disabled)]",
                )}
              />
            )}
            {copy.badge}
          </span>

          <DialogHeader className="mt-6 mb-0 space-y-2">
            <DialogTitle className="font-display text-[32px] leading-tight text-[var(--foreground)]">
              {confirmCopy?.title ?? title ?? copy.title}
            </DialogTitle>
            <DialogDescription className="text-base leading-6 text-[var(--editorial-body)]">
              {confirmCopy?.body ?? description ?? copy.body}
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* The confirmation step replaces the body entirely to keep focus on
            the decision being made. */}
        {!confirming && (
          <div className="space-y-6 px-10 pt-8">
            {state === "pending" && (
              <Alert className="rounded-[18px] border-[var(--editorial-purple)]/25 bg-[var(--editorial-purple-light)]">
                <AlertCircle className="text-[var(--editorial-purple)]" />
                <AlertTitle className="text-[var(--foreground)]">
                  Respondents still see the old version
                </AlertTitle>
                <AlertDescription className="text-xs leading-5 text-[var(--editorial-body)]">
                  Publishing replaces the live form with your current draft.
                </AlertDescription>
              </Alert>
            )}

            {state === "draft" ? (
              <ul className="overflow-hidden rounded-[18px] border border-[var(--editorial-border-light)] bg-[var(--card)] text-sm">
                <li className="flex items-center gap-3 px-5 py-4">
                  <Globe className="size-5 shrink-0 text-[var(--editorial-subtle)]" />
                  <span className="text-[var(--editorial-body)]">
                    Reachable at a public link
                  </span>
                </li>
                <li className="flex items-center gap-3 border-t border-[var(--editorial-border-light)] px-5 py-4">
                  <Inbox className="size-5 shrink-0 text-[var(--editorial-subtle)]" />
                  <span className="text-[var(--editorial-body)]">
                    Starts collecting responses
                  </span>
                </li>
              </ul>
            ) : (
              <div className="space-y-2">
                <Label
                  htmlFor="published-form-url"
                  className="editorial-eyebrow text-[var(--editorial-subtle)]"
                >
                  Public link
                </Label>
                <div className="editorial-transition flex items-center gap-2 rounded-xl border border-[var(--input)] bg-[var(--card)] pl-5 pr-2 focus-within:border-[var(--primary)]">
                  <Globe className="size-5 shrink-0 text-[var(--editorial-subtle)]" />
                  <input
                    id="published-form-url"
                    readOnly
                    value={publishedFormUrl}
                    onFocus={(event) => event.currentTarget.select()}
                    className="min-w-0 flex-1 bg-transparent py-3.5 font-mono text-xs text-[var(--foreground)] outline-none"
                  />
                  <CopyToClipboard text={publishedFormUrl} />
                </div>
              </div>
            )}
          </div>
        )}

        <DialogFooter
          className={cn(
            "mt-10 items-center gap-3 border-t border-[var(--editorial-border-light)] bg-[var(--secondary)] px-10 py-6",
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
                className="border border-[var(--destructive)]/25 bg-[var(--destructive)]/10"
              >
                {isBusy && <Loader2 className="animate-spin" />}
                {isBusy ? "Working…" : confirmCopy?.action}
              </Button>
            </>
          ) : state === "draft" ? (
            <>
              <Button
                variant="ghost"
                onClick={closeDialog}
                disabled={isBusy}
                className="border border-[var(--border)] bg-[var(--card)]"
              >
                Cancel
              </Button>
              <Button
                onClick={handlePublish}
                disabled={isBusy}
                className="bg-[var(--primary)] text-white"
              >
                {busy === "publish" && <Loader2 className="animate-spin" />}
                {busy === "publish" ? "Publishing…" : "Publish form"}
              </Button>
            </>
          ) : state === "pending" ? (
            <>
              <Button
                variant="ghost"
                className="border border-[var(--border)] bg-[var(--card)] hover:text-[var(--destructive)]"
                onClick={() => setConfirming("discard")}
                disabled={isBusy}
              >
                <Undo2 />
                Discard changes
              </Button>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={onOpenForm}
                  disabled={isBusy}
                  className="border border-[var(--border)] bg-[var(--card)]"
                >
                  <ExternalLink />
                  Open form
                </Button>
                <Button
                  onClick={handlePublish}
                  disabled={isBusy}
                  className="bg-[var(--primary)] text-white"
                >
                  {busy === "publish" && <Loader2 className="animate-spin" />}
                  {busy === "publish" ? "Publishing…" : "Publish changes"}
                </Button>
              </div>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                className="border border-[var(--border)] bg-[var(--card)] hover:text-[var(--destructive)]"
                onClick={() => setConfirming("unpublish")}
                disabled={isBusy}
              >
                Unpublish
              </Button>
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  onClick={closeDialog}
                  disabled={isBusy}
                >
                  Cancel
                </Button>
                <Button
                  onClick={onOpenForm}
                  disabled={isBusy}
                  className="bg-[var(--primary)] text-white"
                >
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
