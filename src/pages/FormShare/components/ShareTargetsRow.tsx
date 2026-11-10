import { ExternalLink, Mail, QrCode } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { FacebookIcon, LinkedInIcon, WhatsAppIcon, XIcon } from "./SocialIcons"

interface ShareTargetsRowProps {
    formUrl: string
    shareText: string
    onShowQr: () => void
}

export function ShareTargetsRow({
    formUrl,
    shareText,
    onShowQr,
}: ShareTargetsRowProps) {
    const enc = encodeURIComponent
    const openWindow = (url: string) =>
        window.open(url, "_blank", "noopener,noreferrer,width=640,height=680")

    const shareTargets = [
        {
            key: "open",
            label: "Open form",
            icon: ExternalLink,
            hover: "hover:border-[#FF5722]/60 hover:text-[#FF5722] hover:bg-[#FF5722]/5",
            action: () => window.open(formUrl, "_blank", "noopener,noreferrer"),
        },
        {
            key: "x",
            label: "Share on X",
            icon: XIcon,
            hover: "hover:border-slate-400 dark:hover:border-zinc-500 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-white",
            action: () => openWindow(`https://twitter.com/intent/tweet?url=${enc(formUrl)}&text=${enc(shareText)}`),
        },
        {
            key: "facebook",
            label: "Share on Facebook",
            icon: FacebookIcon,
            hover: "hover:border-[#1877F2]/60 hover:bg-[#1877F2]/10 hover:text-[#1877F2]!",
            action: () => openWindow(`https://www.facebook.com/sharer/sharer.php?u=${enc(formUrl)}`),
        },
        {
            key: "linkedin",
            label: "Share on LinkedIn",
            icon: LinkedInIcon,
            hover: "hover:border-[#0A66C2]/60 hover:bg-[#0A66C2]/10 hover:text-[#0A66C2]!",
            action: () => openWindow(`https://www.linkedin.com/sharing/share-offsite/?url=${enc(formUrl)}`),
        },
        {
            key: "whatsapp",
            label: "Share on WhatsApp",
            icon: WhatsAppIcon,
            hover: "hover:border-[#25D366]/60 hover:bg-[#25D366]/10 hover:text-[#25D366]!",
            action: () => openWindow(`https://wa.me/?text=${enc(`${shareText} ${formUrl}`)}`),
        },
        {
            key: "email",
            label: "Share via email",
            icon: Mail,
            hover: "hover:border-[#FF5722]/60 hover:bg-[#FF5722]/10 hover:text-[#FF5722]",
            action: () => {
                window.location.assign(`mailto:?subject=${enc(shareText)}&body=${enc(`${shareText}:\n${formUrl}`)}`)
            },
        },
        {
            key: "qr",
            label: "Show QR code",
            icon: QrCode,
            hover: "hover:border-[#FF5722]/60 hover:bg-[#FF5722]/10 hover:text-[#FF5722]",
            action: onShowQr,
        },
    ]

    return (
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
                        "editorial-transition rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#18181c] text-slate-700 dark:text-zinc-300 shadow-xs",
                        hover,
                    )}
                >
                    <Icon className="h-5 w-5" />
                </Button>
            ))}
        </div>
    )
}
