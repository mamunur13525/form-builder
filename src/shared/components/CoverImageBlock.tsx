import type { ReactNode } from "react"
import { ImagePlus, SlidersHorizontal, Trash2 } from "lucide-react"
import type { CoverImage, CoverImageLayout } from "../types/common"
import { getCoverImageStyle } from "../utils/theme"
import { cn } from "@/lib/utils"

interface CoverImageHoverBarProps {
    onChangeImage: () => void
    onEditImage: () => void
    onRemoveImage: () => void
    className?: string
}

/**
 * Floating pill shown on hover over a cover image in the builder preview:
 * Change | Edit image | Remove.
 */
export function CoverImageHoverBar({
    onChangeImage,
    onEditImage,
    onRemoveImage,
    className,
}: CoverImageHoverBarProps) {
    return (
        <div
            onClick={(e) => e.stopPropagation()}
            className={cn(
                "pointer-events-auto inline-flex items-center gap-0.5 rounded-full border border-slate-200/90 bg-white/95 px-1.5 py-1 shadow-lg backdrop-blur-sm transition-opacity duration-200 dark:border-zinc-700 dark:bg-[#18181c]/95",
                className,
            )}
        >
            <button
                type="button"
                onClick={onChangeImage}
                className="inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-zinc-200 dark:hover:bg-zinc-800 dark:hover:text-white"
            >
                <ImagePlus className="h-3.5 w-3.5" />
                Change
            </button>
            <span aria-hidden className="h-3.5 w-px bg-slate-200 dark:bg-zinc-700" />
            <button
                type="button"
                onClick={onEditImage}
                className="inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-zinc-200 dark:hover:bg-zinc-800 dark:hover:text-white"
            >
                <SlidersHorizontal className="h-3.5 w-3.5" />
                Edit 
            </button>
            <span aria-hidden className="h-3.5 w-px bg-slate-200 dark:bg-zinc-700" />
            <button
                type="button"
                onClick={onRemoveImage}
                className="inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium text-rose-600 transition-colors hover:bg-rose-50 hover:text-rose-700 dark:text-rose-400 dark:hover:bg-rose-950/40"
            >
                <Trash2 className="h-3.5 w-3.5" />
                Remove
            </button>
        </div>
    )
}

interface CoverImageBlockProps {
    coverImage?: CoverImage | null
    /** Resolved layout override (used when mobile/desktop layouts differ). */
    layout?: CoverImageLayout
    children: ReactNode
    /** Optional hover toolbar rendered over the image in builder preview. */
    hoverActions?: ReactNode
    /** Extra classes for the outer layout wrapper. */
    className?: string
    /** Extra classes for the image itself (border, corner radius, etc.). */
    imageClassName?: string
    /** Extra classes for the content column (alignment, etc.). */
    contentClassName?: string
    /** Gap between the image and the content column. */
    gapClassName?: string
}

/**
 * Inline cover image placement for the "top" and "bottom" layouts.
 *
 * `bottom` renders the image after *all* page content — including the submit
 * button — so the whole content block sits above it.
 *
 * Side layouts split the whole page in half and are rendered with
 * `CoverImageSide` instead. When the image is absent the children render
 * untouched, so callers can use this unconditionally.
 */
export function CoverImageBlock({
    coverImage,
    layout: layoutOverride,
    children,
    hoverActions,
    className,
    imageClassName,
    contentClassName,
    gapClassName = "gap-8",
}: CoverImageBlockProps) {
    const layout = layoutOverride ?? coverImage?.layout ?? "top"

    if (
        !coverImage?.url ||
        layout === "banner" ||
        layout === "wallpaper" ||
        layout === "left" ||
        layout === "right"
    ) {
        return (
            <div className={cn("flex w-full flex-col", contentClassName)}>
                {children}
            </div>
        )
    }

    const image = (
        <div className={cn("group/cover relative w-full overflow-hidden", imageClassName)}>
            <img
                src={coverImage.url}
                alt={coverImage.alt || ""}
                style={getCoverImageStyle(coverImage)}
                className="max-h-56 w-full object-cover transition-[object-position,transform] duration-500 ease-out"
            />
            {hoverActions && (
                <div className="pointer-events-none absolute top-3 right-3 z-20 flex justify-end opacity-0 transition-opacity duration-200 group-hover/cover:opacity-100">
                    {hoverActions}
                </div>
            )}
        </div>
    )

    return (
        <div className={cn("flex w-full flex-col", gapClassName, className)}>
            {layout !== "bottom" && image}
            <div className={cn("flex w-full min-w-0 flex-col", contentClassName)}>
                {children}
            </div>
            {layout === "bottom" && image}
        </div>
    )
}

/**
 * One half of a left/right cover layout. The page is split 50/50: the image
 * fills this half edge-to-edge while the content fills the other half.
 *
 * On small screens the halves stack vertically; from the `sm` breakpoint up
 * they become two equal columns.
 */
export function CoverImageSide({
    coverImage,
    side,
    imageClassName,
    hoverActions,
}: {
    coverImage?: CoverImage | null
    side: CoverImageLayout
    imageClassName?: string
    hoverActions?: ReactNode
}) {
    if (!coverImage?.url) return null

    return (
        <div
            className={cn(
                "group/cover relative h-56 w-full shrink-0 overflow-hidden sm:h-full sm:w-1/2",
                side === "right" && "sm:order-2",
            )}
        >
            <img
                src={coverImage.url}
                alt={coverImage.alt || ""}
                style={getCoverImageStyle(coverImage)}
                className={cn("h-full w-full object-cover transition-[object-position,transform] duration-500 ease-out", imageClassName)}
            />
            {hoverActions && (
                <div className="pointer-events-none absolute top-3 right-3 z-20 flex justify-end opacity-0 transition-opacity duration-200 group-hover/cover:opacity-100">
                    {hoverActions}
                </div>
            )}
        </div>
    )
}
