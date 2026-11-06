import { useEffect, useMemo } from "react"
import { motion } from "framer-motion"
import { Share2, ExternalLink } from "lucide-react"
import type { EndPage, IFormTheme } from "../types/common"
import { cn } from "@/lib/utils"
import { resolveFormTheme, getFontSizeClasses, getCornerRadiusCss, loadThemeFont } from "../utils/theme"
import { ConfettiBurst } from "./ConfettiBurst"
import { CoverImageBlock, CoverImageSide } from "./CoverImageBlock"

interface EndPageViewProps {
    endPage: EndPage
    theme?: IFormTheme | null
    /**
     * "published" enables the auto-redirect behaviour. In "preview" we never
     * navigate away, so the builder/preview stays put.
     */
    mode?: "preview" | "published"
}

export type ShareKey = "facebook" | "twitter" | "linkedin" | "whatsapp"

export const SHARE_LABELS: Record<ShareKey, string> = {
    facebook: "Facebook",
    twitter: "X",
    linkedin: "LinkedIn",
    whatsapp: "WhatsApp",
}

export function buildShareLinks(message: string): Record<ShareKey, string> {
    const shareUrl = encodeURIComponent(
        typeof window !== "undefined" ? window.location.href : "",
    )
    const shareText = encodeURIComponent(message || "Check out this form!")
    return {
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`,
        twitter: `https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareText}`,
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`,
        whatsapp: `https://api.whatsapp.com/send?text=${shareText}%20${shareUrl}`,
    }
}

/**
 * Presentational completion screen for a single end page. Themed to match the
 * form and reused by both the live form (on submit) and the builder preview.
 */
export function EndPageView({ endPage, theme, mode = "published" }: EndPageViewProps) {
    const themeResolved = resolveFormTheme(theme)
    const fontSizes = getFontSizeClasses(themeResolved.fontSize)

    useEffect(() => {
        if (themeResolved.font) loadThemeFont(themeResolved.font)
    }, [themeResolved.font])

    // Auto-redirect once, and only on the live form.
    useEffect(() => {
        if (
            mode === "published" &&
            endPage.redirect?.isRedirect &&
            endPage.redirect?.link
        ) {
            const timer = setTimeout(() => {
                window.location.href = endPage.redirect.link
            }, 2000)
            return () => clearTimeout(timer)
        }
    }, [mode, endPage.redirect?.isRedirect, endPage.redirect?.link])

    const alignClass =
        endPage.alignment === "center"
            ? "text-center items-center"
            : endPage.alignment === "right"
                ? "text-right items-end"
                : "text-left items-start"

    const message = endPage.helperText || endPage.paragraph || ""
    const shareLinks = useMemo(
        () => buildShareLinks(endPage.socialShareMessage),
        [endPage.socialShareMessage],
    )
    const enabledShares = (Object.keys(SHARE_LABELS) as ShareKey[]).filter(
        (k) => endPage.socialShareMedia?.[k],
    )

    const coverLayout = endPage.coverImage?.layout ?? "top"
    const isSideCover =
        Boolean(endPage.coverImage?.url) &&
        (coverLayout === "left" || coverLayout === "right")

    const containerStyle: React.CSSProperties = {
        backgroundColor: themeResolved.backgroundColor,
        color: themeResolved.textColor,
        fontFamily: themeResolved.font?.family
            ? `"${themeResolved.font.family}", sans-serif`
            : undefined,
    }

    const bgImageStyle: React.CSSProperties = themeResolved.backgroundImage?.url
        ? {
            backgroundImage: `url(${themeResolved.backgroundImage.url})`,
            backgroundRepeat: themeResolved.backgroundImage.tile ? "repeat" : "no-repeat",
            backgroundSize: themeResolved.backgroundImage.tile ? "auto" : "cover",
            backgroundPosition: "center",
            filter:
                themeResolved.backgroundImage.brightness !== undefined
                    ? `brightness(${(100 + themeResolved.backgroundImage.brightness) / 100})`
                    : undefined,
        }
        : {}

    const content = (
        <>
            <h2
                className={cn(fontSizes.question, "font-semibold")}
                style={{ color: themeResolved.questionColor }}
            >
                {endPage.title || "Thank you!"}
            </h2>

            {message && (
                <p
                    className={cn(fontSizes.helper, "mt-3 leading-relaxed opacity-90")}
                    style={{ color: themeResolved.textColor }}
                >
                    {message}
                </p>
            )}

            {endPage.embed?.url && (
                <div className="mt-6 w-full overflow-hidden rounded-lg border aspect-video">
                    <iframe
                        src={endPage.embed.url}
                        title={endPage.embed.title || "Embedded media"}
                        className="h-full w-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    />
                </div>
            )}

            {endPage.socialShareButtons && enabledShares.length > 0 && (
                <div className="mt-8 flex flex-wrap gap-2.5">
                    {enabledShares.map((key) => (
                        <a
                            key={key}
                            href={shareLinks[key]}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-full border border-current/20 px-4 py-2 text-sm font-medium opacity-90 transition-opacity hover:opacity-100"
                            style={{ color: themeResolved.textColor }}
                        >
                            <Share2 className="h-3.5 w-3.5" />
                            {SHARE_LABELS[key]}
                        </a>
                    ))}
                </div>
            )}

            {endPage.button?.text && (
                <a
                    href={endPage.button.link || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                        "mt-8 inline-flex items-center justify-center gap-2 px-8 py-3 font-medium transition-transform hover:-translate-y-0.5",
                        fontSizes.button,
                    )}
                    style={{
                        backgroundColor: themeResolved.buttonColor,
                        color: themeResolved.buttonTextColor,
                        borderRadius: getCornerRadiusCss(themeResolved.roundCorners),
                    }}
                >
                    {endPage.button.text}
                    <ExternalLink className="h-4 w-4" />
                </a>
            )}

            {mode === "published" &&
                endPage.redirect?.isRedirect &&
                endPage.redirect?.link && (
                    <p className="mt-6 text-sm opacity-60">
                        Redirecting you shortly…
                    </p>
                )}
        </>
    )

    return (
        <div
            className="relative flex h-full w-full items-center justify-center overflow-hidden"
            style={containerStyle}
        >
            {themeResolved.backgroundImage?.url && (
                <div className="absolute inset-0 pointer-events-none z-0" style={bgImageStyle} />
            )}

            {endPage.showConfetti && <ConfettiBurst originY="20%" />}

            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className={cn(
                    "relative z-10 w-full",
                    isSideCover
                        ? "h-full overflow-hidden"
                        : "max-w-xl overflow-y-auto px-6 py-10",
                )}
            >
                {isSideCover ? (
                    /* Left/right: split the page in half — image on one side,
                       all content (including the button) on the other. */
                    <div className="flex h-full w-full flex-col sm:flex-row">
                        <CoverImageSide coverImage={endPage.coverImage} side={coverLayout} />
                        <div className="flex min-h-0 w-full flex-1 flex-col overflow-y-auto px-6 py-10 sm:h-full sm:w-1/2">
                            <div className={cn("mx-auto my-auto flex w-full max-w-xl flex-col", alignClass)}>
                                {content}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className={cn("flex w-full flex-col", alignClass)}>
                        <CoverImageBlock
                            coverImage={endPage.coverImage}
                            imageClassName="rounded-lg border"
                            contentClassName={alignClass}
                            gapClassName="gap-6"
                        >
                            {content}
                        </CoverImageBlock>
                    </div>
                )}
            </motion.div>
        </div>
    )
}
