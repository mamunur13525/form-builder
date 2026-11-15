import { useState, useEffect } from "react"
import {
    Send,
    Loader2,
    Trash2,
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
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { testIntegration, type TestResult } from "../services/integrationService"
import type { Integration } from "../types"
import { APPS_SCRIPT_TEMPLATE } from "./appsScriptTemplate"
import { IntegrationConfigFields } from "./IntegrationConfigFields"
import { IntegrationTestResult } from "./IntegrationTestResult"
import { IntegrationGuideTab } from "./IntegrationGuideTab"

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
        navigator.clipboard.writeText(APPS_SCRIPT_TEMPLATE)
        setCopiedScript(true)
        setTimeout(() => setCopiedScript(false), 2000)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="editorial max-h-[90vh] overflow-y-auto sm:max-w-2xl bg-[var(--card)] text-[var(--foreground)] border border-[var(--border)] rounded-lg p-6 sm:p-7 shadow-2xl">
                <DialogHeader>
                    <div className="flex items-center justify-between gap-4 pb-2 border-b border-[var(--editorial-border-light)]">
                        <div className="flex items-center gap-3.5">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[var(--primary)] text-[var(--primary-foreground)] shadow-sm">
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
                    <TabsList className="grid w-full grid-cols-2 rounded-lg bg-[var(--editorial-canvas)] border border-[var(--border)] p-1">
                        <TabsTrigger value="setup" className="rounded-lg text-sm font-medium">
                            Configuration
                        </TabsTrigger>
                        <TabsTrigger value="guide" className="rounded-lg text-sm font-medium">
                            Setup Guide & Tips
                        </TabsTrigger>
                    </TabsList>

                    {/* CONFIGURATION TAB */}
                    <TabsContent value="setup" className="space-y-4 pt-4">
                        <IntegrationConfigFields
                            integrationId={integration.id}
                            config={config}
                            formTitle={formTitle}
                            copiedScript={copiedScript}
                            onFieldChange={handleFieldChange}
                            onCopyScript={copyAppsScript}
                        />

                        {/* Test Status Feedback */}
                        {testResult && <IntegrationTestResult testResult={testResult} />}
                    </TabsContent>

                    {/* SETUP GUIDE TAB */}
                    <TabsContent value="guide" className="space-y-4 pt-4 text-xs sm:text-sm text-[var(--editorial-body)]">
                        <IntegrationGuideTab
                            integrationId={integration.id}
                            copiedScript={copiedScript}
                            onCopyScript={copyAppsScript}
                        />
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
