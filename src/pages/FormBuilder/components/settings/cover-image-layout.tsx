import type { CoverImageLayout } from "@/shared/types/common"
import { IconChoiceSetting, type IconChoiceOption } from "./primitives"

/** Small diagram that previews each cover-image placement. */
function LayoutIcon({
    layout,
    className,
}: {
    layout: CoverImageLayout
    className?: string
}) {
    const imageBlock =
        layout === "left" ? (
            <rect x="3" y="3" width="7" height="18" rx="2" fill="currentColor" opacity="0.28" />
        ) : layout === "right" ? (
            <rect x="14" y="3" width="7" height="18" rx="2" fill="currentColor" opacity="0.28" />
        ) : layout === "top" ? (
            <rect x="3" y="3" width="18" height="7" rx="2" fill="currentColor" opacity="0.28" />
        ) : (
            <rect x="3" y="14" width="18" height="7" rx="2" fill="currentColor" opacity="0.28" />
        )

    return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
            {imageBlock}
            {layout === "left" && (
                <path
                    d="M14 6.5h7M14 10.5h7M14 14.5h5M14 18.5h6"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                />
            )}
            {layout === "right" && (
                <path
                    d="M3 6.5h6M3 10.5h6M3 14.5h5M3 18.5h6"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                />
            )}
            {layout === "top" && (
                <path
                    d="M3 14h10M3 17.5h18M3 21h13"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                />
            )}
            {layout === "bottom" && (
                <path
                    d="M3 3h10M3 6.5h18M3 10h13"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                />
            )}
        </svg>
    )
}

function TopIcon({ className }: { className?: string }) {
    return <LayoutIcon layout="top" className={className} />
}

function BottomIcon({ className }: { className?: string }) {
    return <LayoutIcon layout="bottom" className={className} />
}

function LeftIcon({ className }: { className?: string }) {
    return <LayoutIcon layout="left" className={className} />
}

function RightIcon({ className }: { className?: string }) {
    return <LayoutIcon layout="right" className={className} />
}

const COVER_IMAGE_LAYOUT_OPTIONS: readonly IconChoiceOption<CoverImageLayout>[] = [
    {
        value: "top",
        label: "Top",
        icon: TopIcon,
        title: "Image above the question",
    },
    {
        value: "bottom",
        label: "Below",
        icon: BottomIcon,
        title: "Image below the question",
    },
    {
        value: "left",
        label: "Left",
        icon: LeftIcon,
        title: "Image on the left, question on the right",
    },
    {
        value: "right",
        label: "Right",
        icon: RightIcon,
        title: "Image on the right, question on the left",
    },
]

/** Picker for where the cover image sits relative to the page content. */
export function CoverImageLayoutSetting({
    value,
    onChange,
    disabled,
}: {
    value?: CoverImageLayout
    onChange: (layout: CoverImageLayout) => void
    disabled?: boolean
}) {
    return (
        <IconChoiceSetting<CoverImageLayout>
            label="Layout"
            hint={
                disabled
                    ? "Add a cover image to choose where it appears."
                    : "Choose where the cover image appears on this page."
            }
            value={value ?? "top"}
            options={COVER_IMAGE_LAYOUT_OPTIONS}
            onChange={onChange}
            disabled={disabled}
        />
    )
}
