import { ExternalLink, Loader2, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type PublishState = "draft" | "pending" | "live";
export type Confirming = "unpublish" | "discard";
export type Busy = "publish" | "unpublish" | "discard";

export const COPY: Record<PublishState, { badge: string; title: string; body: string }> = {
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

export const CONFIRM_COPY: Record<
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

interface PublishDialogFooterProps {
  state: PublishState;
  confirming: Confirming | null;
  isBusy: boolean;
  busy: Busy | null;
  confirmActionLabel?: string;
  onClose: () => void;
  onCancelConfirm: () => void;
  onConfirmAction: () => void;
  onPublish: () => void;
  onOpenForm: () => void;
  onStartConfirm: (type: Confirming) => void;
}

export function PublishDialogFooter({
  state,
  confirming,
  isBusy,
  busy,
  confirmActionLabel,
  onClose,
  onCancelConfirm,
  onConfirmAction,
  onPublish,
  onOpenForm,
  onStartConfirm,
}: PublishDialogFooterProps) {
  return (
    <div
      className={cn(
        "mt-8 flex flex-col gap-2.5 border-t border-slate-200/90 dark:border-zinc-800/90 bg-slate-50/80 dark:bg-[#18181c]/80 px-6 py-4 sm:flex-row sm:items-center sm:gap-2.5",
        !confirming && state !== "draft" ? "sm:justify-between" : "sm:justify-end",
      )}
    >
      {confirming ? (
        <>
          <Button
            variant="outline"
            onClick={onCancelConfirm}
            disabled={isBusy}
            className="h-10 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-[#1a1a20] px-4 text-sm font-medium text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer w-full sm:w-auto shadow-xs"
          >
            Keep it
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirmAction}
            disabled={isBusy}
            className="h-10 rounded-lg bg-rose-600 hover:bg-rose-700 text-white px-5 text-sm font-semibold shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2 w-full sm:w-auto"
          >
            {isBusy && <Loader2 className="animate-spin h-4 w-4" />}
            {isBusy ? "Working…" : confirmActionLabel}
          </Button>
        </>
      ) : state === "draft" ? (
        <>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isBusy}
            className="h-10 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-[#1a1a20] px-4 text-sm font-medium text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer w-full sm:w-auto shadow-xs"
          >
            Cancel
          </Button>
          <Button
            onClick={onPublish}
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
            onClick={() => onStartConfirm("discard")}
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
              onClick={onPublish}
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
            onClick={() => onStartConfirm("unpublish")}
            disabled={isBusy}
          >
            Unpublish
          </Button>
          <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:gap-2.5">
            <Button
              variant="outline"
              onClick={onClose}
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
    </div>
  );
}
