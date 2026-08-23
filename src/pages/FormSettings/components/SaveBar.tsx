import { Loader2, CheckCheck, AlertCircle } from "lucide-react"
import { Button } from "../../../components/ui/button"
import { cn } from "@/lib/utils"
import type { SaveStatus } from "@/features/forms/hooks/form-context"

/**
 * Per-section save controls: a status message on the left and a Save button on
 * the right. Sticky to the bottom of the settings content column so it stays
 * reachable while a long section scrolls.
 *
 * It is presentational — the owning section decides when it is `dirty`, drives
 * the mutation, and feeds the resulting `status` back in.
 */
export interface SaveBarProps {
    /** Transient save state, typically mirrored from the form context. */
    status: SaveStatus
    /** Whether the local values differ from what was last loaded/saved. */
    dirty: boolean
    /** Invoked when the user clicks Save. */
    onSave: () => void
    /** Disable saving regardless of dirtiness (e.g. while the section loads). */
    disabled?: boolean
    /** Message shown when `status === "error"`. */
    errorMessage?: string
}

export function SaveBar({
    status,
    dirty,
    onSave,
    disabled = false,
    errorMessage,
}: SaveBarProps) {
    const isSaving = status === "saving"
    const canSave = dirty && !disabled && !isSaving

    return (
        <div className="sticky bottom-0 z-10 mt-6 flex items-center justify-between gap-4 rounded-xl border border-[var(--border)] bg-[var(--card)]/95 px-5 py-3 shadow-[0_-1px_2px_rgba(0,0,0,0.04)] backdrop-blur">
            <div className="flex min-w-0 items-center gap-1.5 text-[13px]">
                {isSaving && (
                    <span className="flex items-center gap-1.5 text-[var(--editorial-subtle)]">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Saving…
                    </span>
                )}
                {status === "saved" && (
                    <span className="flex items-center gap-1.5 text-[var(--editorial-subtle)]">
                        <CheckCheck className="h-4 w-4 text-[var(--editorial-success)]" />
                        Saved
                    </span>
                )}
                {status === "error" && (
                    <span className="flex items-center gap-1.5 text-[var(--destructive)]">
                        <AlertCircle className="h-4 w-4" />
                        <span className="truncate">
                            {errorMessage ?? "Couldn’t save changes"}
                        </span>
                    </span>
                )}
                {status === "idle" && dirty && (
                    <span className="text-[var(--muted-foreground)]">
                        Unsaved changes
                    </span>
                )}
            </div>

            <Button
                type="button"
                size="sm"
                onClick={onSave}
                disabled={!canSave}
                className={cn(!canSave && "cursor-not-allowed")}
            >
                {isSaving ? "Saving…" : "Save changes"}
            </Button>
        </div>
    )
}
