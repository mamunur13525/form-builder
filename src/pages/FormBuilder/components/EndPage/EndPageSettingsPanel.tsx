import { memo, useState } from "react"
import {
    AlignLeft,
    AlignCenter,
    AlignRight,
    PartyPopper,
    ImagePlus,
    Trash2,
    Palette,
    Layers,
    Settings as SettingsIcon,
    SlidersHorizontal,
} from "lucide-react"
import type {
    EndPage,
    EndPageButton,
    EndPageRedirect,
    EndPageEmbed,
    EndPageSocialShareMedia,
    ContentAlignment,
} from "@/shared/types/common"
import {
    SettingsSection,
    InputSetting,
    IconChoiceSetting,
    RangeSetting,
    ImageZoomSetting,
    ToggleRow,
} from "../settings/primitives"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { getCoverImageStyle } from "@/shared/utils/theme"
import { ImagePickerDialog } from "../settings/ImagePickerDialog"
import { ImageEditorDialog } from "../settings/ImageEditorDialog"
import { CoverImageLayoutSetting } from "../settings/cover-image-layout"
import { FocalPointSetting } from "../settings/FocalPointSetting"

interface EndPageSettingsPanelProps {
    endPage: EndPage
    endPageIndex: number
    onUpdate: (index: number, updates: Partial<EndPage>) => void
    onOpenDesignDrawer: () => void
    onChangeViewMode?: (isMobile: boolean) => void
}

const ALIGN_OPTIONS = [
    { value: "left" as const, label: "Left", icon: AlignLeft },
    { value: "center" as const, label: "Center", icon: AlignCenter },
    { value: "right" as const, label: "Right", icon: AlignRight },
]

const SHARE_PLATFORMS: { key: keyof EndPageSocialShareMedia; label: string }[] = [
    { key: "facebook", label: "Facebook" },
    { key: "twitter", label: "X (Twitter)" },
    { key: "linkedin", label: "LinkedIn" },
    { key: "whatsapp", label: "WhatsApp" },
]

/**
 * Right-hand settings column for a single end page. Title and message are edited
 * inline on the canvas, so this panel focuses on behaviour and presentation.
 * Every control writes through `onUpdate`, so edits flow to the same optimistic
 * + debounced persist path the page settings use.
 */
