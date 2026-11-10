import { useState } from "react"
import { Check, Copy, Download, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

interface QrCodeDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    formId?: string
    formUrl: string
    copiedKey: string | null
    onCopy: (key: string, text: string) => void
}

export function QrCodeDialog({
    open,
    onOpenChange,
    formId,
    formUrl,
    copiedKey,
    onCopy,
}: QrCodeDialogProps) {
    const [qrLoaded, setQrLoaded] = useState(false)
    const [downloading, setDownloading] = useState(false)

    const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=512x512&margin=12&format=png&data=${encodeURIComponent(formUrl)}`

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
        <Dialog
            open={open}
            onOpenChange={onOpenChange}
            className="editorial editorial-shadow-md w-[calc(100%-2rem)] max-w-md rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#141418] p-5 sm:p-8 text-slate-900 dark:text-zinc-100"
        >
            <button
                type="button"
                onClick={() => onOpenChange(false)}
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

            <div className="mx-auto flex w-fit items-center justify-center rounded-lg border border-[var(--editorial-border-light)] bg-white p-3 sm:p-4">
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

            <p className="mt-4 truncate text-center text-xs text-[var(--editorial-subtle)] sm:mt-5 sm:text-sm">
                {formUrl}
            </p>

            <div className="mt-5 flex flex-col items-stretch justify-center gap-2.5 sm:mt-6 sm:flex-row sm:items-center sm:gap-3">
                <Button
                    variant="outline"
                    onClick={() => onCopy("qr-link", formUrl)}
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
    )
}
