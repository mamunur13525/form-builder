import React from "react"
import { ChevronDown } from "lucide-react"
import type { CoverImageLayout, MobileCoverImageLayout } from "@/shared/types/common"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface LayoutOption<T extends string> {
    value: T
    label: string
    title: string
}

const MOBILE_LAYOUT_OPTIONS: readonly LayoutOption<MobileCoverImageLayout>[] = [
    { value: "top", label: "Top", title: "Image above the question" },
    { value: "bottom", label: "Below", title: "Image below the question" },
    { value: "banner", label: "Banner", title: "Top of the page cover banner" },
    { value: "wallpaper", label: "Wallpaper", title: "Full background wallpaper" },
]

const DESKTOP_LAYOUT_OPTIONS: readonly LayoutOption<CoverImageLayout>[] = [
    { value: "top", label: "Top", title: "Image above the question" },
    { value: "bottom", label: "Below", title: "Image below the question" },
    { value: "right", label: "Right", title: "Image on the right, question on the left" },
    { value: "left", label: "Left", title: "Image on the left, question on the right" },
    { value: "banner", label: "Banner", title: "Top of the page cover banner" },
    { value: "wallpaper", label: "Wallpaper", title: "Full background wallpaper" },
]

/** Portrait phone-frame diagram for mobile cover image placement. */
function MobileLayoutIcon({
    layout,
    className,
}: {
    layout: MobileCoverImageLayout
    className?: string
}) {
    const isWallpaper = layout === "wallpaper"
    const ink = isWallpaper ? "#ffffff" : "currentColor"

    return (
        <svg viewBox="0 0 22 28" fill="none" className={className} aria-hidden>
            <rect
                x="1.5"
                y="1.5"
                width="19"
                height="25"
                rx="3"
                stroke="currentColor"
                strokeWidth="1.5"
                fill={isWallpaper ? "currentColor" : "none"}
                fillOpacity={isWallpaper ? 0.85 : 0}
            />
            {layout === "top" && (
                <>
                    <rect x="4" y="4.5" width="14" height="7" rx="1.5" fill="currentColor" opacity="0.82" />
                    <path d="M5 15.5h8M5 19h12M5 22.5h9" stroke={ink} strokeWidth="1.6" strokeLinecap="round" />
                </>
            )}
            {layout === "bottom" && (
                <>
                    <path d="M5 5.5h8M5 9h12M5 12.5h9" stroke={ink} strokeWidth="1.6" strokeLinecap="round" />
                    <rect x="4" y="16" width="14" height="7" rx="1.5" fill="currentColor" opacity="0.82" />
                </>
            )}
            {layout === "banner" && (
                <>
                    <path
                        d="M2.2 4.5a2.3 2.3 0 0 1 2.3-2.3h13a2.3 2.3 0 0 1 2.3 2.3V13H2.2V4.5Z"
                        fill="currentColor"
                        opacity="0.85"
                    />
                    <path d="M5 17h9M5 20.5h12" stroke={ink} strokeWidth="1.6" strokeLinecap="round" />
                </>
            )}
            {layout === "wallpaper" && (
                <path d="M5 12h9M5 15.5h12" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round" />
            )}
        </svg>
    )
}

/** Landscape desktop-frame diagram for desktop cover image placement. */
function DesktopLayoutIcon({
    layout,
    className,
}: {
    layout: CoverImageLayout
    className?: string
}) {
    const isWallpaper = layout === "wallpaper"
    const ink = isWallpaper ? "#ffffff" : "currentColor"

    return (
        <svg viewBox="0 0 30 22" fill="none" className={className} aria-hidden>
            <rect
                x="1.5"
                y="1.5"
                width="27"
                height="19"
                rx="3"
                stroke="currentColor"
                strokeWidth="1.5"
                fill={isWallpaper ? "currentColor" : "none"}
                fillOpacity={isWallpaper ? 0.85 : 0}
            />
            {layout === "top" && (
                <>
                    <rect x="6" y="4.5" width="18" height="6" rx="1.5" fill="currentColor" opacity="0.82" />
                    <path d="M7 13.8h10M7 16.8h14" stroke={ink} strokeWidth="1.6" strokeLinecap="round" />
                </>
            )}
            {layout === "bottom" && (
                <>
                    <path d="M7 5.2h10M7 8.2h14" stroke={ink} strokeWidth="1.6" strokeLinecap="round" />
                    <rect x="6" y="11.5" width="18" height="6" rx="1.5" fill="currentColor" opacity="0.82" />
                </>
            )}
            {layout === "right" && (
                <>
                    <path d="M5 9h6M5 12.8h8" stroke={ink} strokeWidth="1.6" strokeLinecap="round" />
                    <path
                        d="M16 2.2h9.5a2.3 2.3 0 0 1 2.3 2.3v13a2.3 2.3 0 0 1-2.3 2.3H16V2.2Z"
                        fill="currentColor"
                        opacity="0.85"
                    />
                </>
            )}
            {layout === "left" && (
                <>
                    <path
                        d="M2.2 4.5a2.3 2.3 0 0 1 2.3-2.3H14v17.6H4.5a2.3 2.3 0 0 1-2.3-2.3v-13Z"
                        fill="currentColor"
                        opacity="0.85"
                    />
                    <path d="M17 9h6M17 12.8h8" stroke={ink} strokeWidth="1.6" strokeLinecap="round" />
                </>
            )}
            {layout === "banner" && (
                <>
                    <path
                        d="M2.2 4.5a2.3 2.3 0 0 1 2.3-2.3h21a2.3 2.3 0 0 1 2.3 2.3V9.5H2.2V4.5Z"
                        fill="currentColor"
                        opacity="0.85"
                    />
                    <path d="M6 13.5h10M6 16.5h16" stroke={ink} strokeWidth="1.6" strokeLinecap="round" />
                </>
            )}
            {layout === "wallpaper" && (
                <path d="M6 9.5h10M6 13h16" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round" />
            )}
        </svg>
    )
}

