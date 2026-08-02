import { useMemo } from "react"
import { FileText, Link as LinkIcon } from "lucide-react"
import type { StatementSettings } from "@/shared/types/common"

interface StatementFieldProps {
    settings: StatementSettings
}

/** Convert a share URL into an embeddable URL for the given provider. */
function toEmbedUrl(url: string, provider: StatementSettings["embedProvider"]): string | null {
    if (!url) return null
    try {
        const parsed = new URL(url)
        switch (provider) {
            case "youtube": {
                // youtu.be/<id> or youtube.com/watch?v=<id> or already /embed/<id>
                if (parsed.hostname.includes("youtu.be")) {
                    return `https://www.youtube.com/embed${parsed.pathname}`
                }
                const v = parsed.searchParams.get("v")
                if (v) return `https://www.youtube.com/embed/${v}`
                if (parsed.pathname.includes("/embed/")) return url
                return url
            }
            case "loom":
                // loom.com/share/<id> -> loom.com/embed/<id>
                return url.replace("/share/", "/embed/")
            case "vimeo": {
                const id = parsed.pathname.split("/").filter(Boolean).pop()
                return id ? `https://player.vimeo.com/video/${id}` : url
            }
            default:
                return url
        }
    } catch {
        return null
    }
}

/**
 * Display-only content block. Renders an embedded video/PDF/image when an
 * embed URL is configured. The heading/description come from the field's
 * label and helperText, which the page layout renders above this.
 */
export function StatementField({ settings }: StatementFieldProps) {
    const { embedUrl, embedProvider, embedTitle } = settings
    const src = useMemo(() => toEmbedUrl(embedUrl, embedProvider), [embedUrl, embedProvider])

    if (!src) return null

    if (embedProvider === "image") {
        return (
            <figure className="space-y-2">
                <img
                    src={src}
                    alt={embedTitle || "Embedded image"}
                    className="w-full rounded-md border object-contain"
                />
                {embedTitle && (
                    <figcaption className="text-xs text-muted-foreground">
                        {embedTitle}
                    </figcaption>
                )}
            </figure>
        )
    }

    if (embedProvider === "pdf") {
        return (
            <div className="space-y-2">
                <object
                    data={src}
                    type="application/pdf"
                    className="h-96 w-full rounded-md border"
                    aria-label={embedTitle || "Embedded PDF"}
                >
                    <a
                        href={src}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 text-sm text-primary underline"
                    >
                        <FileText className="h-4 w-4" />
                        Open PDF
                    </a>
                </object>
                {embedTitle && (
                    <p className="text-xs text-muted-foreground">{embedTitle}</p>
                )}
            </div>
        )
    }

    if (embedProvider === "other") {
        return (
            <a
                href={src}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-primary underline"
            >
                <LinkIcon className="h-4 w-4" />
                {embedTitle || src}
            </a>
        )
    }

    return (
        <div className="space-y-2">
            <div className="aspect-video w-full overflow-hidden rounded-md border">
                <iframe
                    src={src}
                    title={embedTitle || "Embedded media"}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="h-full w-full"
                />
            </div>
            {embedTitle && <p className="text-xs text-muted-foreground">{embedTitle}</p>}
        </div>
    )
}
