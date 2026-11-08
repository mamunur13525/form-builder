import React from "react"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import type { EndPage, FormPage, IFormTheme } from "@/shared/types/common"
import { DesignDrawer } from "./DesignDrawer"

interface DesignDrawerSheetProps {
    open: boolean
    onClose: () => void
    theme?: IFormTheme | null
    onSaveTheme: (theme: IFormTheme) => Promise<void>
    /** Page target — previewed when no end page is supplied. */
    page?: FormPage
    pageIndex?: number
    onUpdatePage?: (index: number, updates: Partial<FormPage>) => void
    /** End-page target — takes precedence over `page` in the live preview. */
    endPage?: EndPage
    endPageIndex?: number
    onUpdateEndPage?: (index: number, updates: Partial<EndPage>) => void
}

/**
 * Hosts the whole-form Design drawer as a right-side sheet. Lives at the page
 * level rather than inside a settings panel so the drawer is available for both
 * regular pages and end pages, and survives the compact-layout settings drawer
 * unmounting its children when closed.
 */
export function DesignDrawerSheet({
    open,
    onClose,
    theme,
    onSaveTheme,
    page,
    pageIndex,
    onUpdatePage,
    endPage,
    endPageIndex,
    onUpdateEndPage,
}: DesignDrawerSheetProps) {
    const hasChangesRef = React.useRef(false)

    return (
        <Sheet
            open={open}
            onOpenChange={(_open, eventDetails) => {
                // Keep the sheet open on an outside/focus dismissal while there
                // are unsaved theme changes — the drawer nudges its own footer.
                if (
                    hasChangesRef.current &&
                    (eventDetails?.reason === "outside-press" ||
                        eventDetails?.reason === "focus-out")
                ) {
                    return
                }
                onClose()
            }}
            modal
        >
            {/* `editorial` re-points the design tokens for this portalled surface. */}
            <SheetContent
                side="right"
                className="editorial h-full flex flex-col w-[92%] max-w-none min-w-0 overflow-hidden border-l border-slate-200/90 dark:border-zinc-800/90 bg-white dark:bg-[#141418] text-slate-800 dark:text-zinc-100 p-0 data-[side=right]:w-[92%] data-[side=right]:sm:max-w-none shadow-2xl"
                showCloseButton={false}
            >
                <div className="flex-1 min-h-0 w-full">
                    <DesignDrawer
                        open={open}
                        theme={theme}
                        page={page}
                        pageIndex={pageIndex}
                        onUpdatePage={onUpdatePage}
                        endPage={endPage}
                        endPageIndex={endPageIndex}
                        onUpdateEndPage={onUpdateEndPage}
                        onSaveTheme={onSaveTheme}
                        onCancel={onClose}
                        hasChangesRef={hasChangesRef}
                    />
                </div>
            </SheetContent>
        </Sheet>
    )
}
