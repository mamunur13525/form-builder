import React from "react"
import { Button } from "@/components/ui/button"
import {
    ColorSetting,
    IconChoiceSetting,
    InputSetting,
    RangeSetting,
    ImageZoomSetting,
    SelectSetting,
    SettingsSection,
} from "../primitives"
import { ImagePickerDialog } from "../ImagePickerDialog"
import { FocalPointSetting } from "../FocalPointSetting"
import type { CoverImage, IThemeFont } from "@/shared/types/common"
import type { ResolvedFormTheme } from "@/shared/utils/theme"
import { Image as ImageIcon, LayoutTemplate, Palette, Trash2, Type } from "lucide-react"
import {
    ALIGNMENT_OPTIONS,
    COLOR_PAGES,
    CORNER_RADIUS_OPTIONS,
    FONT_FAMILY_OPTIONS,
    FONT_SIZE_OPTIONS,
    FONT_SOURCE_OPTIONS,
} from "./designOptions"

interface ThemeSettingsTabProps {
    draftTheme: ResolvedFormTheme
    draftCoverImage: CoverImage | null
    hasTargetPage: boolean
    patchTheme: (patch: Partial<ResolvedFormTheme>) => void
    patchFont: (patch: Partial<IThemeFont>) => void
    patchWallpaperImage: (patch: Partial<CoverImage>) => void
    setWallpaperImage: (image: CoverImage | null) => void
    setWallpaperImageUrl: (url: string) => void
}

/** "Customize" tab: colors, typography, layout and page wallpaper cover image. */
export function ThemeSettingsTab({
    draftTheme,
    draftCoverImage,
    hasTargetPage,
    patchTheme,
    patchFont,
    patchWallpaperImage,
    setWallpaperImage,
    setWallpaperImageUrl,
}: ThemeSettingsTabProps) {
    const [pickerOpen, setPickerOpen] = React.useState(false)
    const wallpaperImage = draftCoverImage?.layout === "wallpaper" ? draftCoverImage : null

    return (
        <div className="divide-y divide-slate-200/80 dark:divide-zinc-800/80 [&>*]:py-5 [&>*:first-child]:pt-0 [&>*:last-child]:pb-0">
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

            {hasTargetPage && (
                <SettingsSection
                    title="Wallpaper Cover Image"
                    icon={<ImageIcon className="h-4 w-4 text-slate-500" />}
                >
                    <div className="space-y-4">
                        <InputSetting
                            label="Image URL"
                            value={wallpaperImage?.url ?? ""}
                            onChange={setWallpaperImageUrl}
                            placeholder="https://images.unsplash.com/..."
                            trailing={
                                <div className="flex items-center gap-1.5 shrink-0">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setPickerOpen(true)}
                                        className="h-[42px] rounded-lg px-3 text-xs font-medium cursor-pointer"
                                    >
                                        Browse
                                    </Button>
                                    {wallpaperImage?.url ? (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            aria-label="Remove wallpaper cover image"
                                            onClick={() => setWallpaperImage(null)}
                                            className="h-[42px] w-[42px] shrink-0 rounded-lg text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    ) : null}
                                </div>
                            }
                        />

                        {wallpaperImage?.url && (
                            <>
                                <hr className="border-0 border-t border-slate-200/80 dark:border-zinc-800/80" />

                                <FocalPointSetting
                                    url={wallpaperImage.url}
                                    alt={wallpaperImage.alt}
                                    value={wallpaperImage.focalPoint}
                                    onChange={(focalPoint) => patchWallpaperImage({ focalPoint })}
                                />

                                <hr className="border-0 border-t border-slate-200/80 dark:border-zinc-800/80" />

                                <RangeSetting
                                    label="Brightness"
                                    min={-100}
                                    max={100}
                                    value={wallpaperImage.brightness ?? 0}
                                    onChange={(brightness) => patchWallpaperImage({ brightness })}
                                />

                                <hr className="border-0 border-t border-slate-200/80 dark:border-zinc-800/80" />

                                <ImageZoomSetting
                                    value={wallpaperImage.zoom ?? 100}
                                    onChange={(zoom) => patchWallpaperImage({ zoom })}
                                />

                                <hr className="border-0 border-t border-slate-200/80 dark:border-zinc-800/80" />

                                <InputSetting
                                    label="Alt Text"
                                    value={wallpaperImage.alt ?? ""}
                                    onChange={(alt) => patchWallpaperImage({ alt })}
                                    placeholder="Background description"
                                />
                            </>
                        )}
                    </div>

                    <ImagePickerDialog
                        open={pickerOpen}
                        onOpenChange={setPickerOpen}
                        title="Wallpaper cover image"
                        onSelect={(image) => setWallpaperImage(image)}
                    />
                </SettingsSection>
            )}
        </div>
    )
}
