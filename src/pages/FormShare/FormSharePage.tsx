import { useState } from "react"
import { Link, useParams } from "react-router-dom"
import {
    Copy,
    Share2,
    Code,
    Mail,
    Info,
    Check,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { TAB_LIST_CLASS, TAB_TRIGGER_CLASS } from "../FormBuilder/components/settings/primitives"
import { PublishDialog } from "../FormBuilder/components/PublishDialog"
import { useFormContext } from "@/features/forms/hooks/useFormContext"
import { cn } from "@/lib/utils"
import { showWarning } from "@/shared/hooks/useToast"
import { QrCodeDialog } from "./components/QrCodeDialog"
import { ShareTargetsRow } from "./components/ShareTargetsRow"

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

    const copy = (key: string, text: string) => {
        navigator.clipboard.writeText(text)
        setCopiedKey(key)
        setTimeout(() => setCopiedKey((k) => (k === key ? null : k)), 2000)
    }

    const iframeCode = `<iframe src="${formUrl}" width="100%" height="600" style="border:0;border-radius:12px" title="Form"></iframe>`
    const emailCode = `<a href="${formUrl}" style="display:inline-block;padding:12px 20px;background:#111;color:#fff;border-radius:8px;text-decoration:none">Open the form</a>`

    return (
        <div className="editorial mx-auto max-w-[1160px] space-y-5 px-4 pt-6 pb-12 sm:space-y-6 sm:px-6 sm:pt-10 lg:px-8 lg:pb-16">
            {hasUnpublishedChanges && (
                <div className="flex flex-col items-start justify-between gap-3 rounded-lg border border-[#FF5722]/30 bg-[#FF5722]/10 p-4 sm:flex-row sm:items-center sm:gap-4">
                    <div className="flex items-center gap-2.5 sm:gap-3">
                        <Info className="h-5 w-5 shrink-0 text-[#FF5722]" />
                        <p className="text-sm text-slate-800 dark:text-zinc-200 sm:text-base">
                            You have some unpublished changes.
                        </p>
                    </div>
                    <Button
                        variant="link"
                        onClick={() => setShowPublishDialog(true)}
                        className="h-auto shrink-0 p-0 text-sm font-semibold text-[#FF5722] hover:text-[#FF7043] sm:text-base cursor-pointer"
                    >
                        Publish Now →
                    </Button>
                </div>
            )}

            <Card className="editorial-shadow-sm rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#141418]">
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
                                        className="flex-1 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-[#1a1a20] px-4 text-center text-sm sm:px-6 sm:text-base text-slate-800 dark:text-zinc-100"
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
                                <p className="mt-3 text-xs leading-5 text-slate-500 dark:text-zinc-400 sm:text-sm">
                                    Make sure your form is published before you share it to the world.
                                </p>

                                <div className="mt-6 flex w-full items-center gap-4 sm:mt-8">
                                    <span className="h-px flex-1 bg-slate-200 dark:bg-zinc-800" />
                                    <p className="text-xs font-medium text-slate-500 dark:text-zinc-400 sm:text-sm">Share on</p>
                                    <span className="h-px flex-1 bg-slate-200 dark:bg-zinc-800" />
                                </div>

                                <ShareTargetsRow
                                    formUrl={formUrl}
                                    shareText={shareText}
                                    onShowQr={() => setQrOpen(true)}
                                />
                            </div>
                        </TabsContent>

                        <TabsContent value="website">
                            <div className="mx-auto flex max-w-xl flex-col items-center text-center">
                                <p className="text-sm text-slate-700 dark:text-zinc-300 sm:text-base">
                                    Paste this snippet into your site's HTML to embed the form inline.
                                </p>
                                <pre className="mt-4 w-full overflow-x-auto rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-[#1a1a20] px-4 py-3.5 text-left text-xs text-slate-800 dark:text-zinc-100 sm:mt-5 sm:px-5 sm:py-4 sm:text-sm">
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
                                <p className="text-sm text-slate-700 dark:text-zinc-300 sm:text-base">
                                    Add this button link to an email so recipients can open the form.
                                </p>
                                <pre className="mt-4 w-full overflow-x-auto rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-[#1a1a20] px-4 py-3.5 text-left text-xs text-slate-800 dark:text-zinc-100 sm:mt-5 sm:px-5 sm:py-4 sm:text-sm">
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

            <Card className="editorial-shadow-sm rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#141418]">
                <CardHeader className="flex flex-col items-start gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:gap-8 sm:p-8">
                    <div>
                        <CardTitle className="font-display text-xl text-slate-900 dark:text-white sm:text-2xl">
                            Link Settings
                        </CardTitle>
                        <CardDescription className="mt-2 text-sm leading-6 text-slate-600 dark:text-zinc-400 sm:text-base">
                            Update the form title, share image, and favicon that appear when this link is opened or shared.
                        </CardDescription>
                    </div>
                    <Link to={`/form-settings/${formId}/email-settings`} className="w-full sm:w-auto">
                        <Button size="lg" className="w-full shrink-0 justify-center sm:w-auto">
                            Open Link Settings
                        </Button>
                    </Link>
                </CardHeader>
            </Card>

            <Card className="editorial-shadow-sm rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#141418]">
                <CardHeader className="flex flex-col items-start justify-between p-5 sm:flex-row sm:items-center sm:p-8"
                onClick={()=> showWarning("Feature not available yet. Please check back later.")}>
                    <div>
                        <CardTitle className="flex flex-wrap items-center gap-2 font-display text-xl text-slate-900 dark:text-white sm:gap-3 sm:text-2xl">
                            Custom Domain
                            <Badge className="rounded-full border border-[#FF5722]/30 bg-[#FF5722]/15 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#FF5722] sm:px-3 sm:py-1 sm:text-[12px]">
                                PRO
                            </Badge>
                        </CardTitle>
                        <CardDescription className="mt-2 text-sm leading-6 text-slate-600 dark:text-zinc-400 sm:text-base">
                            Please buy a PRO plan to add your own custom domain.
                        </CardDescription>
                    </div>
                </CardHeader>
            </Card>

            <QrCodeDialog
                open={qrOpen}
                onOpenChange={setQrOpen}
                formId={formId}
                formUrl={formUrl}
                copiedKey={copiedKey}
                onCopy={copy}
            />

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
