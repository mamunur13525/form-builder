import { Button } from "@/components/ui/button"
import { ConfirmPopover } from "../primitives"
import { Save, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface DesignFooterProps {
    cancelPopoverOpen: boolean
    onCancelOpenChange: (open: boolean) => void
    onConfirmCancel: () => void
    savePopoverOpen: boolean
    onSaveOpenChange: (open: boolean) => void
    onConfirmSave: () => void
    isSaving: boolean
    vibratingButton: "cancel" | "save" | null
}

/** Cancel / Save Design actions, each behind a confirm popover. */
export function DesignFooter({
    cancelPopoverOpen,
    onCancelOpenChange,
    onConfirmCancel,
    savePopoverOpen,
    onSaveOpenChange,
    onConfirmSave,
    isSaving,
    vibratingButton,
}: DesignFooterProps) {
    return (
        <div className="flex shrink-0 items-center justify-between gap-3 border-t border-slate-100 dark:border-zinc-800 bg-white dark:bg-[#141418] p-4">
            <ConfirmPopover
                open={cancelPopoverOpen}
                onOpenChange={onCancelOpenChange}
                align="start"
                title="Discard theme changes?"
                description="You have unsaved theme changes. If you cancel, all changes will be lost."
                onConfirm={onConfirmCancel}
                destructive
                trigger={
                    <Button
                        variant="outline"
                        className={cn(
                            "flex-1 h-10 rounded-lg border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm font-medium text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-white shadow-xs cursor-pointer",
                            vibratingButton === "cancel" && "editorial-vibrate"
                        )}
                    >
                        <X className="h-4 w-4 mr-1.5 text-slate-500 dark:text-zinc-400" />
                        Cancel
                    </Button>
                }
            />

            <ConfirmPopover
                open={savePopoverOpen}
                onOpenChange={onSaveOpenChange}
                align="end"
                title="Save theme changes?"
                description="This will apply the theme changes to the entire form and update the server."
                onConfirm={onConfirmSave}
                confirmDisabled={isSaving}
                trigger={
                    <Button
                        disabled={isSaving}
                        className={cn(
                            "flex-1 h-10 rounded-lg bg-[#FF5722] hover:bg-[#F4511E] text-sm font-medium text-white shadow-xs cursor-pointer transition-colors",
                            vibratingButton === "save" && "editorial-vibrate"
                        )}
                    >
                        <Save className="h-4 w-4 mr-1.5" />
                        {isSaving ? "Saving..." : "Save Design"}
                    </Button>
                }
            />
        </div>
    )
}
