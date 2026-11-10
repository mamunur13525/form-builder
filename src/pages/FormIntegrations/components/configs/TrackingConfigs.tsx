import { Check, Copy, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import type { ConfigFieldsProps, CopyScriptProps } from "./shared"

export function GoogleAnalyticsConfig({ config, onFieldChange }: ConfigFieldsProps) {
    return (
        <div className="space-y-4">
            <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-[var(--foreground)]">
                    GA4 Measurement ID <span className="text-rose-500">*</span>
                </label>
                <Input
                    placeholder="G-XXXXXXXXXX"
                    value={config.measurementId || ""}
                    onChange={(e) => onFieldChange("measurementId", e.target.value.toUpperCase().trim())}
                    className="h-11 rounded-lg bg-[var(--card)] border-[var(--border)] font-mono text-base tracking-wider"
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
                        onCheckedChange={(val) => onFieldChange("trackFormViews", val)}
                    />
                </div>
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-[var(--foreground)]">Track Question Progress</p>
                        <p className="text-xs text-[var(--editorial-subtle)]">Fires `question_view` step events as user advances</p>
                    </div>
                    <Switch
                        checked={config.trackStepChanges ?? true}
                        onCheckedChange={(val) => onFieldChange("trackStepChanges", val)}
                    />
                </div>
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-[var(--foreground)]">Track Conversions / Submissions</p>
                        <p className="text-xs text-[var(--editorial-subtle)]">Fires `form_submit` conversion event on completion</p>
                    </div>
                    <Switch
                        checked={config.trackSubmissions ?? true}
                        onCheckedChange={(val) => onFieldChange("trackSubmissions", val)}
                    />
                </div>
            </div>
        </div>
    )
}

export function GoogleSheetsConfig({
    config,
    onFieldChange,
    copiedScript,
    onCopyScript,
}: ConfigFieldsProps & CopyScriptProps) {
    return (
        <div className="space-y-4">
            <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-[var(--foreground)]">
                    Google Sheets Webhook URL <span className="text-rose-500">*</span>
                </label>
                <Input
                    placeholder="https://script.google.com/macros/s/.../exec"
                    value={config.webhookUrl || ""}
                    onChange={(e) => onFieldChange("webhookUrl", e.target.value)}
                    className="h-11 rounded-lg bg-[var(--card)] border-[var(--border)]"
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
                    onChange={(e) => onFieldChange("sheetName", e.target.value)}
                    className="h-11 rounded-lg bg-[var(--card)] border-[var(--border)]"
                />
            </div>

            <div className="rounded-lg border border-[var(--border)] bg-[var(--editorial-canvas)] p-3.5 flex items-center justify-between">
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
                    onClick={onCopyScript}
                    className="text-xs h-8 gap-1.5 shrink-0"
                >
                    {copiedScript ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                    {copiedScript ? "Copied!" : "Copy Script"}
                </Button>
            </div>
        </div>
    )
}

export function NotionConfig({ config, onFieldChange }: ConfigFieldsProps) {
    return (
        <div className="space-y-4">
            <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-[var(--foreground)]">
                    Notion Internal Integration Token <span className="text-rose-500">*</span>
                </label>
                <Input
                    type="password"
                    placeholder="secret_..."
                    value={config.apiKey || ""}
                    onChange={(e) => onFieldChange("apiKey", e.target.value)}
                    className="h-11 rounded-lg bg-[var(--card)] border-[var(--border)] font-mono text-sm"
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
                    onChange={(e) => onFieldChange("databaseId", e.target.value)}
                    className="h-11 rounded-lg bg-[var(--card)] border-[var(--border)] font-mono text-sm"
                />
                <p className="text-xs text-[var(--editorial-subtle)]">
                    Found in your Notion database link between the workspace name and the question mark.
                </p>
            </div>
        </div>
    )
}

export function GmailConfig({ config, formTitle, onFieldChange }: ConfigFieldsProps) {
    return (
        <div className="space-y-4">
            <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-[var(--foreground)]">
                    Notification Recipient Email <span className="text-rose-500">*</span>
                </label>
                <Input
                    type="email"
                    placeholder="you@gmail.com"
                    value={config.notificationEmail || ""}
                    onChange={(e) => onFieldChange("notificationEmail", e.target.value)}
                    className="h-11 rounded-lg bg-[var(--card)] border-[var(--border)]"
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
                    onCheckedChange={(val) => onFieldChange("sendRespondentThankYou", val)}
                />
            </div>

            <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-[var(--foreground)]">
                    Email Subject
                </label>
                <Input
                    placeholder={`New response for ${formTitle}`}
                    value={config.subject || ""}
                    onChange={(e) => onFieldChange("subject", e.target.value)}
                    className="h-11 rounded-lg bg-[var(--card)] border-[var(--border)]"
                />
            </div>
        </div>
    )
}
