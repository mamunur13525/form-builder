import { useState } from "react"
import { useParams } from "react-router-dom"
import {
    Copy,
    Share2,
    Code,
    Mail,
    ExternalLink,
    QrCode,
    Info,
    Check,
    Download,
    X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Dialog, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { TAB_LIST_CLASS, TAB_TRIGGER_CLASS } from "../FormBuilder/components/settings/primitives"
import { PublishDialog } from "../FormBuilder/components/PublishDialog"
import { useFormContext } from "@/features/forms/hooks/useFormContext"
import { cn } from "@/lib/utils"
import { Alert } from "@/components/ui/alert"

/* -------------------------------------------------------------------------- */
/*  Brand marks — this lucide build ships no social icons, so we inline crisp  */
/*  24px logos that inherit `currentColor` and size to the button's [&_svg].   */
/* -------------------------------------------------------------------------- */

type IconProps = { className?: string }

function XIcon({ className }: IconProps) {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.451-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z" />
        </svg>
    )
}

function FacebookIcon({ className }: IconProps) {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073Z" />
        </svg>
    )
}

function LinkedInIcon({ className }: IconProps) {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286ZM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065Zm1.782 13.019H3.555V9h3.564v11.452ZM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003Z" />
        </svg>
    )
}

function WhatsAppIcon({ className }: IconProps) {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.372-.025-.521-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.71.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
        </svg>
    )
}

