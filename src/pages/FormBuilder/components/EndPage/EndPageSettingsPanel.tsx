import { useState } from "react"
import {
    AlignLeft,
    AlignCenter,
    AlignRight,
    PartyPopper,
    ImagePlus,
    Trash2,
    Palette,
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
    ToggleRow,
    TAB_LIST_CLASS,
    TAB_TRIGGER_CLASS,
} from "../settings/primitives"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ImagePickerDialog } from "../settings/ImagePickerDialog"

interface EndPageSettingsPanelProps {
    endPage: EndPage
    endPageIndex: number
    onUpdate: (index: number, updates: Partial<EndPage>) => void
    onOpenDesignDrawer: () => void
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
export function EndPageSettingsPanel({
    endPage,
    endPageIndex,
    onUpdate,
    onOpenDesignDrawer,
}: EndPageSettingsPanelProps) {
    const [coverDialogOpen, setCoverDialogOpen] = useState(false)

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
        <div className="editorial-shadow-md flex h-full w-full flex-col overflow-hidden bg-[var(--card)] border-l border-[var(--border)]">
            <Tabs defaultValue="settings" className="flex flex-1 min-h-0 flex-col">
                {/* Pill tabs, matching the page settings panel: the list is the
                    track, the active tab a raised card. */}
                <div className="px-6 pt-5">
                    <TabsList className={TAB_LIST_CLASS}>
                        {/* Same treatment as the page SettingsPanel: the
                            Settings tab is the only real tab (always active)
                            and Design is a lookalike action button that opens
                            the shared overlay drawer. */}
                        <TabsTrigger value="settings" className={TAB_TRIGGER_CLASS}>
                            <SlidersHorizontal className="h-4 w-4" />
                            Settings
                        </TabsTrigger>
                        <button
                            type="button"
                            onClick={onOpenDesignDrawer}
                            className={
                                "inline-flex items-center justify-center whitespace-nowrap " +
                                TAB_TRIGGER_CLASS
                            }
                        >
                            <Palette className="h-4 w-4" />
                            Design
                        </button>
                    </TabsList>
                </div>

                <TabsContent value="settings" className="flex-1 min-h-0 overflow-y-auto">
                    <div className="space-y-8 px-6 py-6">
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
                                <div className="space-y-3">
                                    {SHARE_PLATFORMS.map((p) => (
                                        <ToggleRow
                                            key={p.key}
                                            id={`share-${p.key}`}
                                            label={p.label}
                                            checked={Boolean(endPage.socialShareMedia?.[p.key])}
                                            onCheckedChange={(v) => patchMedia({ [p.key]: v })}
                                        />
                                    ))}
                                </div>
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
                                <div className="relative overflow-hidden rounded-[22px] border border-[var(--editorial-border-light)]">
                                    <img
                                        src={endPage.coverImage.url}
                                        alt={endPage.coverImage.alt || "Cover"}
                                        className="h-28 w-full object-cover"
                                    />
                                </div>
                                <div className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setCoverDialogOpen(true)}
                                        className="editorial-transition flex-1 rounded-[16px] border border-[var(--border)] bg-[var(--secondary)] px-4 py-3 text-sm text-[var(--foreground)] hover:-translate-y-0.5 hover:border-[var(--editorial-primary-ring)] hover:bg-[var(--editorial-primary-light)] active:translate-y-0 active:scale-[.98]"
                                    >
                                        Replace
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => patch({ coverImage: null })}
                                        className="editorial-transition flex items-center justify-center gap-1.5 rounded-[16px] border border-[var(--border)] bg-[var(--secondary)] px-4 py-3 text-sm text-[var(--destructive)] hover:-translate-y-0.5 hover:border-[var(--destructive)]/30 active:translate-y-0 active:scale-[.98]"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                        Remove
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={() => setCoverDialogOpen(true)}
                                className="editorial-transition flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-[var(--input)] bg-[var(--secondary)] py-10 text-sm text-[var(--editorial-subtle)] hover:border-[var(--editorial-primary-ring)] hover:bg-[var(--editorial-primary-light)] hover:text-[var(--foreground)]"
                            >
                                <ImagePlus className="h-5 w-5" />
                                <span>Add a cover image</span>
                            </button>
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

            <ImagePickerDialog
                open={coverDialogOpen}
                onOpenChange={setCoverDialogOpen}
                onSelect={(coverImage) => patch({ coverImage })}
                currentImage={endPage.coverImage}
            />
        </div>
    )
}
