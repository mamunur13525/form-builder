import { useEffect, useMemo } from "react"
import { Share2 } from "lucide-react"
import type { EndPage, IFormTheme } from "@/shared/types/common"
import { PageLabel, PageHelperText, PageSubmitButton } from "@/shared/components/pages"
import { resolveFormTheme, getFontSizeClasses, loadThemeFont } from "@/shared/utils/theme"
import { ConfettiBurst } from "@/shared/components/ConfettiBurst"
import { SHARE_LABELS, buildShareLinks, type ShareKey } from "@/shared/components/EndPageView"
import { cn } from "@/lib/utils"

interface EndPageContentEditorProps {
    endPage: EndPage
    endPageIndex: number
    onUpdate: (index: number, updates: Partial<EndPage>) => void
    isMobileView: boolean
    theme?: IFormTheme | null
}

/**
 * The middle-column editor for a single end page. Mirrors PageContentEditor:
 * a themed canvas with an editable title and message, plus a preview of the
 * cover image, embed, and call-to-action button.
 */
export function EndPageContentEditor({
    endPage,
    endPageIndex,
    onUpdate,
    isMobileView,
    theme,
}: EndPageContentEditorProps) {
    const themeResolved = resolveFormTheme(theme)

    useEffect(() => {
        if (themeResolved.font) loadThemeFont(themeResolved.font)
    }, [themeResolved.font])

    const fontSizes = getFontSizeClasses(themeResolved.fontSize)
    const alignClass =
        endPage.alignment === "center"
            ? "text-center items-center"
            : endPage.alignment === "right"
                ? "text-right items-end"
                : "text-left items-start"

    const shareLinks = useMemo(
        () => buildShareLinks(endPage.socialShareMessage),
        [endPage.socialShareMessage],
    )
    const enabledShares = (Object.keys(SHARE_LABELS) as ShareKey[]).filter(
        (k) => endPage.socialShareMedia?.[k],
    )

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

    return (
        <div
            className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden"
            style={containerStyle}
        >
            {themeResolved.backgroundImage?.url && (
                <div className="absolute inset-0 pointer-events-none z-0" style={bgImageStyle} />
            )}

            {endPage.showConfetti && <ConfettiBurst originY="20%" />}

            <div className={cn("relative z-10 w-full min-h-0 overflow-y-auto max-w-[800px]")}>
                <div
                    className={cn(
                        "mx-auto flex flex-col transition-all duration-500 ease-out pl-5 pr-2 py-8 sm:px-6 sm:py-12",
                        alignClass,
                        isMobileView ? "w-full" : "w-full sm:w-11/12",
                    )}
                >
                    {endPage.coverImage?.url && (
                        <img
                            src={endPage.coverImage.url}
                            alt={endPage.coverImage.alt || ""}
                            className="mb-8 max-h-56 w-full rounded-[22px] border border-[var(--editorial-border-light)] object-cover"
                        />
                    )}

                    <PageLabel
                        label={endPage.title}
                        editable
                        onUpdate={(title) => onUpdate(endPageIndex, { title })}
                        color={themeResolved.questionColor}
                        fontSizeClass={fontSizes.question}
                    />

                    <PageHelperText
                        helperText={endPage.helperText ?? ""}
                        editable
                        onUpdate={(helperText) => onUpdate(endPageIndex, { helperText })}
                        color={themeResolved.textColor}
                        fontSizeClass={fontSizes.helper}
                    />

                    {endPage.embed?.url && (
                        <div className="mt-8 w-full overflow-hidden rounded-xl border border-[var(--editorial-border-light)] aspect-video">
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
                                    // Illustrative in the builder — don't navigate away on click.
                                    onClick={(e) => e.preventDefault()}
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
                        <PageSubmitButton
                            text={endPage.button.text}
                            color={themeResolved.buttonColor}
                            textColor={themeResolved.buttonTextColor}
                            roundCorners={themeResolved.roundCorners}
                            fontSizeClass={fontSizes.button}
                        />
                    )}
                </div>
            </div>
        </div>
    )
}
