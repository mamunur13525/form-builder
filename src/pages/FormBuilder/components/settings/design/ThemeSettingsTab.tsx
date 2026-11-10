import { Button } from "@/components/ui/button"
import {
    ColorSetting,
    IconChoiceSetting,
    InputSetting,
    RangeSetting,
    SelectSetting,
    SettingsSection,
    ToggleRow,
} from "../primitives"
import type { IThemeBackgroundImage, IThemeFont } from "@/shared/types/common"
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
    patchTheme: (patch: Partial<ResolvedFormTheme>) => void
    patchFont: (patch: Partial<IThemeFont>) => void
    patchBackgroundImage: (patch: Partial<IThemeBackgroundImage>) => void
    setBackgroundImageUrl: (url: string) => void
}

/** "Customize" tab: colors, typography, layout and background image. */
export function ThemeSettingsTab({
    draftTheme,
    patchTheme,
    patchFont,
    patchBackgroundImage,
    setBackgroundImageUrl,
}: ThemeSettingsTabProps) {
    const backgroundImage = draftTheme.backgroundImage

    return (
        <>
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
                                    className="h-[42px] w-[42px] shrink-0 rounded-lg text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
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
        </>
    )
}