export function FormSharePage() {
    const { formId } = useParams<{ formId: string }>()
    const {
        isPublished,
        hasUnpublishedChanges,
        setIsPublished,
        setHasUnpublishedChanges,
        refreshForm,
    } = useFormContext()
    const [showPublishDialog, setShowPublishDialog] = useState(false)

    const handleOpenForm = () => {
        setShowPublishDialog(false)
        window.open(`/form/${formId}`, "_blank", "noopener,noreferrer")
    }
    const formUrl = `${window.location.origin}/form/${formId}`
    const shareText = "Check out this form"

    const [copiedKey, setCopiedKey] = useState<string | null>(null)
    const [qrOpen, setQrOpen] = useState(false)
    const [qrLoaded, setQrLoaded] = useState(false)
    const [downloading, setDownloading] = useState(false)

    const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=512x512&margin=12&format=png&data=${encodeURIComponent(formUrl)}`

    const copy = (key: string, text: string) => {
        navigator.clipboard.writeText(text)
        setCopiedKey(key)
        setTimeout(() => setCopiedKey((k) => (k === key ? null : k)), 2000)
    }

    const openWindow = (url: string) =>
        window.open(url, "_blank", "noopener,noreferrer,width=640,height=680")

    const enc = encodeURIComponent
    const shareTargets = [
        {
            key: "open",
            label: "Open form",
            icon: ExternalLink,
            hover: "hover:border-[var(--editorial-primary-ring)] hover:text-[var(--foreground)]",
            action: () => window.open(formUrl, "_blank", "noopener,noreferrer"),
        },
        {
            key: "x",
            label: "Share on X",
            icon: XIcon,
            hover: "hover:border-[#111]/25 hover:bg-[#111]/5 hover:text-[#111]",
            action: () => openWindow(`https://twitter.com/intent/tweet?url=${enc(formUrl)}&text=${enc(shareText)}`),
        },
        {
            key: "facebook",
            label: "Share on Facebook",
            icon: FacebookIcon,
            hover: "hover:border-[#1877F2]/30 hover:bg-[#1877F2]/8 hover:text-[#1877F2]",
            action: () => openWindow(`https://www.facebook.com/sharer/sharer.php?u=${enc(formUrl)}`),
        },
        {
            key: "linkedin",
            label: "Share on LinkedIn",
            icon: LinkedInIcon,
            hover: "hover:border-[#0A66C2]/30 hover:bg-[#0A66C2]/8 hover:text-[#0A66C2]",
            action: () => openWindow(`https://www.linkedin.com/sharing/share-offsite/?url=${enc(formUrl)}`),
        },
        {
            key: "whatsapp",
            label: "Share on WhatsApp",
            icon: WhatsAppIcon,
            hover: "hover:border-[#25D366]/35 hover:bg-[#25D366]/10 hover:text-[#25D366]",
            action: () => openWindow(`https://wa.me/?text=${enc(`${shareText} ${formUrl}`)}`),
        },
        {
            key: "email",
            label: "Share via email",
            icon: Mail,
            hover: "hover:border-[var(--editorial-primary-ring)] hover:text-[var(--foreground)]",
            action: () => {
                window.location.href = `mailto:?subject=${enc(shareText)}&body=${enc(`${shareText}:\n${formUrl}`)}`
            },
        },
        {
            key: "qr",
            label: "Show QR code",
            icon: QrCode,
            hover: "hover:border-[var(--editorial-purple)]/40 hover:bg-[var(--editorial-purple-light)] hover:text-[var(--editorial-purple)]",
            action: () => {
                setQrLoaded(false)
                setQrOpen(true)
            },
        },
    ]

    const iframeCode = `<iframe src="${formUrl}" width="100%" height="600" style="border:0;border-radius:12px" title="Form"></iframe>`
    const emailCode = `<a href="${formUrl}" style="display:inline-block;padding:12px 20px;background:#111;color:#fff;border-radius:8px;text-decoration:none">Open the form</a>`

    const handleDownloadQr = async () => {
        try {
            setDownloading(true)
            const res = await fetch(qrSrc)
            const blob = await res.blob()
            const url = URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url
            a.download = `form-${formId ?? "share"}-qr.png`
            document.body.appendChild(a)
            a.click()
            a.remove()
            URL.revokeObjectURL(url)
        } catch {
            window.open(qrSrc, "_blank", "noopener,noreferrer")
        } finally {
            setDownloading(false)
        }
    }

    return (
        <div className="editorial mx-auto max-w-[1160px] space-y-5 px-4 pt-6 pb-12 sm:space-y-6 sm:px-6 sm:pt-10 lg:px-8 lg:pb-16">
            {hasUnpublishedChanges && (
                <Alert
                    variant={"destructive"}
                    className="flex flex-col items-start gap-2 rounded-xl sm:flex-row sm:items-center sm:justify-between sm:gap-4"
                >
                    <div className="flex items-center gap-2.5 sm:gap-3">
                        <Info className="h-5 w-5 shrink-0 text-[var(--editorial-purple)]" />
                        <p className="text-sm text-[var(--foreground)] sm:text-base">
                            You have some unpublished changes.
                        </p>
                    </div>
                    <Button
                        variant="link"
                        onClick={() => setShowPublishDialog(true)}
                        className="h-auto shrink-0 p-0 text-sm font-medium text-[var(--editorial-purple)] sm:text-base"
                    >
                        Publish Now →
                    </Button>
                </Alert>
            )}

            <Card className="editorial-shadow-sm rounded-xl border-[var(--border)] bg-[var(--card)]">
                <CardContent className="p-5 sm:p-8">
                    <Tabs defaultValue="share" className="w-full">
                        <TabsList className={cn(TAB_LIST_CLASS, "mb-6 sm:mb-8")}>
                            <TabsTrigger
                                value="share"
                                className={cn(TAB_TRIGGER_CLASS, "gap-1.5 px-1.5 text-xs sm:gap-2 sm:px-3 sm:text-sm")}
                            >
                                <Share2 className="h-4 w-4 shrink-0 sm:h-5 sm:w-5" />
                                <span className="sm:hidden">Link</span>
                                <span className="hidden sm:inline">Share link</span>
                            </TabsTrigger>
                            <TabsTrigger
                                value="website"
                                className={cn(TAB_TRIGGER_CLASS, "gap-1.5 px-1.5 text-xs sm:gap-2 sm:px-3 sm:text-sm")}
                            >
                                <Code className="h-4 w-4 shrink-0 sm:h-5 sm:w-5" />
                                <span className="sm:hidden">Website</span>
                                <span className="hidden sm:inline">Embed in website</span>
                            </TabsTrigger>
                            <TabsTrigger
                                value="email"
                                className={cn(TAB_TRIGGER_CLASS, "gap-1.5 px-1.5 text-xs sm:gap-2 sm:px-3 sm:text-sm")}
                            >
                                <Mail className="h-4 w-4 shrink-0 sm:h-5 sm:w-5" />
                                <span className="sm:hidden">Email</span>
                                <span className="hidden sm:inline">Embed in email</span>
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="share">
                            <div className="mx-auto flex max-w-xl flex-col items-center text-center">
                                <div className="flex w-full flex-col items-stretch gap-2.5 sm:flex-row sm:items-center sm:gap-3">
                                    <Input
                                        value={formUrl}
                                        readOnly
                                        onFocus={(e) => e.currentTarget.select()}
                                        className=" flex-1 rounded-lg border-[var(--input)] bg-[var(--secondary)] px-4 text-center text-sm sm:px-6 sm:text-base"
                                    />
                                    <Button
                                        size="lg"
                                        onClick={() => copy("link", formUrl)}
                                        className="rounded-lg shrink-0 justify-center"
                                    >
                                        {copiedKey === "link" ? <Check className="h-4! w-4!" /> : <Copy className="h-4! w-4!" />}
                                        {copiedKey === "link" ? "Copied" : "Copy Link"}
                                    </Button>
                                </div>
                                <p className="mt-3 text-xs leading-5 text-[var(--editorial-subtle)] sm:text-sm">
                                    Make sure your form is published before you share it to the world.
                                </p>

                                <div className="mt-6 flex w-full items-center gap-4 sm:mt-8">
                                    <span className="h-px flex-1 bg-[var(--editorial-border-light)]" />
                                    <p className="text-xs font-medium text-[var(--editorial-subtle)] sm:text-sm">Share on</p>
                                    <span className="h-px flex-1 bg-[var(--editorial-border-light)]" />
                                </div>

                                <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5 sm:mt-6">
                                    {shareTargets.map(({ key, label, icon: Icon, hover, action }) => (
                                        <Button
                                            key={key}
                                            type="button"
                                            variant="outline"
                                            size="icon-lg"
                                            aria-label={label}
                                            title={label}
                                            onClick={action}
                                            className={cn(
                                                "editorial-transition rounded-xl text-[var(--editorial-body)]",
                                                hover,
                                            )}
                                        >
                                            <Icon className="h-5 w-5" />
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="website">
                            <div className="mx-auto flex max-w-xl flex-col items-center text-center">
                                <p className="text-sm text-[var(--editorial-body)] sm:text-base">
                                    Paste this snippet into your site's HTML to embed the form inline.
                                </p>
                                <pre className="mt-4 w-full overflow-x-auto rounded-lg border border-[var(--input)] bg-[var(--secondary)] px-4 py-3.5 text-left text-xs text-[var(--foreground)] sm:mt-5 sm:px-5 sm:py-4 sm:text-sm">
                                    <code>{iframeCode}</code>
                                </pre>
                                <Button
                                    size="lg"
                                    onClick={() => copy("iframe", iframeCode)}
                                    className="mt-4 w-full justify-center sm:w-auto"
                                >
                                    {copiedKey === "iframe" ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                                    {copiedKey === "iframe" ? "Copied" : "Copy embed code"}
                                </Button>
                            </div>
                        </TabsContent>

                        <TabsContent value="email">
                            <div className="mx-auto flex max-w-xl flex-col items-center text-center">
                                <p className="text-sm text-[var(--editorial-body)] sm:text-base">
                                    Add this button link to an email so recipients can open the form.
                                </p>
                                <pre className="mt-4 w-full overflow-x-auto rounded-lg border border-[var(--input)] bg-[var(--secondary)] px-4 py-3.5 text-left text-xs text-[var(--foreground)] sm:mt-5 sm:px-5 sm:py-4 sm:text-sm">
                                    <code>{emailCode}</code>
                                </pre>
                                <Button
                                size="lg"
                                    onClick={() => copy("email-code", emailCode)}
                                    className="mt-4 w-full justify-center sm:w-auto"
                                >
                                    {copiedKey === "email-code" ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                                    {copiedKey === "email-code" ? "Copied" : "Copy email link"}
                                </Button>
                            </div>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>

            <Card className="editorial-shadow-sm rounded-xl border-[var(--border)] bg-[var(--card)]">
                <CardHeader className="flex flex-col items-start gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:gap-8 sm:p-8">
                    <div>
                        <CardTitle className="font-display text-xl text-[var(--foreground)] sm:text-2xl">
                            Link Settings
                        </CardTitle>
                        <CardDescription className="mt-2 text-sm leading-6 text-[var(--editorial-body)] sm:text-base">
                            Update the form title, share image, and favicon that appear when this link is opened or shared.
                        </CardDescription>
                    </div>
                    <Button size="lg" className="w-full shrink-0 justify-center sm:w-auto">
                        Open Link Settings
                    </Button>
                </CardHeader>
            </Card>

            <Card className="editorial-shadow-sm rounded-xl border-[var(--border)] bg-[var(--card)]">
                <CardHeader className="flex flex-col items-start justify-between p-5 sm:flex-row sm:items-center sm:p-8">
                    <div>
                        <CardTitle className="flex flex-wrap items-center gap-2 font-display text-xl text-[var(--foreground)] sm:gap-3 sm:text-2xl">
                            Custom Domain
                            <Badge className="rounded-full border border-[var(--editorial-purple)]/25 bg-[var(--editorial-purple-light)] px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--editorial-purple)] sm:px-3 sm:py-1 sm:text-[12px]">
                                PRO
                            </Badge>
                        </CardTitle>
                        <CardDescription className="mt-2 text-sm leading-6 text-[var(--editorial-body)] sm:text-base">
                            Please buy a PRO plan to add your own custom domain.
                        </CardDescription>
                    </div>
                </CardHeader>
            </Card>

            <Dialog
                open={qrOpen}
                onOpenChange={setQrOpen}
                className="editorial editorial-shadow-md w-[calc(100%-2rem)] max-w-md rounded-2xl border-[var(--border)] bg-[var(--popover)] p-5 sm:p-8"
            >
                <button
                    type="button"
                    onClick={() => setQrOpen(false)}
                    aria-label="Close"
                    className="editorial-transition absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg text-[var(--editorial-subtle)] hover:bg-[var(--secondary)] hover:text-[var(--foreground)]"
                >
                    <X className="h-5 w-5" />
                </button>

                <DialogHeader className="mb-5 text-center sm:mb-6">
                    <DialogTitle className="font-display text-xl text-[var(--foreground)] sm:text-2xl">
                        Scan to open
                    </DialogTitle>
                    <DialogDescription className="opacity-0 mt-2 text-sm leading-6 text-[var(--editorial-body)] sm:text-base">
                        .
                    </DialogDescription>
                </DialogHeader>

                <div className="mx-auto flex w-fit items-center justify-center rounded-2xl border border-[var(--editorial-border-light)] bg-white p-3 sm:p-4">
                    <div className="relative h-44 w-44 sm:h-56 sm:w-56">
                        {!qrLoaded && (
                            <div className="absolute inset-0 animate-pulse rounded-lg bg-[var(--secondary)]" />
                        )}
                        <img
                            src={qrSrc}
                            alt="QR code for the form link"
                            width={224}
                            height={224}
                            onLoad={() => setQrLoaded(true)}
                            className={cn(
                                "h-44 w-44 transition-opacity duration-200 sm:h-56 sm:w-56",
                                qrLoaded ? "opacity-100" : "opacity-0",
                            )}
                        />
                    </div>
                </div>

                <p className="mt-4 truncate text-center text-xs text-[var(--editorial-subtle)] sm:mt-5 sm:text-sm">{formUrl}</p>

                <div className="mt-5 flex flex-col items-stretch justify-center gap-2.5 sm:mt-6 sm:flex-row sm:items-center sm:gap-3">
                    <Button
                        variant="outline"
                        onClick={() => copy("qr-link", formUrl)}
                        className="justify-center"
                    >
                        {copiedKey === "qr-link" ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                        {copiedKey === "qr-link" ? "Copied" : "Copy link"}
                    </Button>
                    <Button
                        onClick={handleDownloadQr}
                        disabled={downloading}
                        className="justify-center"
                    >
                        <Download className="h-5 w-5" />
                        {downloading ? "Preparing…" : "Download PNG"}
                    </Button>
                </div>
            </Dialog>

            <PublishDialog
                open={showPublishDialog}
                onOpenChange={setShowPublishDialog}
                formId={formId}
                isPublished={isPublished}
                hasUnpublishedChanges={hasUnpublishedChanges}
                onIsPublishedChange={setIsPublished}
                onHasUnpublishedChangesChange={setHasUnpublishedChanges}
                onOpenForm={handleOpenForm}
                onAfterDiscard={refreshForm}
            />
        </div>
    )
}