function LayoutPickerRow<T extends string>({
    label,
    value,
    options,
    onChange,
    renderIcon,
    columns,
    disabled,
}: {
    label: string
    value: T
    options: readonly LayoutOption<T>[]
    onChange: (value: T) => void
    renderIcon: (layout: T, className?: string) => React.ReactNode
    columns: 3 | 4
    disabled?: boolean
}) {
    const [open, setOpen] = React.useState(false)

    return (
        <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-medium text-slate-600 dark:text-zinc-300">
                {label}
            </span>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger
                    render={
                        <button
                            type="button"
                            disabled={disabled}
                            aria-label={`${label} cover image layout`}
                            className={cn(
                                "inline-flex items-center gap-2 rounded-xl border px-2.5 py-1.5 transition-colors cursor-pointer",
                                "border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/90 text-slate-700 dark:text-zinc-200",
                                "hover:bg-slate-100 dark:hover:bg-zinc-800",
                                open && "bg-slate-200/80 dark:bg-zinc-800 border-slate-300 dark:border-zinc-700",
                                disabled && "pointer-events-none opacity-50"
                            )}
                        />
                    }
                >
                    {renderIcon(value, columns === 4 ? "h-6 w-5" : "h-5 w-7")}
                    <ChevronDown className="h-3.5 w-3.5 text-slate-500 dark:text-zinc-400" />
                </PopoverTrigger>
                <PopoverContent
                    align="end"
                    side="bottom"
                    sideOffset={8}
                    className="w-auto rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#18181c] p-2.5 shadow-xl"
                >
                    <div
                        className={cn(
                            "grid gap-2",
                            columns === 4 ? "grid-cols-4" : "grid-cols-3"
                        )}
                    >
                        {options.map((opt) => {
                            const selected = opt.value === value
                            return (
                                <button
                                    key={opt.value}
                                    type="button"
                                    title={opt.title}
                                    aria-label={`${label}: ${opt.label}`}
                                    aria-pressed={selected}
                                    onClick={() => {
                                        onChange(opt.value)
                                        setOpen(false)
                                    }}
                                    className={cn(
                                        "flex items-center justify-center rounded-xl border p-2 transition-all cursor-pointer",
                                        selected
                                            ? "border-[#FF5722] bg-[#FF5722]/10 text-[#FF5722] shadow-xs"
                                            : "border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-900/60 text-slate-600 dark:text-zinc-400 hover:border-slate-300 dark:hover:border-zinc-700 hover:text-slate-900 dark:hover:text-zinc-100"
                                    )}
                                >
                                    {renderIcon(opt.value, columns === 4 ? "h-7 w-6" : "h-6 w-8")}
                                </button>
                            )
                        })}
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    )
}

/**
 * Pickers for where the cover image sits on Mobile and Desktop viewports.
 */
export function CoverImageLayoutSetting({
    value,
    mobileValue,
    onChange,
    onMobileChange,
    disabled,
}: {
    value?: CoverImageLayout
    mobileValue?: MobileCoverImageLayout
    onChange: (layout: CoverImageLayout) => void
    onMobileChange?: (layout: MobileCoverImageLayout) => void
    disabled?: boolean
}) {
    const resolvedDesktop: CoverImageLayout = value ?? "top"
    const resolvedMobile: MobileCoverImageLayout =
        mobileValue ??
        (resolvedDesktop === "left" || resolvedDesktop === "right" ? "top" : resolvedDesktop)

    return (
        <div className="space-y-2.5 pt-1">
            {onMobileChange && (
                <LayoutPickerRow
                    label="Mobile"
                    value={resolvedMobile}
                    options={MOBILE_LAYOUT_OPTIONS}
                    onChange={onMobileChange}
                    renderIcon={(layout, className) => (
                        <MobileLayoutIcon layout={layout} className={className} />
                    )}
                    columns={4}
                    disabled={disabled}
                />
            )}
            <LayoutPickerRow
                label="Desktop"
                value={resolvedDesktop}
                options={DESKTOP_LAYOUT_OPTIONS}
                onChange={onChange}
                renderIcon={(layout, className) => (
                    <DesktopLayoutIcon layout={layout} className={className} />
                )}
                columns={3}
                disabled={disabled}
            />
        </div>
    )
}
