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
    TAB_LIST_CLASS,
    TAB_TRIGGER_CLASS,
    ToggleRow,
    type IconChoiceOption,
    type SelectSettingOption,
} from "./primitives"
import { ThemePresetGrid } from "./ThemePresetGrid"
import { THEME_PRESETS, type ThemePreset } from "./theme-presets"
import type {
    ContentAlignment,
    CornerRadius,
    FontSize,
    FormPage,
    IFormTheme,
    IThemeBackgroundImage,
    IThemeFont,
    ThemeFontSource,
} from "@/shared/types/common"
import { PageContentEditor } from "../PageContentEditor/PageContentEditor"
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
} from "lucide-react"
import { resolveFormTheme, loadThemeFont, getCornerRadiusCss, type ResolvedFormTheme } from "@/shared/utils/theme"
import { cn } from "@/lib/utils"

interface DesignDrawerProps {
    open: boolean
    theme?: IFormTheme | null
    page?: FormPage
    pageIndex?: number
    onUpdatePage?: (index: number, updates: Partial<FormPage>) => void
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

    /** Draw the eye to Cancel, then Save, when an outside click is ignored. */
    const nudgeFooterButtons = React.useCallback(() => {
        clearNudgeTimers()
        setVibratingButton("cancel")
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
        } catch (error) {
            console.error("Failed to save theme:", error)
        } finally {
            setIsSaving(false)
        }
    }

    const handleCancelClick = () => {
        hasChangesRef.current = false
        setCancelPopoverOpen(false)
        onCancel()
    }

    const backgroundImage = draftTheme.backgroundImage

    return (
        <div ref={containerRef} className="flex h-full min-h-0 w-full overflow-hidden">
            {/* Preview area */}
            <div className="h-full min-h-0 flex-1 overflow-y-auto bg-[var(--editorial-canvas)] p-6 grid place-items-center">
                <div className="h-8/12 flex w-full flex-col justify-center ">
                    <div className="editorial-shadow h-full max-h-full w-full overflow-hidden rounded-xl bg-[var(--card)] border border-gray-400/80 pointer-events-none">
                        {page ? (
                            <PageContentEditor
                                page={page}
                                pageIndex={pageIndex}
                                onUpdate={onUpdatePage ?? noop}
                                isMobileView={false}
                                theme={draftTheme}
                            />
                        ) : (
                            <div className="flex h-64 items-center justify-center text-sm text-[var(--editorial-subtle)]">
                                Select a page to see live preview
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Controls sidebar */}
            <div className="flex h-full w-[470px] shrink-0 flex-col border-l border-[var(--border)] bg-[var(--background)]">
                <div className="shrink-0 border-b border-[var(--editorial-border-light)] px-6 pt-6 pb-4">
                    <p className="editorial-eyebrow text-[var(--editorial-subtle)]">Design</p>
                    <h3 className="font-display mt-1 text-2xl text-[var(--foreground)]">
                        Theme settings
                    </h3>
                </div>

                <Tabs
                    value={sidebarTab}
                    onValueChange={(next) => setSidebarTab(next === "presets" ? "presets" : "settings")}
                    className="flex min-h-0 flex-1 flex-col"
                >
                    <div className="shrink-0 px-6 pt-4">
                        <TabsList className={TAB_LIST_CLASS}>
                            <TabsTrigger value="settings" className={TAB_TRIGGER_CLASS}>
                                <SlidersHorizontal className="h-4 w-4" />
                                Current
                            </TabsTrigger>
                            <TabsTrigger value="presets" className={TAB_TRIGGER_CLASS}>
                                <Sparkles className="h-4 w-4" />
                                Themes
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent
                        value="settings"
                        className="min-h-0 flex-1 space-y-8 overflow-y-auto px-6 py-6"
                    >
                        <SettingsSection title="Colors">
                            <div className="grid grid-cols-1 gap-4">
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

                        <SettingsSection title="Typography">
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

                        <SettingsSection title="Layout & Corners">
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

                        <SettingsSection title="Background Image">
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
                                                className="editorial-transition h-[44px] w-[44px] shrink-0 rounded-[14px] text-[var(--destructive)] hover:bg-[var(--destructive)]/10 hover:text-[var(--destructive)]"
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
                        className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-6"
                    >
                        <div className="space-y-1.5">
                            <p className="text-sm text-[var(--editorial-body)]">
                                Pick a starting point. Applying a theme updates the live preview
                                only — nothing is saved until you press Save design.
                            </p>
                            {activePresetId === null && (
                                <p className="text-xs text-[var(--editorial-subtle)]">
                                    Your current theme is customised, so no preset is highlighted.
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
                <div className="flex shrink-0 items-center justify-between gap-3 border-t border-[var(--editorial-border-light)] bg-[var(--card)] p-4">
                    <ConfirmPopover
                        open={cancelPopoverOpen}
                        onOpenChange={setCancelPopoverOpen}
                        align="start"
                        title="Discard theme changes?"
                        description="You have unsaved theme changes. If you cancel, all changes will be lost."
                        onConfirm={handleCancelClick}
                        destructive
                        trigger={
                            <Button
                                variant="outline"
                                className={cn(
                                    ' border-[var(--border)] bg-[var(--card)]',
                                    "flex-1",
                                    vibratingButton === "cancel" && "editorial-vibrate"
                                )}
                            >
                                <X className="h-4 w-4" />
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
                                    "flex-1",
                                    vibratingButton === "save" && "editorial-vibrate"
                                )}
                            >
                                <Save className="h-4 w-4" />
                                {isSaving ? "Saving..." : "Save Design"}
                            </Button>
                        }
                    />
                </div>
            </div>
        </div>
    )
}
