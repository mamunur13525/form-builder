import {
    DiscordConfig,
    SlackConfig,
    TelegramConfig,
    ZapierConfig,
    WebhookConfig,
} from "./configs/MessagingConfigs"
import {
    GmailConfig,
    GoogleAnalyticsConfig,
    GoogleSheetsConfig,
    NotionConfig,
} from "./configs/TrackingConfigs"

interface IntegrationConfigFieldsProps {
    integrationId: string
    config: any
    formTitle: string
    copiedScript: boolean
    onFieldChange: (key: string, value: any) => void
    onCopyScript: () => void
}

/** The configuration form for whichever integration is open. */
export function IntegrationConfigFields({
    integrationId,
    config,
    formTitle,
    copiedScript,
    onFieldChange,
    onCopyScript,
}: IntegrationConfigFieldsProps) {
    switch (integrationId) {
        case "discord":
            return <DiscordConfig config={config} formTitle={formTitle} onFieldChange={onFieldChange} />
        case "slack":
            return <SlackConfig config={config} formTitle={formTitle} onFieldChange={onFieldChange} />
        case "telegram":
            return <TelegramConfig config={config} formTitle={formTitle} onFieldChange={onFieldChange} />
        case "google-analytics":
            return <GoogleAnalyticsConfig config={config} formTitle={formTitle} onFieldChange={onFieldChange} />
        case "google-sheets":
            return (
                <GoogleSheetsConfig
                    config={config}
                    formTitle={formTitle}
                    onFieldChange={onFieldChange}
                    copiedScript={copiedScript}
                    onCopyScript={onCopyScript}
                />
            )
        case "notion":
            return <NotionConfig config={config} formTitle={formTitle} onFieldChange={onFieldChange} />
        case "zapier":
            return <ZapierConfig config={config} formTitle={formTitle} onFieldChange={onFieldChange} />
        case "gmail":
            return <GmailConfig config={config} formTitle={formTitle} onFieldChange={onFieldChange} />
        case "webhook":
            return <WebhookConfig config={config} formTitle={formTitle} onFieldChange={onFieldChange} />
        default:
            return null
    }
}
