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
    TestTube,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { TAB_LIST_CLASS, TAB_TRIGGER_CLASS } from "../FormBuilder/components/settings/primitives"
import { cn } from "@/lib/utils"

export function FormSharePage() {
    const { formId } = useParams<{ formId: string }>()
    const formUrl = `${window.location.origin}/form/${formId}`
    const [copied, setCopied] = useState(false)

    const handleCopy = () => {
        navigator.clipboard.writeText(formUrl)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="editorial mx-auto max-w-4xl space-y-6 px-8 pt-12 pb-16">
            <div className="flex items-center justify-between gap-4 rounded-[18px] border border-[var(--editorial-purple)]/25 bg-[var(--editorial-purple-light)] px-6 py-4">
                <div className="flex items-center gap-3">
                    <Info className="h-5 w-5 text-[var(--editorial-purple)]" />
                    <p className="text-base text-[var(--foreground)]">
                        You have some unpublished changes.
                    </p>
                </div>
                <Button
                    variant="link"
                    className="h-auto p-0 text-base font-medium text-[var(--editorial-purple)]"
                >
                    Publish Now →
                </Button>
            </div>

            <Card className="editorial-shadow-sm rounded-xl border-[var(--border)] bg-[var(--card)]">
                <CardContent className="p-8">
                    <Tabs defaultValue="share" className="w-full">
                        <TabsList className={cn(TAB_LIST_CLASS, 'mb-5')}>
                            <TabsTrigger
                                value="share"
                                className={TAB_TRIGGER_CLASS}
                            >
                                <Share2 className="h-5 w-5" /> Share link
                            </TabsTrigger>
                            <TabsTrigger
                                value="website"
                                className={TAB_TRIGGER_CLASS}

                            >
                                <Code className="h-5 w-5" /> Embed in website
                            </TabsTrigger>
                            <TabsTrigger
                                value="email"
                                className={TAB_TRIGGER_CLASS}
                            >
                                <Mail className="h-5 w-5" /> Embed in email
                            </TabsTrigger>
                        </TabsList>
                        <TabsContent value="share">
                            <div className="flex items-center gap-3">
                                <Input
                                    value={formUrl}
                                    readOnly
                                    className="h-[52px] rounded-lg border-[var(--input)] bg-[var(--secondary)] px-6 text-base"
                                />
                                <Button
                                    onClick={handleCopy}
                                    className="editorial-transition h-[52px] w-36 gap-2 rounded-[16px] bg-[var(--primary)] text-sm font-medium text-white  hover:-translate-y-0.5 hover:bg-[var(--editorial-primary-hover)] active:translate-y-0 active:scale-[.98] active:bg-[var(--editorial-primary-pressed)]"
                                >
                                    {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                                    {copied ? "Copied" : "Copy Link"}
                                </Button>
                            </div>
                            <p className="mt-3 text-sm leading-5 text-[var(--editorial-subtle)]">
                                Make sure your form is published before you share it to the world.
                            </p>
                            <div className="mt-8 flex items-center gap-4">
                                <p className="text-base text-[var(--editorial-body)]">Share on:</p>
                                <div className="flex gap-2">
                                    {[ExternalLink, TestTube, TestTube, TestTube, QrCode].map(
                                        (Icon, index) => (
                                            <Button
                                                key={index}
                                                variant="outline"
                                                size="icon"
                                                className="editorial-transition h-11 w-11 rounded-full border-[var(--border)] bg-[var(--secondary)] text-[var(--editorial-body)] hover:-translate-y-0.5 hover:border-[var(--editorial-primary-ring)] hover:bg-[var(--editorial-primary-light)] hover:text-[var(--primary)] active:translate-y-0 active:scale-[.98]"
                                            >
                                                <Icon className="h-5 w-5" />
                                            </Button>
                                        ),
                                    )}
                                </div>
                            </div>
                        </TabsContent>
                        <TabsContent value={'website'}>
                            No Data website
                        </TabsContent>
                        <TabsContent value="email">
                            No Data Email
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>

            <Card className="editorial-shadow-sm rounded-xl border-[var(--border)] bg-[var(--card)]">
                <CardHeader className="flex flex-row items-center justify-between gap-8 p-8">
                    <div>
                        <CardTitle className="font-display text-2xl text-[var(--foreground)]">
                            Link Settings
                        </CardTitle>
                        <CardDescription className="mt-2 text-base leading-6 text-[var(--editorial-body)]">
                            Update the form title, share image, and favicon that appear when this link is opened or shared.
                        </CardDescription>
                    </div>
                    <Button className="editorial-transition h-[52px] shrink-0 rounded-[16px] bg-[var(--primary)] px-6 text-sm font-medium text-white  hover:-translate-y-0.5 hover:bg-[var(--editorial-primary-hover)] active:translate-y-0 active:scale-[.98] active:bg-[var(--editorial-primary-pressed)]">
                        Open Link Settings
                    </Button>
                </CardHeader>
            </Card>

            <Card className="editorial-shadow-sm rounded-xl border-[var(--border)] bg-[var(--card)]">
                <CardHeader className="flex flex-row items-center justify-between p-8">
                    <div>
                        <CardTitle className="flex items-center gap-3 font-display text-2xl text-[var(--foreground)]">
                            Custom Domain
                            <Badge className="rounded-full border border-[var(--editorial-purple)]/25 bg-[var(--editorial-purple-light)] px-3 py-1 text-[12px] font-semibold uppercase tracking-[0.08em] text-[var(--editorial-purple)]">
                                PRO
                            </Badge>
                        </CardTitle>
                        <CardDescription className="mt-2 text-base leading-6 text-[var(--editorial-body)]">
                            Please buy a PRO plan to add your own custom domain.
                        </CardDescription>
                    </div>
                </CardHeader>
            </Card>
        </div>
    )
}