function EndPageSettingsPanelComponent({
    endPage,
    endPageIndex,
    onUpdate,
    onOpenDesignDrawer,
    onChangeViewMode,
}: EndPageSettingsPanelProps) {
    const [coverDialogOpen, setCoverDialogOpen] = useState(false)
    const [coverEditorOpen, setCoverEditorOpen] = useState(false)

    const patch = (updates: Partial<EndPage>) => onUpdate(endPageIndex, updates)
    const patchButton = (b: Partial<EndPageButton>) =>
        patch({ button: { ...endPage.button, ...b } })
    const patchRedirect = (r: Partial<EndPageRedirect>) =>
        patch({ redirect: { ...endPage.redirect, ...r } })
    const patchMedia = (m: Partial<EndPageSocialShareMedia>) =>
        patch({ socialShareMedia: { ...endPage.socialShareMedia, ...m } })
    const patchEmbed = (e: Partial<EndPageEmbed>) =>
        patch({ embed: { ...(endPage.embed ?? { url: "" }), ...e } })

    return (
        <div className="flex h-full w-full flex-col overflow-hidden bg-white dark:bg-[#141418] border-l border-slate-200/90 dark:border-zinc-800/90 text-slate-800 dark:text-zinc-100">
            {/* Header: Page settings */}
            <div className="flex items-center gap-2 px-6 pt-5 pb-2">
                <Layers className="h-5 w-5 text-slate-900 dark:text-white" />
                <h3 className="text-base font-semibold text-slate-900 dark:text-white tracking-tight">Page settings</h3>
            </div>

            <div className="flex flex-1 min-h-0 flex-col">
                <Tabs defaultValue="settings" className="flex flex-1 min-h-0 flex-col">
                    {/* Pill tabs: Settings (active) | Design */}
                    <div className="px-6 py-2">
                        <div className="flex h-10 rounded-lg bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-1">
                            <div className="flex h-8 flex-1 items-center justify-center gap-2 rounded-lg bg-white dark:bg-[#1e1e24] text-sm font-medium text-slate-900 dark:text-white shadow-xs border border-slate-200 dark:border-zinc-700/60">
                                <SettingsIcon className="h-4 w-4 text-[#FF5722]" />
                                Settings
                            </div>
                            <button
                                type="button"
                                onClick={onOpenDesignDrawer}
                                className="flex h-8 flex-1 items-center justify-center gap-2 rounded-lg text-sm font-medium text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                            >
                                <Palette className="h-4 w-4 text-slate-400 dark:text-zinc-400" />
                                Design
                            </button>
                        </div>
                    </div>

                    <TabsContent value="settings" className="flex-1 min-h-0 overflow-y-auto">
                        <div className="divide-y divide-slate-200/80 dark:divide-zinc-800/80 px-6 py-4 [&>*]:py-5 [&>*:first-child]:pt-0 [&>*:last-child]:pb-0">
                    {/* Alignment */}
                    <SettingsSection title="Alignment">
                        <IconChoiceSetting<ContentAlignment>
                            label="Content alignment"
                            value={endPage.alignment}
                            options={ALIGN_OPTIONS}
                            onChange={(alignment) => patch({ alignment })}
                        />
                    </SettingsSection>

                    {/* Auto-redirect */}
                    <SettingsSection title="Redirect">
                        <ToggleRow
                            id="end-redirect"
                            label="Auto-redirect on completion"
                            description="Send respondents to another URL after they finish."
                            checked={endPage.redirect?.isRedirect ?? false}
                            onCheckedChange={(isRedirect) => patchRedirect({ isRedirect })}
                        />
                        {endPage.redirect?.isRedirect && (
                            <InputSetting
                                label="Redirect URL"
                                value={endPage.redirect?.link ?? ""}
                                onChange={(link) => patchRedirect({ link })}
                                placeholder="https://example.com"
                            />
                        )}
                    </SettingsSection>

                    {/* Celebration */}
                    <SettingsSection title="Celebration">
                        <ToggleRow
                            id="end-confetti"
                            label="Show confetti"
                            description="Play a confetti animation when the page appears."
                            checked={endPage.showConfetti}
                            onCheckedChange={(showConfetti) => patch({ showConfetti })}
                            icon={<PartyPopper className="h-4 w-4 text-[var(--primary)]" />}
                        />
                    </SettingsSection>

                    {/* Social sharing */}
                    <SettingsSection title="Social sharing">
                        <ToggleRow
                            id="end-social"
                            label="Show share buttons"
                            checked={endPage.socialShareButtons}
                            onCheckedChange={(socialShareButtons) =>
                                patch({ socialShareButtons })
                            }
                        />
                        {endPage.socialShareButtons && (
                            <>
                                <InputSetting
                                    label="Share message"
                                    value={endPage.socialShareMessage}
                                    onChange={(socialShareMessage) =>
                                        patch({ socialShareMessage })
                                    }
                                    placeholder="Check out this form!"
                                />
                                {SHARE_PLATFORMS.map((p) => (
                                    <ToggleRow
                                        key={p.key}
                                        id={`share-${p.key}`}
                                        label={p.label}
                                        checked={Boolean(endPage.socialShareMedia?.[p.key])}
                                        onCheckedChange={(v) => patchMedia({ [p.key]: v })}
                                    />
                                ))}
                            </>
                        )}
                    </SettingsSection>

                    {/* Embed */}
                    <SettingsSection title="Embed">
                        <InputSetting
                            label="Embed URL"
                            hint="Paste a YouTube, Loom, Vimeo, or other embeddable link."
                            value={endPage.embed?.url ?? ""}
                            onChange={(url) => patchEmbed({ url })}
                            placeholder="https://youtube.com/embed/..."
                        />
                    </SettingsSection>

                    {/* Cover image — mirrors the page settings pattern: a preview with
                        Replace/Remove, or an add button; both open the image picker. */}
                    <SettingsSection title="Cover image">
                        {endPage.coverImage?.url ? (
                            <div className="space-y-3">
                                <div className="relative overflow-hidden rounded-lg border border-zinc-800 shadow-xs">
                                    <img
                                        src={endPage.coverImage.url}
                                        alt={endPage.coverImage.alt || "Cover"}
                                        style={getCoverImageStyle(endPage.coverImage)}
                                        className="h-28 w-full object-cover"
                                    />
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setCoverDialogOpen(true)}
                                        className="flex h-10 flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-100 dark:bg-[#1a1a20] px-2.5 text-xs font-medium text-slate-700 dark:text-zinc-300 shadow-xs hover:bg-slate-200 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                                    >
                                       <ImagePlus className="h-3.5 w-3.5"/>
                                        Replace
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setCoverEditorOpen(true)}
                                        className="flex h-10 flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-100 dark:bg-[#1a1a20] px-2.5 text-xs font-medium text-slate-700 dark:text-zinc-300 shadow-xs hover:bg-slate-200 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                                    >
                                        <SlidersHorizontal className="h-3.5 w-3.5" />
                                        Edit image
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => patch({ coverImage: null })}
                                        className="flex h-10 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg border border-rose-500/30 bg-rose-500/10 px-2.5 text-xs font-medium text-rose-500 dark:text-rose-400 hover:bg-rose-500/20 transition-colors cursor-pointer"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                        Remove
                                    </button>
                                </div>
                                <hr className="border-0 border-t border-slate-200/80 dark:border-zinc-800/80" />
                                <CoverImageLayoutSetting
                                    value={endPage.coverImage.layout}
                                    mobileValue={endPage.coverImage.mobileLayout}
                                    onChange={(layout) => {
                                        patch({
                                            coverImage: { ...endPage.coverImage!, layout },
                                        })
                                        onChangeViewMode?.(false)
                                    }}
                                    onMobileChange={(mobileLayout) => {
                                        patch({
                                            coverImage: { ...endPage.coverImage!, mobileLayout },
                                        })
                                        onChangeViewMode?.(true)
                                    }}
                                />
                                <hr className="border-0 border-t border-slate-200/80 dark:border-zinc-800/80" />
                                <FocalPointSetting
                                    url={endPage.coverImage.url}
                                    alt={endPage.coverImage.alt}
                                    value={endPage.coverImage.focalPoint}
                                    onChange={(focalPoint) =>
                                        patch({
                                            coverImage: { ...endPage.coverImage!, focalPoint },
                                        })
                                    }
                                />
                                <hr className="border-0 border-t border-slate-200/80 dark:border-zinc-800/80" />
                                <RangeSetting
                                    label="Brightness"
                                    min={-100}
                                    max={100}
                                    value={endPage.coverImage.brightness ?? 0}
                                    onChange={(brightness) =>
                                        patch({
                                            coverImage: { ...endPage.coverImage!, brightness },
                                        })
                                    }
                                />
                                <hr className="border-0 border-t border-slate-200/80 dark:border-zinc-800/80" />
                                <ImageZoomSetting
                                    value={endPage.coverImage.zoom ?? 100}
                                    onChange={(zoom) =>
                                        patch({
                                            coverImage: { ...endPage.coverImage!, zoom },
                                        })
                                    }
                                />
                            </div>
                        ) : (
                            <div
                                onClick={() => setCoverDialogOpen(true)}
                                className="flex w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-900/40 py-7 px-4 text-center cursor-pointer hover:bg-slate-100/70 dark:hover:bg-zinc-900/80 hover:border-[#FF5722]/60 transition-all group"
                            >
                                <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#18181c] text-[#FF5722] shadow-xs group-hover:scale-105 transition-transform">
                                    <ImagePlus className="h-5 w-5" />
                                </div>
                                <p className="mt-3 text-sm font-medium text-slate-800 dark:text-zinc-200">
                                    Add a cover image or drag & drop
                                </p>
                                <p className="mt-1 text-xs text-slate-500 dark:text-zinc-500">
                                    JPG, PNG, SVG • Max 5MB
                                </p>
                            </div>
                        )}
                    </SettingsSection>

                    {/* Call-to-action button — kept at the bottom, below the cover image. */}
                    <SettingsSection title="Button">
                        <InputSetting
                            label="Button text"
                            value={endPage.button?.text ?? ""}
                            onChange={(text) => patchButton({ text })}
                            placeholder="Create your own form"
                        />
                        <InputSetting
                            label="Button link"
                            value={endPage.button?.link ?? ""}
                            onChange={(link) => patchButton({ link })}
                            placeholder="https://example.com"
                        />
                    </SettingsSection>
                    </div>
                </TabsContent>
            </Tabs>
        </div>

        <ImagePickerDialog
                open={coverDialogOpen}
                onOpenChange={setCoverDialogOpen}
                onSelect={(coverImage) =>
                    patch({
                        coverImage: {
                            ...coverImage,
                            layout: endPage.coverImage?.layout ?? "top",
                            mobileLayout: endPage.coverImage?.mobileLayout,
                        },
                    })
                }
            />
        {endPage.coverImage?.url && (
            <ImageEditorDialog
                open={coverEditorOpen}
                onOpenChange={setCoverEditorOpen}
                coverImage={endPage.coverImage}
                onSave={({ brightness, edits }) =>
                    patch({
                        coverImage: {
                            ...endPage.coverImage!,
                            brightness,
                            edits,
                        },
                    })
                }
            />
        )}
        </div>
    )
}

export const EndPageSettingsPanel = memo(EndPageSettingsPanelComponent)
