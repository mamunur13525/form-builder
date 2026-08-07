import React from "react"
import { Label } from "../../../../components/ui/label"
import { Input } from "../../../../components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../../../../components/ui/select"
import { Button } from "../../../../components/ui/button"
import { SettingsSection } from "./primitives"
import type { FormField, IFormTheme, ContentAlignment, FontSize, CornerRadius, ThemeFontSource } from "../../../../shared/types/common"
import { PageContentEditor } from "../PageContentEditor/PageContentEditor"
import { Save, X, Trash2 } from "lucide-react"
import {
    Popover,
    PopoverContent,
    PopoverDescription,
    PopoverHeader,
    PopoverTitle,
    PopoverTrigger,
} from "../../../../components/ui/popover"
import { resolveFormTheme, loadThemeFont } from "@/shared/utils/theme"

interface DesignDrawerProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    theme?: IFormTheme | null
    page?: FormField
    pageIndex?: number
    onUpdatePage?: (index: number, updates: Partial<FormField>) => void
    onSaveTheme: (theme: IFormTheme) => Promise<void>
    onCancel: () => void
    hasChangesRef: React.MutableRefObject<boolean>
}

const FONT_PRESETS = [
    { label: "Inter", value: "Inter" },
    { label: "Roboto", value: "Roboto" },
    { label: "Outfit", value: "Outfit" },
    { label: "Plus Jakarta Sans", value: "Plus Jakarta Sans" },
    { label: "Playfair Display", value: "Playfair Display" },
    { label: "Space Grotesk", value: "Space Grotesk" },
    { label: "Lora", value: "Lora" },
    { label: "System UI", value: "sans-serif" },
]

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
    const [draftTheme, setDraftTheme] = React.useState<IFormTheme>(() => resolveFormTheme(theme))
    const [isSaving, setIsSaving] = React.useState(false)
    const [vibratingButton, setVibratingButton] = React.useState<string | null>(null)
    const [cancelPopoverOpen, setCancelPopoverOpen] = React.useState(false)
    const [savePopoverOpen, setSavePopoverOpen] = React.useState(false)
    const containerRef = React.useRef<HTMLDivElement>(null)

    // Sync draft theme when prop theme changes or drawer reopens
    React.useEffect(() => {
        if (open) {
            setDraftTheme(resolveFormTheme(theme))
        }
    }, [theme, open])

    // Load font in document head for live preview
    React.useEffect(() => {
        if (draftTheme.font) {
            loadThemeFont(draftTheme.font)
        }
    }, [draftTheme.font])

    // Reset hasChanges when the drawer opens
    React.useEffect(() => {
        if (open) {
            hasChangesRef.current = false
        }
    }, [open, hasChangesRef])

    // Track whether the draft has unsaved changes
    React.useEffect(() => {
        const initial = JSON.stringify(resolveFormTheme(theme))
        const current = JSON.stringify(resolveFormTheme(draftTheme))
        hasChangesRef.current = initial !== current
    }, [draftTheme, theme, hasChangesRef])

    // Handle outside clicks: vibrate buttons if there are changes, otherwise close.
    // Clicks inside portal-rendered overlays (Select dropdown, Popover content,
    // Dialog, Drawer, Sheet, Tooltip) must not close the drawer.
    React.useEffect(() => {
        if (!open) return

        const isOverlayClick = (target: EventTarget | null) => {
            if (!(target instanceof Element)) return false
            const overlaySelectors = [
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
            ]
            return overlaySelectors.some((selector) => target.closest(selector))
        }

        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node) && !isOverlayClick(e.target)) {
                if (hasChangesRef.current) {
                    setVibratingButton("cancel")
                    setTimeout(() => setVibratingButton(null), 300)
                    setTimeout(() => {
                        setVibratingButton("save")
                        setTimeout(() => setVibratingButton(null), 300)
                    }, 300)
                } else {
                    onCancel()
                }
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [open, hasChangesRef, onCancel])

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
        onCancel()
        setCancelPopoverOpen(false)
    }

    const updateColor = (key: keyof IFormTheme, value: string) => {
        setDraftTheme((prev) => ({ ...prev, [key]: value }))
    }

    const renderColorPicker = (label: string, key: keyof IFormTheme, fallback: string) => {
        const currentValue = (draftTheme[key] as string) || fallback
        return (
            <div className="space-y-1.5" key={key}>
                <Label className="text-sm font-medium text-[var(--editorial-body)]">{label}</Label>
                <div className="flex items-center gap-3">
                    <input
                        type="color"
                        aria-label={label}
                        value={currentValue}
                        onChange={(e) => updateColor(key, e.target.value)}
                        className="h-[44px] w-[44px] cursor-pointer rounded-lg border border-[var(--input)] bg-[var(--secondary)] p-1 shrink-0"
                    />
                    <Input
                        type="text"
                        value={currentValue}
                        onChange={(e) => updateColor(key, e.target.value)}
                        placeholder={fallback}
                        className="h-[44px] rounded-xl border-[var(--input)] bg-[var(--secondary)] px-4 text-sm"
                    />
                </div>
            </div>
        )
    }

    return (
        <div ref={containerRef} className="flex w-full h-full min-h-0 overflow-hidden">
            <style>{`
                @keyframes vibrate {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-3px); }
                    75% { transform: translateX(3px); }
                }
            `}</style>

            {/* Preview area */}
            <div className="flex-1 h-full min-h-0 overflow-y-auto bg-[var(--editorial-canvas)] p-6">
                <div className="w-full min-h-full flex flex-col justify-center">
                    <div className="w-full h-full max-h-full editorial-shadow overflow-hidden rounded-[24px] border border-[var(--border)] bg-[var(--card)]">
                        {page ? (
                            <PageContentEditor
                                page={page}
                                pageIndex={pageIndex}
                                onUpdate={onUpdatePage || (() => { })}
                                isMobileView={false}
                                theme={draftTheme}
                            />
                        ) : (
                            <div className="flex items-center justify-center h-64 text-muted-foreground">
                                Select a page to see live preview
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Controls sidebar */}
            <div className="w-[380px] shrink-0 h-full flex flex-col border-l border-[var(--border)] bg-[var(--card)]">
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    <h3 className="text-lg font-semibold text-[var(--foreground)] border-b pb-3">
                        Theme Settings
                    </h3>

                    {/* Colors section */}
                    <SettingsSection title="Colors">
                        <div className="grid grid-cols-1 gap-4">
                            {renderColorPicker("Question Color", "questionColor", "#111111")}
                            {renderColorPicker("Answer / Input Color", "answerColor", "#111111")}
                            {renderColorPicker("Button Background", "buttonColor", "#000000")}
                            {renderColorPicker("Button Text Color", "buttonTextColor", "#ffffff")}
                            {renderColorPicker("Primary Color", "primaryColor", "#000000")}
                            {renderColorPicker("Form Background Color", "backgroundColor", "#ffffff")}
                            {renderColorPicker("Fallback Text Color", "textColor", "#111111")}
                        </div>
                    </SettingsSection>

                    {/* Typography section */}
                    <SettingsSection title="Typography">
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <Label className="text-sm font-medium text-[var(--editorial-body)]">Font Family</Label>
                                <Select
                                    value={draftTheme.font?.family || "Inter"}
                                    onValueChange={(v) => {
                                        if (!v) return
                                        setDraftTheme((prev) => ({
                                            ...prev,
                                            font: {
                                                family: v,
                                                source: prev.font?.source || "google",
                                                url: prev.font?.url,
                                            },
                                        }))
                                    }}
                                >
                                    <SelectTrigger className="h-[44px] w-full rounded-xl border-[var(--input)] bg-[var(--secondary)] text-sm">
                                        <SelectValue placeholder="Select Font Family" />
                                    </SelectTrigger>
                                    <SelectContent className="editorial rounded-xl border-[var(--border)] bg-[var(--popover)]">
                                        {FONT_PRESETS.map((f) => (
                                            <SelectItem key={f.value} value={f.value} className="rounded-lg">
                                                {f.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-sm font-medium text-[var(--editorial-body)]">Font Source</Label>
                                <Select
                                    value={draftTheme.font?.source || "google"}
                                    onValueChange={(v: ThemeFontSource | null) => {
                                        if (!v) return
                                        setDraftTheme((prev) => ({
                                            ...prev,
                                            font: {
                                                family: prev.font?.family || "Inter",
                                                source: v,
                                                url: prev.font?.url,
                                            },
                                        }))
                                    }}
                                >
                                    <SelectTrigger className="h-[44px] w-full rounded-xl border-[var(--input)] bg-[var(--secondary)] text-sm">
                                        <SelectValue placeholder="Select Source" />
                                    </SelectTrigger>
                                    <SelectContent onClick={(e) => e.stopPropagation()} className="editorial rounded-xl border-[var(--border)] bg-[var(--popover)]">
                                        <SelectItem value="google" className="rounded-lg">Google Fonts</SelectItem>
                                        <SelectItem value="system" className="rounded-lg">System Font</SelectItem>
                                        <SelectItem value="custom" className="rounded-lg">Custom URL</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {draftTheme.font?.source === "custom" && (
                                <div className="space-y-1.5">
                                    <Label className="text-sm font-medium text-[var(--editorial-body)]">Font File URL</Label>
                                    <Input
                                        type="text"
                                        value={draftTheme.font?.url || ""}
                                        onChange={(e) => {
                                            const val = e.target.value
                                            setDraftTheme((prev) => ({
                                                ...prev,
                                                font: {
                                                    family: prev.font?.family || "CustomFont",
                                                    source: "custom",
                                                    url: val,
                                                },
                                            }))
                                        }}
                                        placeholder="https://example.com/font.woff2"
                                        className="h-[44px] rounded-xl border-[var(--input)] bg-[var(--secondary)] px-4 text-sm"
                                    />
                                </div>
                            )}

                            <div className="space-y-1.5">
                                <Label className="text-sm font-medium text-[var(--editorial-body)]">Font Size Preset</Label>
                                <Select
                                    value={draftTheme.fontSize || "medium"}
                                    onValueChange={(v: FontSize | null) => {
                                        if (!v) return
                                        setDraftTheme((prev) => ({ ...prev, fontSize: v }))
                                    }}
                                >
                                    <SelectTrigger className="h-[44px] w-full rounded-xl border-[var(--input)] bg-[var(--secondary)] text-sm">
                                        <SelectValue placeholder="Select Font Size" />
                                    </SelectTrigger>
                                    <SelectContent onClick={(e) => e.stopPropagation()} className="editorial rounded-xl border-[var(--border)] bg-[var(--popover)]">
                                        <SelectItem value="small" className="rounded-lg">Small</SelectItem>
                                        <SelectItem value="medium" className="rounded-lg">Medium</SelectItem>
                                        <SelectItem value="large" className="rounded-lg">Large</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </SettingsSection>

                    {/* Layout & Style section */}
                    <SettingsSection title="Layout & Corners">
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <Label className="text-sm font-medium text-[var(--editorial-body)]">Content Alignment</Label>
                                <Select
                                    value={draftTheme.alignment || "left"}
                                    onValueChange={(v: ContentAlignment | null) => {
                                        if (!v) return
                                        setDraftTheme((prev) => ({ ...prev, alignment: v }))
                                    }}
                                >
                                    <SelectTrigger className="h-[44px] w-full rounded-xl border-[var(--input)] bg-[var(--secondary)] text-sm">
                                        <SelectValue placeholder="Select Alignment" />
                                    </SelectTrigger>
                                    <SelectContent onClick={(e) => e.stopPropagation()} className="editorial rounded-xl border-[var(--border)] bg-[var(--popover)]">
                                        <SelectItem value="left" className="rounded-lg">Left Aligned</SelectItem>
                                        <SelectItem value="center" className="rounded-lg">Centered</SelectItem>
                                        <SelectItem value="right" className="rounded-lg">Right Aligned</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-sm font-medium text-[var(--editorial-body)]">Corner Radius Preset</Label>
                                <Select
                                    value={draftTheme.roundCorners || "medium"}
                                    onValueChange={(v: CornerRadius | null) => {
                                        if (!v) return
                                        setDraftTheme((prev) => ({ ...prev, roundCorners: v }))
                                    }}
                                >
                                    <SelectTrigger className="h-[44px] w-full rounded-xl border-[var(--input)] bg-[var(--secondary)] text-sm">
                                        <SelectValue placeholder="Select Corner Radius" />
                                    </SelectTrigger>
                                    <SelectContent onClick={(e) => e.stopPropagation()} className="editorial rounded-xl border-[var(--border)] bg-[var(--popover)]">
                                        <SelectItem value="none" className="rounded-lg">Square (0px)</SelectItem>
                                        <SelectItem value="small" className="rounded-lg">Small (6px)</SelectItem>
                                        <SelectItem value="medium" className="rounded-lg">Medium (12px)</SelectItem>
                                        <SelectItem value="large" className="rounded-lg">Large (16px)</SelectItem>
                                        <SelectItem value="full" className="rounded-lg">Full (Pill/Rounded)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </SettingsSection>

                    {/* Background Image section */}
                    <SettingsSection title="Background Image">
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <Label className="text-sm font-medium text-[var(--editorial-body)]">Image URL</Label>
                                <div className="flex items-center gap-2">
                                    <Input
                                        type="text"
                                        value={draftTheme.backgroundImage?.url || ""}
                                        onChange={(e) => {
                                            const url = e.target.value
                                            setDraftTheme((prev) => ({
                                                ...prev,
                                                backgroundImage: url
                                                    ? {
                                                        url,
                                                        brightness: prev.backgroundImage?.brightness ?? 0,
                                                        tile: prev.backgroundImage?.tile ?? false,
                                                        alt: prev.backgroundImage?.alt,
                                                        fileId: prev.backgroundImage?.fileId,
                                                    }
                                                    : null,
                                            }))
                                        }}
                                        placeholder="https://images.unsplash.com/..."
                                        className="h-[44px] rounded-xl border-[var(--input)] bg-[var(--secondary)] px-4 text-sm flex-1"
                                    />
                                    {draftTheme.backgroundImage?.url && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => setDraftTheme((prev) => ({ ...prev, backgroundImage: null }))}
                                            className="h-[44px] w-[44px] text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            </div>

                            {draftTheme.backgroundImage?.url && (
                                <>
                                    <div className="space-y-1.5">
                                        <div className="flex justify-between items-center text-sm font-medium text-[var(--editorial-body)]">
                                            <span>Brightness Offset</span>
                                            <span>{draftTheme.backgroundImage?.brightness ?? 0}</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="-100"
                                            max="100"
                                            value={draftTheme.backgroundImage?.brightness ?? 0}
                                            onChange={(e) => {
                                                const val = parseInt(e.target.value, 10)
                                                setDraftTheme((prev) => ({
                                                    ...prev,
                                                    backgroundImage: prev.backgroundImage
                                                        ? { ...prev.backgroundImage, brightness: val }
                                                        : null,
                                                }))
                                            }}
                                            className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <Label className="text-sm font-medium text-[var(--editorial-body)]">Tile Image</Label>
                                        <input
                                            type="checkbox"
                                            checked={draftTheme.backgroundImage?.tile ?? false}
                                            onChange={(e) => {
                                                const checked = e.target.checked
                                                setDraftTheme((prev) => ({
                                                    ...prev,
                                                    backgroundImage: prev.backgroundImage
                                                        ? { ...prev.backgroundImage, tile: checked }
                                                        : null,
                                                }))
                                            }}
                                            className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label className="text-sm font-medium text-[var(--editorial-body)]">Alt Text</Label>
                                        <Input
                                            type="text"
                                            value={draftTheme.backgroundImage?.alt || ""}
                                            onChange={(e) => {
                                                const alt = e.target.value
                                                setDraftTheme((prev) => ({
                                                    ...prev,
                                                    backgroundImage: prev.backgroundImage
                                                        ? { ...prev.backgroundImage, alt }
                                                        : null,
                                                }))
                                            }}
                                            placeholder="Background description"
                                            className="h-[44px] rounded-xl border-[var(--input)] bg-[var(--secondary)] px-4 text-sm"
                                        />
                                    </div>
                                </>
                            )}
                        </div>
                    </SettingsSection>
                </div>

                {/* Footer action buttons */}
                <div className="shrink-0 p-4 border-t border-[var(--border)] flex items-center justify-between gap-3 bg-[var(--card)]">
                    <Popover open={cancelPopoverOpen} onOpenChange={setCancelPopoverOpen}>
                        <PopoverTrigger
                            render={
                                <Button
                                    variant="outline"
                                    onClick={() => setCancelPopoverOpen(true)}
                                    style={{
                                        animation: vibratingButton === "cancel" ? "vibrate 0.3s ease-in-out" : "none",
                                    }}
                                    className="h-11 gap-2 rounded-[16px]"
                                >
                                    <X className="h-4 w-4" />
                                    Cancel
                                </Button>
                            }
                        />
                        <PopoverContent className="w-80" align="start" side="top" sideOffset={16}>
                            <PopoverHeader>
                                <PopoverTitle>Discard theme changes?</PopoverTitle>
                                <PopoverDescription>
                                    You have unsaved theme changes. If you cancel, all changes will be lost.
                                </PopoverDescription>
                            </PopoverHeader>
                            <div className="flex justify-end gap-2 mt-4">
                                <Button
                                    variant="outline"
                                    size="lg"
                                    className="rounded-xl"
                                    onClick={() => setCancelPopoverOpen(false)}
                                >
                                    No
                                </Button>
                                <Button
                                    size="lg"
                                    onClick={handleCancelClick}
                                    className="rounded-xl bg-red-500 hover:bg-red-600 text-white"
                                >
                                    Yes
                                </Button>
                            </div>
                        </PopoverContent>
                    </Popover>

                    <Popover open={savePopoverOpen} onOpenChange={setSavePopoverOpen}>
                        <PopoverTrigger
                            render={
                                <Button
                                    onClick={() => setSavePopoverOpen(true)}
                                    disabled={isSaving}
                                    style={{
                                        animation: vibratingButton === "save" ? "vibrate 0.3s ease-in-out" : "none",
                                    }}
                                    className="editorial-transition h-11 gap-2 rounded-[16px] bg-[var(--primary)] px-6 text-sm font-medium text-white shadow-[0_8px_24px_rgba(238,125,105,.25)] hover:-translate-y-0.5 hover:bg-[var(--editorial-primary-hover)] active:translate-y-0 active:scale-[.98] active:bg-[var(--editorial-primary-pressed)] disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Save className="h-4 w-4" />
                                    {isSaving ? "Saving..." : "Save Design"}
                                </Button>
                            }
                        />
                        <PopoverContent className="w-80" align="end" side="top" sideOffset={16}>
                            <PopoverHeader>
                                <PopoverTitle>Save theme changes?</PopoverTitle>
                                <PopoverDescription>
                                    This will apply the theme changes to the entire form and update the server.
                                </PopoverDescription>
                            </PopoverHeader>
                            <div className="flex justify-end gap-2 mt-4">
                                <Button
                                    variant="outline"
                                    size="lg"
                                    className="rounded-xl"
                                    onClick={() => setSavePopoverOpen(false)}
                                >
                                    No
                                </Button>
                                <Button
                                    size="lg"
                                    className="rounded-xl"
                                    onClick={handleSaveClick}
                                    disabled={isSaving}
                                >
                                    Yes
                                </Button>
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>
            </div>
        </div>
    )
}

