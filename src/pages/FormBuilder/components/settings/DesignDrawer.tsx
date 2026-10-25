import React from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    ColorSetting,
    ConfirmPopover,
    IconChoiceSetting,
    InputSetting,
    RangeSetting,
    SelectSetting,
    SettingsSection,
    ToggleRow,
    type IconChoiceOption,
    type SelectSettingOption,
} from "./primitives"
import { ThemePresetGrid } from "./ThemePresetGrid"
import { THEME_PRESETS, type ThemePreset } from "./theme-presets"
import type {
    ContentAlignment,
    CornerRadius,
    EndPage,
    FontSize,
    FormPage,
    IFormTheme,
    IThemeBackgroundImage,
    IThemeFont,
    ThemeFontSource,
} from "@/shared/types/common"
import { PageContentEditor } from "../PageContentEditor/PageContentEditor"
import { EndPageContentEditor } from "../EndPage/EndPageContentEditor"
import {
    Save,
    X,
    Trash2,
    AArrowDown,
    ALargeSmall,
    AArrowUp,
    AlignLeft,
    AlignCenter,
    AlignRight,
    SlidersHorizontal,
    Sparkles,
    Palette,
    Type,
    LayoutTemplate,
    Image as ImageIcon,
} from "lucide-react"
import { resolveFormTheme, loadThemeFont, getCornerRadiusCss, type ResolvedFormTheme } from "@/shared/utils/theme"
import { playNudgeFeedback } from "@/shared/utils/nudge-feedback"
import { showError, showSuccess } from "@/shared/hooks/useToast"
import { cn } from "@/lib/utils"

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

type ThemeColorKey =
    | "questionColor"
    | "answerColor"
    | "buttonColor"
    | "buttonTextColor"
    | "primaryColor"
    | "backgroundColor"
    | "textColor"

const COLOR_PAGES: readonly { key: ThemeColorKey; label: string; fallback: string }[] = [
    { key: "questionColor", label: "Question Color", fallback: "#111111" },
    { key: "answerColor", label: "Answer / Input Color", fallback: "#111111" },
    { key: "buttonColor", label: "Button Background", fallback: "#000000" },
    { key: "buttonTextColor", label: "Button Text Color", fallback: "#ffffff" },
    { key: "primaryColor", label: "Primary Color", fallback: "#000000" },
    { key: "backgroundColor", label: "Form Background Color", fallback: "#ffffff" },
    { key: "textColor", label: "Fallback Text Color", fallback: "#111111" },
]

const FONT_FAMILY_OPTIONS: readonly SelectSettingOption<string>[] = [
    { label: "Inter", value: "Inter" },
    { label: "Roboto", value: "Roboto" },
    { label: "Outfit", value: "Outfit" },
    { label: "Plus Jakarta Sans", value: "Plus Jakarta Sans" },
    { label: "Playfair Display", value: "Playfair Display" },
    { label: "Space Grotesk", value: "Space Grotesk" },
    { label: "Lora", value: "Lora" },
    { label: "System UI", value: "sans-serif" },
]

const FONT_SOURCE_OPTIONS: readonly SelectSettingOption<ThemeFontSource>[] = [
    { label: "Google Fonts", value: "google" },
    { label: "System Font", value: "system" },
    { label: "Custom URL", value: "custom" },
]

const FONT_SIZE_OPTIONS: readonly IconChoiceOption<FontSize>[] = [
    { label: "Small", value: "small", icon: AArrowDown },
    { label: "Medium", value: "medium", icon: ALargeSmall },
    { label: "Large", value: "large", icon: AArrowUp },
]

const ALIGNMENT_OPTIONS: readonly IconChoiceOption<ContentAlignment>[] = [
    { label: "Left", value: "left", icon: AlignLeft, title: "Left aligned" },
    { label: "Center", value: "center", icon: AlignCenter, title: "Centered" },
    { label: "Right", value: "right", icon: AlignRight, title: "Right aligned" },
]

/** Renders the actual radius so the tile previews what it selects. */
function CornerPreview({ radius, className }: { radius: CornerRadius; className?: string }) {
    return (
        <span
            aria-hidden
            className={cn("block border-2 border-current bg-current/10", className)}
            style={{ borderRadius: getCornerRadiusCss(radius) }}
        />
    )
}

