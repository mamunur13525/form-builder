import { Check, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"

interface IntegrationGuideTabProps {
    integrationId: string
    copiedScript: boolean
    onCopyScript: () => void
}

/** Per-integration setup instructions. */
export function IntegrationGuideTab({
    integrationId,
    copiedScript,
    onCopyScript,
}: IntegrationGuideTabProps) {
    if (integrationId === "discord") {
        return (
            <div className="space-y-3 rounded-lg border border-[var(--border)] bg-[var(--editorial-canvas)] p-4">
                <h4 className="font-semibold text-sm text-[var(--foreground)]">How to create a Discord Webhook:</h4>
                <ol className="list-decimal pl-5 space-y-1.5 leading-relaxed text-[var(--editorial-body)]">
                    <li>Open Discord on your desktop or browser and go to your server.</li>
                    <li>Hover over the channel where you want notifications, click the ⚙️ <strong>Edit Channel</strong> gear icon.</li>
                    <li>Click on <strong>Integrations</strong> on the left, then click <strong>Webhooks</strong>.</li>
                    <li>Click <strong>New Webhook</strong>, customize the name if you like, and click <strong>Copy Webhook URL</strong>.</li>
                    <li>Paste the URL in the Configuration tab and click <strong>Test Connection</strong>!</li>
                </ol>
            </div>
        )
    }

    if (integrationId === "slack") {
        return (
            <div className="space-y-3 rounded-lg border border-[var(--border)] bg-[var(--editorial-canvas)] p-4">
                <h4 className="font-semibold text-sm text-[var(--foreground)]">How to configure Slack Webhooks:</h4>
                <ol className="list-decimal pl-5 space-y-1.5 leading-relaxed text-[var(--editorial-body)]">
                    <li>Go to <strong>api.slack.com/apps</strong> and sign into your Slack account.</li>
                    <li>Create an App or select your workspace's notification app.</li>
                    <li>Under Features, select <strong>Incoming Webhooks</strong> and toggle it <strong>On</strong>.</li>
                    <li>Click <strong>Add New Webhook to Workspace</strong>, choose your target channel, and authorize.</li>
                    <li>Copy the Webhook URL and paste it in the Configuration tab.</li>
                </ol>
            </div>
        )
    }

    if (integrationId === "telegram") {
        return (
            <div className="space-y-3 rounded-lg border border-[var(--border)] bg-[var(--editorial-canvas)] p-4">
                <h4 className="font-semibold text-sm text-[var(--foreground)]">How to create a Telegram Bot:</h4>
                <ol className="list-decimal pl-5 space-y-1.5 leading-relaxed text-[var(--editorial-body)]">
                    <li>Open Telegram, search for <strong>@BotFather</strong>, and send <code>/newbot</code>.</li>
                    <li>Follow the prompts to name your bot. BotFather will provide an HTTP API token (e.g. <code>123456:ABC-DEF...</code>).</li>
                    <li>Start a conversation with your new bot by clicking its link and tapping <strong>Start</strong>.</li>
                    <li>To get your Chat ID, message <strong>@userinfobot</strong> or add the bot to your group and use its ID.</li>
                    <li>Enter your Bot Token and Chat ID in the Configuration tab.</li>
                </ol>
            </div>
        )
    }

    if (integrationId === "google-analytics") {
        return (
            <div className="space-y-3 rounded-lg border border-[var(--border)] bg-[var(--editorial-canvas)] p-4">
                <h4 className="font-semibold text-sm text-[var(--foreground)]">How to find your GA4 Measurement ID:</h4>
                <ol className="list-decimal pl-5 space-y-1.5 leading-relaxed text-[var(--editorial-body)]">
                    <li>Log into your <strong>Google Analytics</strong> dashboard.</li>
                    <li>Click the ⚙️ <strong>Admin</strong> icon in the bottom-left corner.</li>
                    <li>Under Property settings, click <strong>Data Streams</strong> and select <strong>Web</strong>.</li>
                    <li>Copy the <strong>Measurement ID</strong> (formatted like <code>G-XXXXXXXXXX</code>).</li>
                    <li>Paste it in the Configuration tab. Once saved, event tracking triggers automatically when forms are loaded and submitted.</li>
                </ol>
            </div>
        )
    }

    if (integrationId === "google-sheets") {
        return (
            <div className="space-y-3 rounded-lg border border-[var(--border)] bg-[var(--editorial-canvas)] p-4">
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
                    onClick={onCopyScript}
                    className="w-full gap-2 mt-2 text-xs"
                >
                    {copiedScript ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                    {copiedScript ? "Script copied to clipboard!" : "Copy Google Apps Script Template"}
                </Button>
            </div>
        )
    }

    if (integrationId === "notion") {
        return (
            <div className="space-y-3 rounded-lg border border-[var(--border)] bg-[var(--editorial-canvas)] p-4">
                <h4 className="font-semibold text-sm text-[var(--foreground)]">How to connect Notion:</h4>
                <ol className="list-decimal pl-5 space-y-1.5 leading-relaxed text-[var(--editorial-body)]">
                    <li>Go to <strong>notion.so/my-integrations</strong> and click <strong>+ New integration</strong>.</li>
                    <li>Name it (e.g. "Form Submissions"), submit, and copy the <strong>Internal Integration Secret</strong>.</li>
                    <li>Open the Notion database where you want submissions stored.</li>
                    <li>Click the <strong>•••</strong> menu at the top right → <strong>Connections</strong> → Add your integration.</li>
                    <li>Copy the 32-character Database ID from your database URL and paste it into the Configuration tab.</li>
                </ol>
            </div>
        )
    }

    if (integrationId === "zapier") {
        return (
            <div className="space-y-3 rounded-lg border border-[var(--border)] bg-[var(--editorial-canvas)] p-4">
                <h4 className="font-semibold text-sm text-[var(--foreground)]">How to connect Zapier:</h4>
                <ol className="list-decimal pl-5 space-y-1.5 leading-relaxed text-[var(--editorial-body)]">
                    <li>In your Zapier dashboard, click <strong>Create Zap</strong>.</li>
                    <li>Set Trigger App to <strong>Webhooks by Zapier</strong>.</li>
                    <li>Set Event to <strong>Catch Hook</strong> and click Continue.</li>
                    <li>Copy the <strong>Webhook URL</strong> and paste it into the Configuration tab.</li>
                    <li>Click <strong>Test Connection</strong> below to send a sample response so Zapier can detect all form fields!</li>
                </ol>
            </div>
        )
    }

    if (integrationId === "gmail") {
        return (
            <div className="space-y-3 rounded-lg border border-[var(--border)] bg-[var(--editorial-canvas)] p-4">
                <h4 className="font-semibold text-sm text-[var(--foreground)]">Gmail & Email Notifications:</h4>
                <p className="leading-relaxed">
                    When enabled, submissions immediately dispatch formatted HTML notifications directly to your Gmail inbox. You can also turn on "Send Thank-You to Respondent" to automatically send an instant confirmation email back to the respondent who filled out the form.
                </p>
            </div>
        )
    }

    return null
}
