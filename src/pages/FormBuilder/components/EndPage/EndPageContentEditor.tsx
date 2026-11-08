import { useEffect, useMemo, useCallback, useRef, useState, memo } from "react"
import { Share2 } from "lucide-react"
import type { EndPage, IFormTheme } from "@/shared/types/common"
import { PageLabel, PageHelperText, PageSubmitButton, type VariableItem } from "@/shared/components/pages"
import { CoverImageBlock, CoverImageSide } from "@/shared/components/CoverImageBlock"
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
    variables?: VariableItem[]
    /**
     * When false the canvas background (colour + image) is owned by an outer
     * container, e.g. the form builder's window canvas, so the editor stays
     * transparent and lets it show through.
     */
    withBackground?: boolean
}

const EMPTY_VARIABLES: VariableItem[] = []

/**
 * The middle-column editor for a single end page. Mirrors PageContentEditor:
 * a themed canvas with an editable title and message, plus a preview of the
 * cover image, embed, and call-to-action button.
 */
function EndPageContentEditorComponent({
    endPage,
    endPageIndex,
    onUpdate,
    isMobileView,
    theme,
    variables = EMPTY_VARIABLES,
    withBackground = true,
}: EndPageContentEditorProps) {
    const themeResolved = useMemo(() => resolveFormTheme(theme), [theme])

    const fontKey = useMemo(() => {
        if (!themeResolved.font?.family) return ""
        return `${themeResolved.font.family}:${themeResolved.font.source}:${themeResolved.font.url ?? ""}`
    }, [themeResolved.font])

    useEffect(() => {
        if (themeResolved.font) loadThemeFont(themeResolved.font)
    }, [fontKey, themeResolved.font])

    const fontSizes = useMemo(
        () => getFontSizeClasses(themeResolved.fontSize),
        [themeResolved.fontSize],
    )

    const alignClass = useMemo(() => {
        return endPage.alignment === "center"
            ? "text-center items-center"
            : endPage.alignment === "right"
                ? "text-right items-end"
                : "text-left items-start"
    }, [endPage.alignment])

    const shareLinks = useMemo(
        () => buildShareLinks(endPage.socialShareMessage),
        [endPage.socialShareMessage],
    )

    const enabledShares = useMemo(() => {
        if (!endPage.socialShareButtons || !endPage.socialShareMedia) return []
        return (Object.keys(SHARE_LABELS) as ShareKey[]).filter(
            (k) => endPage.socialShareMedia?.[k],
        )
    }, [endPage.socialShareButtons, endPage.socialShareMedia])

    const containerStyle = useMemo<React.CSSProperties>(
        () => ({
            ...(withBackground ? { backgroundColor: themeResolved.backgroundColor } : {}),
            color: themeResolved.textColor,
            fontFamily: themeResolved.font?.family
                ? `"${themeResolved.font.family}", sans-serif`
                : undefined,
        }),
        [
            withBackground,
            themeResolved.backgroundColor,
            themeResolved.textColor,
            themeResolved.font?.family,
        ],
    )

    const bgImageStyle = useMemo<React.CSSProperties>(() => {
        if (!themeResolved.backgroundImage?.url) return {}
        return {
            backgroundImage: `url(${themeResolved.backgroundImage.url})`,
            backgroundRepeat: themeResolved.backgroundImage.tile ? "repeat" : "no-repeat",
            backgroundSize: themeResolved.backgroundImage.tile ? "auto" : "cover",
            backgroundPosition: "center",
            filter:
                themeResolved.backgroundImage.brightness !== undefined
                    ? `brightness(${(100 + themeResolved.backgroundImage.brightness) / 100})`
                    : undefined,
        }
    }, [themeResolved.backgroundImage])

    const onUpdateRef = useRef(onUpdate)
    useEffect(() => {
        onUpdateRef.current = onUpdate
    }, [onUpdate])

    const handleTitleChange = useCallback(
        (title: string) => {
            onUpdateRef.current(endPageIndex, { title })
        },
        [endPageIndex],
    )

    const handleHelperTextChange = useCallback(
        (helperText: string) => {
            onUpdateRef.current(endPageIndex, { helperText })
        },
        [endPageIndex],
    )

    // Unmount confetti burst after animation finishes (~3.5s) to avoid 120 framer-motion
    // elements lingering indefinitely and degrading builder performance on subsequent actions.
    const [confettiActive, setConfettiActive] = useState(false)
    useEffect(() => {
        if (endPage.showConfetti) {
            setConfettiActive(true)
            const timer = setTimeout(() => {
                setConfettiActive(false)
            }, 3500)
            return () => clearTimeout(timer)
        } else {
            setConfettiActive(false)
        }
    }, [endPage.showConfetti, endPageIndex])

    const trimmedEmbedUrl = endPage.embed?.url?.trim() ?? ""
    const isValidEmbedUrl = useMemo(() => {
        return Boolean(trimmedEmbedUrl && /^https?:\/\//i.test(trimmedEmbedUrl))
    }, [trimmedEmbedUrl])

    const coverLayout = endPage.coverImage?.layout ?? "top"
    const isSideCover =
        Boolean(endPage.coverImage?.url) &&
        (coverLayout === "left" || coverLayout === "right")

    const content = useMemo(
        () => (
            <>
                <PageLabel
                    label={endPage.title}
                    editable
                    onUpdate={handleTitleChange}
                    color={themeResolved.questionColor}
                    fontSizeClass={fontSizes.question}
                    variables={variables}
                />

                <PageHelperText
                    helperText={endPage.helperText ?? ""}
                    editable
                    onUpdate={handleHelperTextChange}
                    color={themeResolved.textColor}
                    fontSizeClass={fontSizes.helper}
                    variables={variables}
                />

                {isValidEmbedUrl && (
                    <div className="mt-8 w-full overflow-hidden rounded-lg border border-[var(--editorial-border-light)] aspect-video">
                        <iframe
                            src={trimmedEmbedUrl}
                            title={endPage.embed?.title || "Embedded media"}
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
            </>
        ),
        [
            endPage.title,
            endPage.helperText,
            endPage.socialShareButtons,
            endPage.button?.text,
            endPage.embed?.title,
            handleTitleChange,
            handleHelperTextChange,
            themeResolved.questionColor,
            themeResolved.textColor,
            themeResolved.buttonColor,
            themeResolved.buttonTextColor,
            themeResolved.roundCorners,
            fontSizes.question,
            fontSizes.helper,
            fontSizes.button,
            variables,
            isValidEmbedUrl,
            trimmedEmbedUrl,
            enabledShares,
            shareLinks,
        ],
    )

    return (
        <div
            className="light relative flex h-full w-full flex-col items-center justify-center overflow-hidden"
            style={containerStyle}
        >
            {withBackground && themeResolved.backgroundImage?.url && (
                <div className="absolute inset-0 pointer-events-none z-0" style={bgImageStyle} />
            )}

            {confettiActive && <ConfettiBurst originY="20%" />}

            {isSideCover ? (
                /* Left/right: the page is split in half — image on one side,
                   all content (including the button) on the other. */
                <div className="relative z-10 flex h-full w-full flex-col sm:flex-row">
                    <CoverImageSide coverImage={endPage.coverImage} side={coverLayout} />
                    <div className="flex min-h-0 w-full flex-1 flex-col overflow-y-auto sm:h-full sm:w-1/2">
                        <div
                            className={cn(
                                "mx-auto my-auto flex w-full max-w-[800px] flex-col px-5 py-8 sm:px-8 sm:py-12",
                                alignClass,
                            )}
                        >
                            {content}
                        </div>
                    </div>
                </div>
            ) : (
                <div className={cn("relative z-10 w-full min-h-0 overflow-y-auto max-w-[800px]")}>
                    <div
                        className={cn(
                            "mx-auto flex flex-col transition-all duration-500 ease-out pl-5 pr-2 py-8 sm:px-6 sm:py-12",
                            alignClass,
                            isMobileView ? "w-full" : "w-full sm:w-11/12",
                        )}
                    >
                        <CoverImageBlock
                            coverImage={endPage.coverImage}
                            imageClassName="rounded-lg border border-[var(--editorial-border-light)]"
                            contentClassName={alignClass}
                        >
                            {content}
                        </CoverImageBlock>
                    </div>
                </div>
            )}
        </div>
    )
}

export const EndPageContentEditor = memo(EndPageContentEditorComponent)

