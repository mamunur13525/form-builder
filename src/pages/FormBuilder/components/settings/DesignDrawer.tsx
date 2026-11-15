import React from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type {
    EndPage,
    FormPage,
    IFormTheme,
} from "@/shared/types/common"
import { Palette, SlidersHorizontal, Sparkles, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { DesignPreviewPane } from "./design/DesignPreviewPane"
import { ThemeSettingsTab } from "./design/ThemeSettingsTab"
import { ThemePresetsTab } from "./design/ThemePresetsTab"
import { DesignFooter } from "./design/DesignFooter"
import { useDesignDrawerDraft } from "./design/useDesignDrawerDraft"

interface DesignDrawerProps {
    open: boolean
    theme?: IFormTheme | null
    page?: FormPage
    pageIndex?: number
    onUpdatePage?: (index: number, updates: Partial<FormPage>) => void
    /** When set, the live preview shows this end page instead of `page`. */
    endPage?: EndPage
    endPageIndex?: number
    onUpdateEndPage?: (index: number, updates: Partial<EndPage>) => void
    onSaveTheme: (theme: IFormTheme) => Promise<void>
    onCancel: () => void
    hasChangesRef: React.MutableRefObject<boolean>
}

export function DesignDrawer({
    open,
    theme,
    page,
    pageIndex = 0,
    onUpdatePage,
    endPage,
    endPageIndex = 0,
    onUpdateEndPage,
    onSaveTheme,
    onCancel,
    hasChangesRef,
}: DesignDrawerProps) {
    const {
        containerRef,
        draftTheme,
        sidebarTab,
        setSidebarTab,
        activePresetId,
        applyPreset,
        patchTheme,
        patchFont,
        patchBackgroundImage,
        setBackgroundImageUrl,
        handleSaveClick,
        handleCancelClick,
        handleCancelPopoverOpenChange,
        cancelPopoverOpen,
        savePopoverOpen,
        setSavePopoverOpen,
        isSaving,
        vibratingButton,
    } = useDesignDrawerDraft({
        open,
        theme,
        onSaveTheme,
        onCancel,
        hasChangesRef,
    })

    return (
        <div ref={containerRef} className="flex h-full min-h-0 w-full overflow-hidden">
            <DesignPreviewPane
                theme={draftTheme}
                page={page}
                pageIndex={pageIndex}
                onUpdatePage={onUpdatePage}
                endPage={endPage}
                endPageIndex={endPageIndex}
                onUpdateEndPage={onUpdateEndPage}
            />

            {/* Controls sidebar */}
            <div className="flex h-full w-[470px] shrink-0 flex-col border-l border-slate-200/90 dark:border-zinc-800 bg-white dark:bg-[#141418]">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 px-6 py-4 shrink-0 bg-white dark:bg-[#141418]">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FF5722]/10 text-[#FF5722]">
                            <Palette className="h-4 w-4" />
                        </div>
                        <div>
                            <h3 className="text-base font-semibold text-slate-900 dark:text-zinc-100 leading-tight">Theme settings</h3>
                            <p className="text-xs text-slate-500 dark:text-zinc-400">Customize form colors, fonts & layout</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => handleCancelPopoverOpenChange(true)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                        title="Close design settings"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <Tabs
                    value={sidebarTab}
                    onValueChange={(next) => setSidebarTab(next === "presets" ? "presets" : "settings")}
                    className="flex min-h-0 flex-1 flex-col"
                >
                    <div className="shrink-0 px-6 pt-3 pb-1 bg-white dark:bg-[#141418]">
                        <TabsList className="flex w-full h-auto rounded-lg bg-slate-100 dark:bg-zinc-900 p-1 group-data-horizontal/tabs:h-auto border border-transparent dark:border-zinc-800 gap-1">
                            <TabsTrigger
                                value="settings"
                                className={cn(
                                    "flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium transition-all cursor-pointer h-auto border-0",
                                    sidebarTab === "settings"
                                        ? "bg-white dark:bg-[#1f1f26] text-[#FF5722] shadow-xs border border-slate-200/60 dark:border-zinc-700/60 font-semibold"
                                        : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100"
                                )}
                            >
                                <SlidersHorizontal className="h-4 w-4" />
                                Customize
                            </TabsTrigger>
                            <TabsTrigger
                                value="presets"
                                className={cn(
                                    "flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium transition-all cursor-pointer h-auto border-0",
                                    sidebarTab === "presets"
                                        ? "bg-white dark:bg-[#1f1f26] text-[#FF5722] shadow-xs border border-slate-200/60 dark:border-zinc-700/60 font-semibold"
                                        : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100"
                                )}
                            >
                                <Sparkles className="h-4 w-4" />
                                Themes
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent
                        value="settings"
                        className="min-h-0 flex-1 space-y-6 overflow-y-auto px-6 py-4"
                    >
                        <ThemeSettingsTab
                            draftTheme={draftTheme}
                            patchTheme={patchTheme}
                            patchFont={patchFont}
                            patchBackgroundImage={patchBackgroundImage}
                            setBackgroundImageUrl={setBackgroundImageUrl}
                        />
                    </TabsContent>

                    <TabsContent
                        value="presets"
                        className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-4"
                    >
                        <ThemePresetsTab
                            activePresetId={activePresetId}
                            onSelect={applyPreset}
                        />
                    </TabsContent>
                </Tabs>

                <DesignFooter
                    cancelPopoverOpen={cancelPopoverOpen}
                    onCancelOpenChange={handleCancelPopoverOpenChange}
                    onConfirmCancel={handleCancelClick}
                    savePopoverOpen={savePopoverOpen}
                    onSaveOpenChange={setSavePopoverOpen}
                    onConfirmSave={handleSaveClick}
                    isSaving={isSaving}
                    vibratingButton={vibratingButton}
                />
            </div>
        </div>
    )
}
