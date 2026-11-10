import {
    AArrowDown,
    ALargeSmall,
    AArrowUp,
    AlignLeft,
    AlignCenter,
    AlignRight,
} from "lucide-react"
import type {
    ContentAlignment,
    CornerRadius,
    FontSize,
    ThemeFontSource,
} from "@/shared/types/common"
import { getCornerRadiusCss } from "@/shared/utils/theme"
import { cn } from "@/lib/utils"
import type { IconChoiceOption, SelectSettingOption } from "../primitives"

export type ThemeColorKey =
    | "questionColor"
    | "answerColor"
    | "buttonColor"
    | "buttonTextColor"
    | "primaryColor"
    | "backgroundColor"
    | "textColor"

export const COLOR_PAGES: readonly { key: ThemeColorKey; label: string; fallback: string }[] = [
    { key: "questionColor", label: "Question Color", fallback: "#111111" },
    { key: "answerColor", label: "Answer / Input Color", fallback: "#111111" },
    { key: "buttonColor", label: "Button Background", fallback: "#000000" },
    { key: "buttonTextColor", label: "Button Text Color", fallback: "#ffffff" },
    { key: "primaryColor", label: "Primary Color", fallback: "#000000" },
    { key: "backgroundColor", label: "Form Background Color", fallback: "#ffffff" },
    { key: "textColor", label: "Fallback Text Color", fallback: "#111111" },
]

export const FONT_FAMILY_OPTIONS: readonly SelectSettingOption<string>[] = [
    { label: "Inter", value: "Inter" },
    { label: "Roboto", value: "Roboto" },
    { label: "Outfit", value: "Outfit" },
    { label: "Plus Jakarta Sans", value: "Plus Jakarta Sans" },
    { label: "Playfair Display", value: "Playfair Display" },
    { label: "Space Grotesk", value: "Space Grotesk" },
    { label: "Lora", value: "Lora" },
    { label: "System UI", value: "sans-serif" },
]

export const FONT_SOURCE_OPTIONS: readonly SelectSettingOption<ThemeFontSource>[] = [
    { label: "Google Fonts", value: "google" },
    { label: "System Font", value: "system" },
    { label: "Custom URL", value: "custom" },
]

export const FONT_SIZE_OPTIONS: readonly IconChoiceOption<FontSize>[] = [
    { label: "Small", value: "small", icon: AArrowDown },
    { label: "Medium", value: "medium", icon: ALargeSmall },
    { label: "Large", value: "large", icon: AArrowUp },
]

export const ALIGNMENT_OPTIONS: readonly IconChoiceOption<ContentAlignment>[] = [
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

export const CORNER_RADIUS_OPTIONS: readonly IconChoiceOption<CornerRadius>[] = (
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
export const OVERLAY_SELECTORS = [
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

export type SidebarTab = "settings" | "presets"