const CORNER_RADIUS_OPTIONS: readonly IconChoiceOption<CornerRadius>[] = (
    [
        { value: "none", label: "Square", title: "Square (0px)" },
        { value: "small", label: "Small", title: "Small (6px)" },
        { value: "medium", label: "Medium", title: "Medium (12px)" },
        { value: "large", label: "Large", title: "Large (16px)" },
        { value: "full", label: "Pill", title: "Full (Pill/Rounded)" },
    ] as const
).map(({ value, label, title }) => ({
    value,
    label,
    title,
    icon: ({ className }: { className?: string }) => (
        <CornerPreview radius={value} className={cn("size-[18px]", className)} />
    ),
}))

/**
 * Portal-rendered overlays live outside the drawer subtree, so a click inside
 * one still reads as an "outside" click without this guard.
 */
const OVERLAY_SELECTORS = [
    "[data-slot='select-content']",
    "[data-slot='popover-content']",
    "[data-slot='dialog-content']",
    "[data-slot='drawer-content']",
    "[data-slot='sheet-content']",
    "[data-slot='tooltip-content']",
    "[role='listbox']",
    "[role='dialog']",
    "[role='tooltip']",
    "[data-radix-popper-content-wrapper]",
].join(",")

const noop = () => { }

type SidebarTab = "settings" | "presets"

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
    const [isSaving, setIsSaving] = React.useState(false)
    const [sidebarTab, setSidebarTab] = React.useState<SidebarTab>("settings")
    const [vibratingButton, setVibratingButton] = React.useState<"cancel" | "save" | null>(null)
    const [cancelPopoverOpen, setCancelPopoverOpen] = React.useState(false)
    const [savePopoverOpen, setSavePopoverOpen] = React.useState(false)
    const containerRef = React.useRef<HTMLDivElement>(null)
    const nudgeTimers = React.useRef<number[]>([])

    const baseTheme = React.useMemo(() => resolveFormTheme(theme), [theme])
    const baseSignature = React.useMemo(() => JSON.stringify(baseTheme), [baseTheme])

    /**
     * The draft is stamped with the editing session it belongs to, so reopening
     * the drawer or receiving a new theme discards stale edits without an
     * effect that copies props into state.
     */
    const sessionKey = `${open}:${baseSignature}`
    const [draft, setDraft] = React.useState<{ key: string; theme: ResolvedFormTheme } | null>(null)
    const draftTheme = draft?.key === sessionKey ? draft.theme : baseTheme

    const updateDraft = React.useCallback(
        (updater: (prev: ResolvedFormTheme) => ResolvedFormTheme) => {
            setDraft((prev) => ({
                key: sessionKey,
                theme: updater(prev?.key === sessionKey ? prev.theme : baseTheme),
            }))
        },
        [sessionKey, baseTheme]
    )

    // Load font in document head for live preview
    React.useEffect(() => {
        loadThemeFont(draftTheme.font)
    }, [draftTheme.font])

    // Publish unsaved-change state so the parent Sheet can block outside dismissal
    React.useEffect(() => {
        hasChangesRef.current = open && JSON.stringify(draftTheme) !== baseSignature
    }, [draftTheme, baseSignature, open, hasChangesRef])

    const clearNudgeTimers = React.useCallback(() => {
        nudgeTimers.current.forEach(window.clearTimeout)
        nudgeTimers.current = []
    }, [])

    React.useEffect(() => clearNudgeTimers, [clearNudgeTimers])

    /**
     * Draw the eye to Cancel, then Save when an outside click is ignored —
     * backed by a beep and haptic buzz timed to each stage, so the block
     * registers even if the footer sits outside the current viewport.
     */
    const nudgeFooterButtons = React.useCallback(() => {
        clearNudgeTimers()
        setVibratingButton("cancel")
        playNudgeFeedback()
        nudgeTimers.current.push(
            window.setTimeout(() => setVibratingButton(null), 300),
            window.setTimeout(() => setVibratingButton("save"), 300),
            window.setTimeout(() => setVibratingButton(null), 600)
        )
    }, [clearNudgeTimers])

    // Outside clicks close the drawer, unless there are unsaved changes to resolve.
    React.useEffect(() => {
        if (!open) return

        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target
            if (!containerRef.current || !(target instanceof Node)) return
            if (containerRef.current.contains(target)) return
            if (target instanceof Element && target.closest(OVERLAY_SELECTORS)) return

            if (hasChangesRef.current) {
                nudgeFooterButtons()
            } else {
                onCancel()
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [open, hasChangesRef, onCancel, nudgeFooterButtons])

    /**
     * Which preset the draft currently equals, or null when the theme has been
     * hand-tuned. Comparing resolved themes keeps the match stable regardless of
     * key order or omitted optional pages.
     */
    const activePresetId = React.useMemo(() => {
        const current = JSON.stringify(draftTheme)
        const match = THEME_PRESETS.find(
            (preset) => JSON.stringify(resolveFormTheme(preset.theme)) === current
        )
        return match?.id ?? null
    }, [draftTheme])

    const applyPreset = React.useCallback(
        (preset: ThemePreset) => {
            updateDraft(() => resolveFormTheme(preset.theme))
        },
        [updateDraft]
    )

    const patchTheme = React.useCallback(
        (patch: Partial<ResolvedFormTheme>) => {
            updateDraft((prev) => ({ ...prev, ...patch }))
        },
        [updateDraft]
    )

    const patchFont = React.useCallback(
        (patch: Partial<IThemeFont>) => {
            updateDraft((prev) => ({ ...prev, font: { ...prev.font, ...patch } }))
        },
        [updateDraft]
    )

    const patchBackgroundImage = React.useCallback(
        (patch: Partial<IThemeBackgroundImage>) => {
            updateDraft((prev) => ({
                ...prev,
                backgroundImage: prev.backgroundImage
                    ? { ...prev.backgroundImage, ...patch }
                    : null,
            }))
        },
        [updateDraft]
    )

    const setBackgroundImageUrl = React.useCallback(
        (url: string) => {
            updateDraft((prev) => ({
                ...prev,
                backgroundImage: url
                    ? {
                        brightness: 0,
                        tile: false,
                        ...prev.backgroundImage,
                        url,
                    }
                    : null,
            }))
        },
        [updateDraft]
    )

    const handleSaveClick = async () => {
        setIsSaving(true)
        try {
            await onSaveTheme(draftTheme)
            hasChangesRef.current = false
            setSavePopoverOpen(false)
            // Confirm the save first, then dismiss the drawer.
            showSuccess("Design saved", "Your theme changes have been applied.")
            onCancel()
        } catch (error) {
            console.error("Failed to save theme:", error)
            // Keep the drawer open so nothing is lost; say why the save failed.
            showError("Could not save design", error)
        } finally {
            setIsSaving(false)
        }
    }

    const handleCancelClick = () => {
        hasChangesRef.current = false
        setCancelPopoverOpen(false)
        onCancel()
    }

    /**
     * Only ask "discard?" when there is something to discard. The Cancel
     * trigger routes its open request through here, so with unsaved changes
     * the confirm popover opens, and without them Cancel closes the drawer
     * straight away. Close requests always pass through untouched.
     */
    const handleCancelPopoverOpenChange = React.useCallback(
        (nextOpen: boolean) => {
            if (nextOpen && !hasChangesRef.current) {
                onCancel()
                return
            }
            setCancelPopoverOpen(nextOpen)
        },
        [hasChangesRef, onCancel]
    )

    const backgroundImage = draftTheme.backgroundImage

    return (
        <div ref={containerRef} className="flex h-full min-h-0 w-full overflow-hidden">
            {/* Preview area */}
            <div className="relative h-full min-h-0 flex-1 overflow-y-auto bg-[#F4F6FB] dark:bg-[#0c0c0f] p-6 sm:p-10 flex flex-col items-center justify-center">
                {/* Ambient glow blobs */}
                <div className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-purple-200/25 dark:bg-purple-900/10 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-indigo-200/25 dark:bg-[#FF5722]/10 blur-3xl" />

                <div className="relative z-10 flex flex-col h-full max-h-[85vh] w-full max-w-4xl overflow-hidden rounded-3xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-[#141418] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.07)] dark:shadow-2xl">
                    {/* Mockup Window Header */}
                    <div className="flex h-11 shrink-0 items-center justify-between border-b border-slate-100 dark:border-zinc-800/80 bg-white/95 dark:bg-[#141418]/95 px-4 backdrop-blur-xs select-none">
                        <div className="flex items-center gap-2">
                            <span className="h-3 w-3 rounded-full bg-red-400/80" />
                            <span className="h-3 w-3 rounded-full bg-amber-400/80" />
                            <span className="h-3 w-3 rounded-full bg-emerald-400/80" />
                        </div>
                        <div className="flex items-center gap-1.5 rounded-full bg-slate-100/80 dark:bg-zinc-800/80 px-4 py-1 text-xs font-medium text-slate-500 dark:text-zinc-400">
                            <span>Live Theme Preview</span>
                        </div>
                        <div className="w-12" />
                    </div>

                    <div className="relative flex-1 min-h-0 overflow-y-auto p-4 sm:p-8">
                        {endPage ? (
                            <EndPageContentEditor
                                endPage={endPage}
                                endPageIndex={endPageIndex}
                                onUpdate={onUpdateEndPage ?? noop}
                                isMobileView={false}
                                theme={draftTheme}
                            />
                        ) : page ? (
                            <PageContentEditor
                                page={page}
                                pageIndex={pageIndex}
                                onUpdate={onUpdatePage ?? noop}
                                isMobileView={false}
                                theme={draftTheme}
                            />
                        ) : (
                            <div className="flex h-64 items-center justify-center text-sm text-slate-400 dark:text-zinc-500">
                                Select a page to see live preview
                            </div>
                        )}
                    </div>
                </div>
            </div>

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
                        <TabsList className="flex w-full h-auto rounded-xl bg-slate-100 dark:bg-zinc-900 p-1 group-data-horizontal/tabs:h-auto border border-transparent dark:border-zinc-800 gap-1">
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
                        <SettingsSection
                            title="Colors"
                            icon={<Palette className="h-4 w-4 text-slate-500" />}
                        >
                            <div className="grid grid-cols-1 gap-3.5">
                                {COLOR_PAGES.map(({ key, label, fallback }) => (
                                    <ColorSetting
                                        key={key}
                                        label={label}
                                        fallback={fallback}
                                        value={draftTheme[key]}
                                        onChange={(value) => patchTheme({ [key]: value })}
                                    />
                                ))}
                            </div>
                        </SettingsSection>

                        <SettingsSection
                            title="Typography"
                            icon={<Type className="h-4 w-4 text-slate-500" />}
                        >
                            <div className="space-y-4">
                                <SelectSetting
                                    label="Font Family"
                                    value={draftTheme.font.family}
                                    options={FONT_FAMILY_OPTIONS}
                                    onChange={(family) => patchFont({ family })}
                                />

                                <SelectSetting
                                    label="Font Source"
                                    value={draftTheme.font.source}
                                    options={FONT_SOURCE_OPTIONS}
                                    onChange={(source) => patchFont({ source })}
                                />

                                {draftTheme.font.source === "custom" && (
                                    <InputSetting
                                        label="Font File URL"
                                        value={draftTheme.font.url ?? ""}
                                        onChange={(url) => patchFont({ url })}
                                        placeholder="https://example.com/font.woff2"
                                    />
                                )}

                                <IconChoiceSetting
                                    label="Font Size Preset"
                                    value={draftTheme.fontSize}
                                    options={FONT_SIZE_OPTIONS}
                                    onChange={(fontSize) => patchTheme({ fontSize })}
                                />
                            </div>
                        </SettingsSection>

                        <SettingsSection
                            title="Layout & Corners"
                            icon={<LayoutTemplate className="h-4 w-4 text-slate-500" />}
                        >
                            <div className="space-y-4">
                                <IconChoiceSetting
                                    label="Content Alignment"
                                    value={draftTheme.alignment}
                                    options={ALIGNMENT_OPTIONS}
                                    onChange={(alignment) => patchTheme({ alignment })}
                                />

                                <IconChoiceSetting
                                    label="Corner Radius Preset"
                                    hint="Applies to inputs, buttons and cards."
                                    value={draftTheme.roundCorners}
                                    options={CORNER_RADIUS_OPTIONS}
                                    onChange={(roundCorners) => patchTheme({ roundCorners })}
                                />
                            </div>
                        </SettingsSection>

                        <SettingsSection
                            title="Background Image"
                            icon={<ImageIcon className="h-4 w-4 text-slate-500" />}
                        >
                            <div className="space-y-4">
                                <InputSetting
                                    label="Image URL"
                                    value={backgroundImage?.url ?? ""}
                                    onChange={setBackgroundImageUrl}
                                    placeholder="https://images.unsplash.com/..."
                                    trailing={
                                        backgroundImage?.url ? (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                aria-label="Remove background image"
                                                onClick={() => patchTheme({ backgroundImage: null })}
                                                className="h-[42px] w-[42px] shrink-0 rounded-xl text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        ) : null
                                    }
                                />

                                {backgroundImage?.url && (
                                    <>
                                        <RangeSetting
                                            label="Brightness Offset"
                                            min={-100}
                                            max={100}
                                            value={backgroundImage.brightness ?? 0}
                                            onChange={(brightness) => patchBackgroundImage({ brightness })}
                                        />

                                        <ToggleRow
                                            id="background-tile"
                                            label="Tile Image"
                                            checked={backgroundImage.tile ?? false}
                                            onCheckedChange={(tile) => patchBackgroundImage({ tile })}
                                        />

                                        <InputSetting
                                            label="Alt Text"
                                            value={backgroundImage.alt ?? ""}
                                            onChange={(alt) => patchBackgroundImage({ alt })}
                                            placeholder="Background description"
                                        />
                                    </>
                                )}
                            </div>
                        </SettingsSection>
                    </TabsContent>

                    <TabsContent
                        value="presets"
                        className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-4"
                    >
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-slate-700 dark:text-zinc-200">
                                Pick a starting point
                            </p>
                            <p className="text-xs text-slate-500 dark:text-zinc-400">
                                Applying a theme updates the live preview only — nothing is saved until you click Save Design.
                            </p>
                            {activePresetId === null && (
                                <p className="text-xs text-[#FF5722] font-medium">
                                    • Custom theme active
                                </p>
                            )}
                        </div>

                        <ThemePresetGrid
                            presets={THEME_PRESETS}
                            selectedId={activePresetId}
                            onSelect={applyPreset}
                        />
                    </TabsContent>
                </Tabs>

                {/* Footer action buttons */}
                <div className="flex shrink-0 items-center justify-between gap-3 border-t border-slate-100 dark:border-zinc-800 bg-white dark:bg-[#141418] p-4">
                    <ConfirmPopover
                        open={cancelPopoverOpen}
                        onOpenChange={handleCancelPopoverOpenChange}
                        align="start"
                        title="Discard theme changes?"
                        description="You have unsaved theme changes. If you cancel, all changes will be lost."
                        onConfirm={handleCancelClick}
                        destructive
                        trigger={
                            <Button
                                variant="outline"
                                className={cn(
                                    "flex-1 h-10 rounded-xl border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm font-medium text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-white shadow-xs cursor-pointer",
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
                        onOpenChange={setSavePopoverOpen}
                        align="end"
                        title="Save theme changes?"
                        description="This will apply the theme changes to the entire form and update the server."
                        onConfirm={handleSaveClick}
                        confirmDisabled={isSaving}
                        trigger={
                            <Button
                                disabled={isSaving}
                                className={cn(
                                    "flex-1 h-10 rounded-xl bg-[#FF5722] hover:bg-[#F4511E] text-sm font-medium text-white shadow-xs cursor-pointer transition-colors",
                                    vibratingButton === "save" && "editorial-vibrate"
                                )}
                            >
                                <Save className="h-4 w-4 mr-1.5" />
                                {isSaving ? "Saving..." : "Save Design"}
                            </Button>
                        }
                    />
                </div>
            </div>
        </div>
    )
}
