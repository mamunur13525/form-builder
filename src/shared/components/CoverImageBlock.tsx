import type { ReactNode } from "react"
import type { CoverImage, CoverImageLayout } from "../types/common"
import { cn } from "@/lib/utils"

interface CoverImageBlockProps {
    coverImage?: CoverImage | null
    children: ReactNode
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
    children,
    className,
    imageClassName,
    contentClassName,
    gapClassName = "gap-8",
}: CoverImageBlockProps) {
    if (!coverImage?.url) {
        return (
            <div className={cn("flex w-full flex-col", contentClassName)}>
                {children}
            </div>
        )
    }

    const layout = coverImage.layout ?? "top"

    const image = (
        <img
            src={coverImage.url}
            alt={coverImage.alt || ""}
            className={cn("max-h-56 w-full object-cover", imageClassName)}
        />
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
}: {
    coverImage?: CoverImage | null
    side: CoverImageLayout
    imageClassName?: string
}) {
    if (!coverImage?.url) return null

    return (
        <div
            className={cn(
                "relative h-56 w-full shrink-0 overflow-hidden sm:h-full sm:w-1/2",
                side === "right" && "sm:order-2",
            )}
        >
            <img
                src={coverImage.url}
                alt={coverImage.alt || ""}
                className={cn("h-full w-full object-cover", imageClassName)}
            />
        </div>
    )
}
