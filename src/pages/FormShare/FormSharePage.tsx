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
        <div className="max-w-4xl mx-auto p-6 space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50 border border-blue-200">
                <div className="flex items-center gap-2">
                    <Info className="h-4 w-4 text-blue-600" />
                    <p className="text-sm text-blue-800 font-medium">You have some unpublished changes.</p>
                </div>
                <Button variant="link" className="text-sm font-semibold text-blue-600 h-auto p-0">
                    Publish Now →
                </Button>
            </div>

            <Card>
                <CardContent className="p-4">
                    <Tabs defaultValue="share" className="w-full">
                        <TabsList className="grid w-full grid-cols-3 mb-4">
                            <TabsTrigger value="share" className="text-xs">
                                <Share2 className="mr-1.5 h-3.5 w-3.5" /> Share link
                            </TabsTrigger>
                            <TabsTrigger value="website" className="text-xs">
                                <Code className="mr-1.5 h-3.5 w-3.5" /> Embed in website
                            </TabsTrigger>
                            <TabsTrigger value="email" className="text-xs">
                                <Mail className="mr-1.5 h-3.5 w-3.5" /> Embed in email
                            </TabsTrigger>
                        </TabsList>
                        <TabsContent value="share">
                            <div className="flex items-center space-x-2">
                                <Input value={formUrl} readOnly className="h-9 text-sm" />
                                <Button onClick={handleCopy} className="w-28 h-9 text-xs">
                                    {copied ? <Check className="mr-1.5 h-3.5 w-3.5" /> : <Copy className="mr-1.5 h-3.5 w-3.5" />}
                                    {copied ? "Copied" : "Copy Link"}
                                </Button>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1.5">
                                Make sure your form is published before you share it to the world.
                            </p>
                            <div className="flex items-center gap-3 mt-4">
                                <p className="text-xs font-medium">Share on:</p>
                                <div className="flex gap-1.5">
                                    <Button variant="outline" size="icon" className="h-8 w-8">
                                        <ExternalLink className="h-4 w-4" />
                                    </Button>
                                    <Button variant="outline" size="icon" className="h-8 w-8">
                                        <TestTube className="h-4 w-4" />
                                    </Button>
                                    <Button variant="outline" size="icon" className="h-8 w-8">
                                        <TestTube className="h-4 w-4" />
                                    </Button>
                                    <Button variant="outline" size="icon" className="h-8 w-8">
                                        <TestTube className="h-4 w-4" />
                                    </Button>
                                    <Button variant="outline" size="icon" className="h-8 w-8">
                                        <QrCode className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between p-4">
                    <div>
                        <CardTitle className="text-base">Link Settings</CardTitle>
                        <CardDescription className="text-xs">
                            Update the form title, share image, and favicon that appear when this link is opened or shared.
                        </CardDescription>
                    </div>
                    <Button size="sm" className="h-8 text-xs">Open Link Settings</Button>
                </CardHeader>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between p-4">
                    <div>
                        <CardTitle className="text-base flex items-center gap-2">
                            Custom Domain <Badge className="bg-pink-600 text-white text-xs">PRO</Badge>
                        </CardTitle>
                        <CardDescription className="text-xs">Please buy a PRO plan to add your own custom domain.</CardDescription>
                    </div>
                </CardHeader>
            </Card>
        </div>
    )
}
