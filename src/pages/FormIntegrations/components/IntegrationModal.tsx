import { useState, useEffect } from "react"
import {
    CheckCircle2,
    AlertCircle,
    Copy,
    Check,
    Send,
    Loader2,
    Trash2,
    Info,
} from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { testIntegration, type TestResult } from "../services/integrationService"
import type { Integration } from "../types"

interface IntegrationModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    integration: Integration | null
    initialConfig: any
    onSave: (id: string, config: any) => Promise<void>
    onDisconnect: (id: string) => Promise<void>
    formTitle?: string
    defaultEmail?: string
}

export function IntegrationModal({
    open,
    onOpenChange,
    integration,
    initialConfig,
    onSave,
    onDisconnect,
    formTitle = "My Form",
    defaultEmail = "",
}: IntegrationModalProps) {
    const [config, setConfig] = useState<any>({})
    const [isTesting, setIsTesting] = useState(false)
    const [testResult, setTestResult] = useState<TestResult | null>(null)
    const [isSaving, setIsSaving] = useState(false)
    const [activeTab, setActiveTab] = useState<"setup" | "guide">("setup")
    const [copiedScript, setCopiedScript] = useState(false)

    useEffect(() => {
        if (open && integration) {
            setTestResult(null)
            setActiveTab("setup")
            setConfig({
                enabled: true,
                ...initialConfig,
                notificationEmail: initialConfig?.notificationEmail || defaultEmail,
            })
        }
    }, [open, integration, initialConfig, defaultEmail])

    if (!integration) return null

    const Icon = integration.icon
    const isConnected = Boolean(integration.connected)

    const handleFieldChange = (key: string, value: any) => {
        setConfig((prev: any) => ({ ...prev, [key]: value }))
        if (testResult) setTestResult(null)
    }

    const handleTest = async () => {
        setIsTesting(true)
        setTestResult(null)
        try {
            const result = await testIntegration(integration.id, config, formTitle)
            setTestResult(result)
        } catch (err: any) {
            setTestResult({ success: false, message: err.message || "Failed to test integration." })
        } finally {
            setIsTesting(false)
        }
    }

    const handleSave = async () => {
        setIsSaving(true)
        try {
            await onSave(integration.id, config)
            onOpenChange(false)
        } finally {
            setIsSaving(false)
        }
    }

    const handleDisconnect = async () => {
        setIsSaving(true)
        try {
            await onDisconnect(integration.id)
            onOpenChange(false)
        } finally {
            setIsSaving(false)
        }
    }

    const copyAppsScript = () => {
        const script = `function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);
    var answers = data.answers || [];
    
    // Auto-create header row if sheet is empty
    if (sheet.getLastRow() === 0) {
      var headers = ["Submission ID", "Submitted At"];
      for (var i = 0; i < answers.length; i++) {
        headers.push(answers[i].label || answers[i].key);
      }
      sheet.appendRow(headers);
    }
    
    // Append submission row
    var row = [data.submissionId, data.submittedAt];
    for (var j = 0; j < answers.length; j++) {
      row.push(answers[j].value);
    }
    sheet.appendRow(row);
    
    return ContentService.createTextOutput(JSON.stringify({ status: "success" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}`
        navigator.clipboard.writeText(script)
        setCopiedScript(true)
        setTimeout(() => setCopiedScript(false), 2000)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="editorial max-h-[90vh] overflow-y-auto sm:max-w-2xl bg-[var(--card)] text-[var(--foreground)] border border-[var(--border)] rounded-2xl p-6 sm:p-7 shadow-2xl">
                <DialogHeader>
                    <div className="flex items-center justify-between gap-4 pb-2 border-b border-[var(--editorial-border-light)]">
                        <div className="flex items-center gap-3.5">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--primary)] text-[var(--primary-foreground)] shadow-sm">
                                <Icon className="h-5 w-5" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <DialogTitle className="text-xl font-bold font-display text-[var(--foreground)]">
                                        {integration.title}
                                    </DialogTitle>
                                    {isConnected ? (
                                        <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-xs font-semibold px-2 py-0.5">
                                            Connected
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline" className="text-xs text-[var(--editorial-subtle)] border-[var(--border)]">
                                            Not Connected
                                        </Badge>
                                    )}
                                </div>
                                <DialogDescription className="text-xs sm:text-sm text-[var(--editorial-subtle)] mt-0.5">
                                    {integration.description}
                                </DialogDescription>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                            <span className="text-xs font-medium text-[var(--editorial-subtle)] hidden sm:inline">
                                {config.enabled ? "Active" : "Disabled"}
                            </span>
                            <Switch
                                checked={config.enabled ?? true}
                                onCheckedChange={(val) => handleFieldChange("enabled", val)}
                                aria-label="Toggle integration active status"
                            />
                        </div>
                    </div>
                </DialogHeader>

                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full mt-4">
                    <TabsList className="grid w-full grid-cols-2 rounded-xl bg-[var(--editorial-canvas)] border border-[var(--border)] p-1">
                        <TabsTrigger value="setup" className="rounded-lg text-sm font-medium">
                            Configuration
                        </TabsTrigger>
                        <TabsTrigger value="guide" className="rounded-lg text-sm font-medium">
                            Setup Guide & Tips
                        </TabsTrigger>
                    </TabsList>

                    {/* CONFIGURATION TAB */}
                    <TabsContent value="setup" className="space-y-4 pt-4">
                        {/* 1. DISCORD */}
                        {integration.id === "discord" && (
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold uppercase tracking-wider text-[var(--foreground)]">
                                        Discord Webhook URL <span className="text-rose-500">*</span>
                                    </label>
                                    <Input
                                        placeholder="https://discord.com/api/webhooks/..."
                                        value={config.webhookUrl || ""}
                                        onChange={(e) => handleFieldChange("webhookUrl", e.target.value)}
                                        className="h-11 rounded-xl bg-[var(--card)] border-[var(--border)]"
                                    />
                                    <p className="text-xs text-[var(--editorial-subtle)]">
                                        Find this in your Discord channel's <strong>Settings → Integrations → Webhooks</strong>.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold uppercase tracking-wider text-[var(--foreground)]">
                                            Bot Name (Optional)
                                        </label>
                                        <Input
                                            placeholder="Form Submissions"
                                            value={config.botName || ""}
                                            onChange={(e) => handleFieldChange("botName", e.target.value)}
                                            className="h-11 rounded-xl bg-[var(--card)] border-[var(--border)]"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold uppercase tracking-wider text-[var(--foreground)]">
                                            Avatar URL (Optional)
                                        </label>
                                        <Input
                                            placeholder="https://example.com/logo.png"
                                            value={config.avatarUrl || ""}
                                            onChange={(e) => handleFieldChange("avatarUrl", e.target.value)}
                                            className="h-11 rounded-xl bg-[var(--card)] border-[var(--border)]"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 2. SLACK */}
                        {integration.id === "slack" && (
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold uppercase tracking-wider text-[var(--foreground)]">
                                        Slack Incoming Webhook URL <span className="text-rose-500">*</span>
                                    </label>
                                    <Input
                                        placeholder="https://hooks.slack.com/services/T.../B.../..."
                                        value={config.webhookUrl || ""}
                                        onChange={(e) => handleFieldChange("webhookUrl", e.target.value)}
                                        className="h-11 rounded-xl bg-[var(--card)] border-[var(--border)]"
                                    />
                                    <p className="text-xs text-[var(--editorial-subtle)]">
                                        Generate an Incoming Webhook from your Slack Workspace App configuration.
                                    </p>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold uppercase tracking-wider text-[var(--foreground)]">
                                        Channel Name (e.g. #leads or #feedback)
                                    </label>
                                    <Input
                                        placeholder="#general"
                                        value={config.channel || ""}
                                        onChange={(e) => handleFieldChange("channel", e.target.value)}
                                        className="h-11 rounded-xl bg-[var(--card)] border-[var(--border)]"
                                    />
                                </div>
                            </div>
                        )}

                        {/* 3. TELEGRAM */}
                        {integration.id === "telegram" && (
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold uppercase tracking-wider text-[var(--foreground)]">
                                        Telegram Bot Token <span className="text-rose-500">*</span>
                                    </label>
                                    <Input
                                        placeholder="123456789:ABCDefGhIJKlmNoPQRsTUVwxyZ"
                                        value={config.botToken || ""}
                                        onChange={(e) => handleFieldChange("botToken", e.target.value)}
                                        className="h-11 rounded-xl bg-[var(--card)] border-[var(--border)] font-mono text-sm"
                                    />
                                    <p className="text-xs text-[var(--editorial-subtle)]">
                                        Generated by Telegram's official <strong>@BotFather</strong> when creating your bot.
                                    </p>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold uppercase tracking-wider text-[var(--foreground)]">
                                        Chat ID or Channel ID <span className="text-rose-500">*</span>
                                    </label>
                                    <Input
                                        placeholder="e.g. 123456789 or -100123456789"
                                        value={config.chatId || ""}
                                        onChange={(e) => handleFieldChange("chatId", e.target.value)}
                                        className="h-11 rounded-xl bg-[var(--card)] border-[var(--border)] font-mono text-sm"
                                    />
                                    <p className="text-xs text-[var(--editorial-subtle)]">
                                        Your Telegram account or group ID (obtainable by messaging <strong>@userinfobot</strong>).
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* 4. GOOGLE ANALYTICS */}
                        {integration.id === "google-analytics" && (
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold uppercase tracking-wider text-[var(--foreground)]">
                                        GA4 Measurement ID <span className="text-rose-500">*</span>
                                    </label>
                                    <Input
                                        placeholder="G-XXXXXXXXXX"
                                        value={config.measurementId || ""}
                                        onChange={(e) => handleFieldChange("measurementId", e.target.value.toUpperCase().trim())}
                                        className="h-11 rounded-xl bg-[var(--card)] border-[var(--border)] font-mono text-base tracking-wider"
                                    />
                                    <p className="text-xs text-[var(--editorial-subtle)]">
                                        Located in <strong>Google Analytics → Admin → Data Streams → Web Stream Details</strong>.
                                    </p>
                                </div>

                                <div className="space-y-3 pt-2 border-t border-[var(--editorial-border-light)]">
                                    <p className="text-xs font-semibold text-[var(--foreground)]">Tracked Events</p>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-[var(--foreground)]">Track Form Views</p>
                                            <p className="text-xs text-[var(--editorial-subtle)]">Fires `form_view` event when respondent opens form</p>
                                        </div>
                                        <Switch
                                            checked={config.trackFormViews ?? true}
                                            onCheckedChange={(val) => handleFieldChange("trackFormViews", val)}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-[var(--foreground)]">Track Question Progress</p>
                                            <p className="text-xs text-[var(--editorial-subtle)]">Fires `question_view` step events as user advances</p>
                                        </div>
                                        <Switch
                                            checked={config.trackStepChanges ?? true}
                                            onCheckedChange={(val) => handleFieldChange("trackStepChanges", val)}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-[var(--foreground)]">Track Conversions / Submissions</p>
                                            <p className="text-xs text-[var(--editorial-subtle)]">Fires `form_submit` conversion event on completion</p>
                                        </div>
                                        <Switch
                                            checked={config.trackSubmissions ?? true}
                                            onCheckedChange={(val) => handleFieldChange("trackSubmissions", val)}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 5. GOOGLE SHEETS */}
                        {integration.id === "google-sheets" && (
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold uppercase tracking-wider text-[var(--foreground)]">
                                        Google Sheets Webhook URL <span className="text-rose-500">*</span>
                                    </label>
                                    <Input
                                        placeholder="https://script.google.com/macros/s/.../exec"
                                        value={config.webhookUrl || ""}
                                        onChange={(e) => handleFieldChange("webhookUrl", e.target.value)}
                                        className="h-11 rounded-xl bg-[var(--card)] border-[var(--border)]"
                                    />
                                    <p className="text-xs text-[var(--editorial-subtle)]">
                                        Web app URL from your Google Spreadsheet’s Apps Script (see Guide tab).
                                    </p>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold uppercase tracking-wider text-[var(--foreground)]">
                                        Sheet Tab Name (Optional)
                                    </label>
                                    <Input
                                        placeholder="Sheet1"
                                        value={config.sheetName || ""}
                                        onChange={(e) => handleFieldChange("sheetName", e.target.value)}
                                        className="h-11 rounded-xl bg-[var(--card)] border-[var(--border)]"
                                    />
                                </div>

                                <div className="rounded-xl border border-[var(--border)] bg-[var(--editorial-canvas)] p-3.5 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Info className="h-4 w-4 text-[var(--primary)] shrink-0" />
                                        <p className="text-xs text-[var(--editorial-subtle)]">
                                            Need the 1-click Google Apps Script template?
                                        </p>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={copyAppsScript}
                                        className="text-xs h-8 gap-1.5 shrink-0"
                                    >
                                        {copiedScript ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                                        {copiedScript ? "Copied!" : "Copy Script"}
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* 6. NOTION */}
                        {integration.id === "notion" && (
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold uppercase tracking-wider text-[var(--foreground)]">
                                        Notion Internal Integration Token <span className="text-rose-500">*</span>
                                    </label>
                                    <Input
                                        type="password"
                                        placeholder="secret_..."
                                        value={config.apiKey || ""}
                                        onChange={(e) => handleFieldChange("apiKey", e.target.value)}
                                        className="h-11 rounded-xl bg-[var(--card)] border-[var(--border)] font-mono text-sm"
                                    />
                                    <p className="text-xs text-[var(--editorial-subtle)]">
                                        Create one at <strong>notion.so/my-integrations</strong>.
                                    </p>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold uppercase tracking-wider text-[var(--foreground)]">
                                        Notion Database ID <span className="text-rose-500">*</span>
                                    </label>
                                    <Input
                                        placeholder="e.g. 2b9821814e594d50993933c0cf..."
                                        value={config.databaseId || ""}
                                        onChange={(e) => handleFieldChange("databaseId", e.target.value)}
                                        className="h-11 rounded-xl bg-[var(--card)] border-[var(--border)] font-mono text-sm"
                                    />
                                    <p className="text-xs text-[var(--editorial-subtle)]">
                                        Found in your Notion database link between the workspace name and the question mark.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* 7. ZAPIER */}
                        {integration.id === "zapier" && (
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold uppercase tracking-wider text-[var(--foreground)]">
                                        Zapier Catch Hook URL <span className="text-rose-500">*</span>
                                    </label>
                                    <Input
                                        placeholder="https://hooks.zapier.com/hooks/catch/123456/abcdef/"
                                        value={config.webhookUrl || ""}
                                        onChange={(e) => handleFieldChange("webhookUrl", e.target.value)}
                                        className="h-11 rounded-xl bg-[var(--card)] border-[var(--border)]"
                                    />
                                    <p className="text-xs text-[var(--editorial-subtle)]">
                                        In Zapier, choose <strong>Webhooks by Zapier → Catch Hook</strong> to copy your hook URL.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* 8. GMAIL / EMAIL */}
                        {integration.id === "gmail" && (
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold uppercase tracking-wider text-[var(--foreground)]">
                                        Notification Recipient Email <span className="text-rose-500">*</span>
                                    </label>
                                    <Input
                                        type="email"
                                        placeholder="you@gmail.com"
                                        value={config.notificationEmail || ""}
                                        onChange={(e) => handleFieldChange("notificationEmail", e.target.value)}
                                        className="h-11 rounded-xl bg-[var(--card)] border-[var(--border)]"
                                    />
                                    <p className="text-xs text-[var(--editorial-subtle)]">
                                        Every new submission will trigger an email notification to this address.
                                    </p>
                                </div>

                                <div className="flex items-center justify-between pt-2 border-t border-[var(--editorial-border-light)]">
                                    <div>
                                        <p className="text-sm font-medium text-[var(--foreground)]">Send Thank-You to Respondent</p>
                                        <p className="text-xs text-[var(--editorial-subtle)]">Automatically replies to the respondent's entered email</p>
                                    </div>
                                    <Switch
                                        checked={config.sendRespondentThankYou ?? false}
                                        onCheckedChange={(val) => handleFieldChange("sendRespondentThankYou", val)}
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold uppercase tracking-wider text-[var(--foreground)]">
                                        Email Subject
                                    </label>
                                    <Input
                                        placeholder={`New response for ${formTitle}`}
                                        value={config.subject || ""}
                                        onChange={(e) => handleFieldChange("subject", e.target.value)}
                                        className="h-11 rounded-xl bg-[var(--card)] border-[var(--border)]"
                                    />
                                </div>
                            </div>
                        )}

                        {/* 9. GENERIC WEBHOOK */}
                        {integration.id === "webhook" && (
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold uppercase tracking-wider text-[var(--foreground)]">
                                        Webhook Endpoint URL <span className="text-rose-500">*</span>
                                    </label>
                                    <Input
                                        placeholder="https://api.yourdomain.com/webhooks/typeform"
                                        value={config.url || ""}
                                        onChange={(e) => handleFieldChange("url", e.target.value)}
                                        className="h-11 rounded-xl bg-[var(--card)] border-[var(--border)]"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold uppercase tracking-wider text-[var(--foreground)]">
                                        Secret Token (Optional)
                                    </label>
                                    <Input
                                        type="password"
                                        placeholder="Secret passed in X-Webhook-Secret header"
                                        value={config.secret || ""}
                                        onChange={(e) => handleFieldChange("secret", e.target.value)}
                                        className="h-11 rounded-xl bg-[var(--card)] border-[var(--border)]"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Test Status Feedback */}
                        {testResult && (
                            <div
                                className={`flex items-start gap-3 rounded-xl p-3.5 text-xs sm:text-sm border ${
                                    testResult.success
                                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400"
                                        : "bg-rose-500/10 border-rose-500/20 text-rose-700 dark:text-rose-400"
                                }`}
                            >
                                {testResult.success ? (
                                    <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-emerald-500" />
                                ) : (
                                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-500" />
                                )}
                                <div className="flex-1">
                                    <p className="font-semibold">{testResult.success ? "Success" : "Test Failed"}</p>
                                    <p className="mt-0.5 opacity-90">{testResult.message}</p>
                                </div>
                            </div>
                        )}
                    </TabsContent>

                    {/* SETUP GUIDE TAB */}
                    <TabsContent value="guide" className="space-y-4 pt-4 text-xs sm:text-sm text-[var(--editorial-body)]">
                        {integration.id === "discord" && (
                            <div className="space-y-3 rounded-xl border border-[var(--border)] bg-[var(--editorial-canvas)] p-4">
                                <h4 className="font-semibold text-sm text-[var(--foreground)]">How to create a Discord Webhook:</h4>
                                <ol className="list-decimal pl-5 space-y-1.5 leading-relaxed text-[var(--editorial-body)]">
                                    <li>Open Discord on your desktop or browser and go to your server.</li>
                                    <li>Hover over the channel where you want notifications, click the ⚙️ <strong>Edit Channel</strong> gear icon.</li>
                                    <li>Click on <strong>Integrations</strong> on the left, then click <strong>Webhooks</strong>.</li>
                                    <li>Click <strong>New Webhook</strong>, customize the name if you like, and click <strong>Copy Webhook URL</strong>.</li>
                                    <li>Paste the URL in the Configuration tab and click <strong>Test Connection</strong>!</li>
                                </ol>
                            </div>
                        )}

                        {integration.id === "slack" && (
                            <div className="space-y-3 rounded-xl border border-[var(--border)] bg-[var(--editorial-canvas)] p-4">
                                <h4 className="font-semibold text-sm text-[var(--foreground)]">How to configure Slack Webhooks:</h4>
                                <ol className="list-decimal pl-5 space-y-1.5 leading-relaxed text-[var(--editorial-body)]">
                                    <li>Go to <strong>api.slack.com/apps</strong> and sign into your Slack account.</li>
                                    <li>Create an App or select your workspace's notification app.</li>
                                    <li>Under Features, select <strong>Incoming Webhooks</strong> and toggle it <strong>On</strong>.</li>
                                    <li>Click <strong>Add New Webhook to Workspace</strong>, choose your target channel, and authorize.</li>
                                    <li>Copy the Webhook URL and paste it in the Configuration tab.</li>
                                </ol>
                            </div>
                        )}

                        {integration.id === "telegram" && (
                            <div className="space-y-3 rounded-xl border border-[var(--border)] bg-[var(--editorial-canvas)] p-4">
                                <h4 className="font-semibold text-sm text-[var(--foreground)]">How to create a Telegram Bot:</h4>
                                <ol className="list-decimal pl-5 space-y-1.5 leading-relaxed text-[var(--editorial-body)]">
                                    <li>Open Telegram, search for <strong>@BotFather</strong>, and send <code>/newbot</code>.</li>
                                    <li>Follow the prompts to name your bot. BotFather will provide an HTTP API token (e.g. <code>123456:ABC-DEF...</code>).</li>
                                    <li>Start a conversation with your new bot by clicking its link and tapping <strong>Start</strong>.</li>
                                    <li>To get your Chat ID, message <strong>@userinfobot</strong> or add the bot to your group and use its ID.</li>
                                    <li>Enter your Bot Token and Chat ID in the Configuration tab.</li>
                                </ol>
                            </div>
                        )}

                        {integration.id === "google-analytics" && (
                            <div className="space-y-3 rounded-xl border border-[var(--border)] bg-[var(--editorial-canvas)] p-4">
                                <h4 className="font-semibold text-sm text-[var(--foreground)]">How to find your GA4 Measurement ID:</h4>
                                <ol className="list-decimal pl-5 space-y-1.5 leading-relaxed text-[var(--editorial-body)]">
                                    <li>Log into your <strong>Google Analytics</strong> dashboard.</li>
                                    <li>Click the ⚙️ <strong>Admin</strong> icon in the bottom-left corner.</li>
                                    <li>Under Property settings, click <strong>Data Streams</strong> and select <strong>Web</strong>.</li>
                                    <li>Copy the <strong>Measurement ID</strong> (formatted like <code>G-XXXXXXXXXX</code>).</li>
                                    <li>Paste it in the Configuration tab. Once saved, event tracking triggers automatically when forms are loaded and submitted.</li>
                                </ol>
                            </div>
                        )}

                        {integration.id === "google-sheets" && (
                            <div className="space-y-3 rounded-xl border border-[var(--border)] bg-[var(--editorial-canvas)] p-4">
                                <h4 className="font-semibold text-sm text-[var(--foreground)]">How to sync with Google Sheets:</h4>
                                <ol className="list-decimal pl-5 space-y-1.5 leading-relaxed text-[var(--editorial-body)]">
                                    <li>Open a new or existing Google Sheet.</li>
                                    <li>In the top menu, click <strong>Extensions → Apps Script</strong>.</li>
                                    <li>Delete any code in the editor, click the <strong>Copy Script</strong> button below, and paste it into the editor.</li>
                                    <li>Click <strong>Deploy → New deployment</strong>.</li>
                                    <li>Select type: <strong>Web app</strong>. Execute as: <strong>Me</strong>. Who has access: <strong>Anyone</strong>.</li>
                                    <li>Click Deploy, authorize permissions, and copy the <strong>Web App URL</strong> into the Configuration tab.</li>
                                </ol>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={copyAppsScript}
                                    className="w-full gap-2 mt-2 text-xs"
                                >
                                    {copiedScript ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                                    {copiedScript ? "Script copied to clipboard!" : "Copy Google Apps Script Template"}
                                </Button>
                            </div>
                        )}

                        {integration.id === "notion" && (
                            <div className="space-y-3 rounded-xl border border-[var(--border)] bg-[var(--editorial-canvas)] p-4">
                                <h4 className="font-semibold text-sm text-[var(--foreground)]">How to connect Notion:</h4>
                                <ol className="list-decimal pl-5 space-y-1.5 leading-relaxed text-[var(--editorial-body)]">
                                    <li>Go to <strong>notion.so/my-integrations</strong> and click <strong>+ New integration</strong>.</li>
                                    <li>Name it (e.g. "Form Submissions"), submit, and copy the <strong>Internal Integration Secret</strong>.</li>
                                    <li>Open the Notion database where you want submissions stored.</li>
                                    <li>Click the <strong>•••</strong> menu at the top right → <strong>Connections</strong> → Add your integration.</li>
                                    <li>Copy the 32-character Database ID from your database URL and paste it into the Configuration tab.</li>
                                </ol>
                            </div>
                        )}

                        {integration.id === "zapier" && (
                            <div className="space-y-3 rounded-xl border border-[var(--border)] bg-[var(--editorial-canvas)] p-4">
                                <h4 className="font-semibold text-sm text-[var(--foreground)]">How to connect Zapier:</h4>
                                <ol className="list-decimal pl-5 space-y-1.5 leading-relaxed text-[var(--editorial-body)]">
                                    <li>In your Zapier dashboard, click <strong>Create Zap</strong>.</li>
                                    <li>Set Trigger App to <strong>Webhooks by Zapier</strong>.</li>
                                    <li>Set Event to <strong>Catch Hook</strong> and click Continue.</li>
                                    <li>Copy the <strong>Webhook URL</strong> and paste it into the Configuration tab.</li>
                                    <li>Click <strong>Test Connection</strong> below to send a sample response so Zapier can detect all form fields!</li>
                                </ol>
                            </div>
                        )}

                        {integration.id === "gmail" && (
                            <div className="space-y-3 rounded-xl border border-[var(--border)] bg-[var(--editorial-canvas)] p-4">
                                <h4 className="font-semibold text-sm text-[var(--foreground)]">Gmail & Email Notifications:</h4>
                                <p className="leading-relaxed">
                                    When enabled, submissions immediately dispatch formatted HTML notifications directly to your Gmail inbox. You can also turn on "Send Thank-You to Respondent" to automatically send an instant confirmation email back to the respondent who filled out the form.
                                </p>
                            </div>
                        )}
                    </TabsContent>
                </Tabs>

                <DialogFooter className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 mt-6 pt-4 border-t border-[var(--editorial-border-light)]">
                    <div className="flex items-center gap-2">
                        {isConnected && (
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={handleDisconnect}
                                disabled={isSaving || isTesting}
                                className="text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 text-xs sm:text-sm h-10 gap-1.5"
                            >
                                <Trash2 className="h-4 w-4" />
                                Disconnect
                            </Button>
                        )}
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleTest}
                            disabled={isTesting || isSaving}
                            className="text-xs sm:text-sm h-10 gap-1.5"
                        >
                            {isTesting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                            {isTesting ? "Testing..." : "Test Connection"}
                        </Button>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => onOpenChange(false)}
                            className="text-xs sm:text-sm h-10"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            onClick={handleSave}
                            disabled={isSaving || isTesting}
                            className="text-xs sm:text-sm h-10 bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90 font-medium px-5"
                        >
                            {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : null}
                            {isConnected ? "Save Changes" : "Save & Connect"}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
