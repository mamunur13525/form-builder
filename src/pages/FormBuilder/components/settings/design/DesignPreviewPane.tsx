import type { EndPage, FormPage } from "@/shared/types/common"
import type { ResolvedFormTheme } from "@/shared/utils/theme"
import { PageContentEditor } from "../../PageContentEditor/PageContentEditor"
import { EndPageContentEditor } from "../../EndPage/EndPageContentEditor"

const noop = () => { }

interface DesignPreviewPaneProps {
    theme: ResolvedFormTheme
    page?: FormPage
    pageIndex: number
    onUpdatePage?: (index: number, updates: Partial<FormPage>) => void
    endPage?: EndPage
    endPageIndex: number
    onUpdateEndPage?: (index: number, updates: Partial<EndPage>) => void
}

/** Live form preview shown next to the theme controls. */
export function DesignPreviewPane({
    theme,
    page,
    pageIndex,
    onUpdatePage,
    endPage,
    endPageIndex,
    onUpdateEndPage,
}: DesignPreviewPaneProps) {
    return (
        <div className="relative h-full min-h-0 flex-1 overflow-hidden bg-[#F4F6FB] dark:bg-[#0c0c0f] p-6 sm:p-10 flex flex-col items-center justify-center">
            {/* Ambient glow blobs */}
            <div className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-purple-200/25 dark:bg-purple-900/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-indigo-200/25 dark:bg-[#FF5722]/10 blur-3xl" />

            <div className="light relative z-10 flex flex-col h-full max-h-[85vh] w-full max-w-4xl overflow-hidden rounded-lg border border-slate-200/80 bg-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.07)] dark:shadow-2xl">
                {/* Mockup Window Header */}
                <div className="flex h-11 shrink-0 items-center justify-between border-b border-slate-100 bg-white/95 px-4 backdrop-blur-xs select-none">
                    <div className="mx-auto flex items-center gap-1.5 rounded-full bg-slate-100/80 px-4 py-1 text-xs font-medium text-slate-500">
                        <span>Live Theme Preview</span>
                    </div>

                </div>

                <div className="relative flex-1 min-h-0 overflow-y-auto bg-white">
                    {endPage ? (
                        <EndPageContentEditor
                            endPage={endPage}
                            endPageIndex={endPageIndex}
                            onUpdate={onUpdateEndPage ?? noop}
                            isMobileView={false}
                            theme={theme}
                        />
                    ) : page ? (
                        <PageContentEditor
                            page={page}
                            pageIndex={pageIndex}
                            onUpdate={onUpdatePage ?? noop}
                            isMobileView={false}
                            theme={theme}
                        />
                    ) : (
                        <div className="flex h-64 items-center justify-center text-sm text-slate-400">
                            Select a page to see live preview
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
