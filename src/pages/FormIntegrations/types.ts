import type { LucideIcon } from "lucide-react"

export type IntegrationCta = "Connect" | "Authorize" | "Add" | "Set up" | "Manage"

export interface Integration {
    id: string
    title: string
    description: string
    category: string
    icon: LucideIcon
    cta: IntegrationCta
    connected?: boolean
    subline?: string
    link?: string
}

export interface GmailIntegrationConfig {
    enabled: boolean
    notificationEmail: string
    sendRespondentThankYou: boolean
    subject: string
    body: string
}

export interface SlackIntegrationConfig {
    enabled: boolean
    webhookUrl: string
    channel: string
}

export interface DiscordIntegrationConfig {
    enabled: boolean
    webhookUrl: string
    botName: string
    avatarUrl?: string
}

export interface TelegramIntegrationConfig {
    enabled: boolean
    botToken: string
    chatId: string
}

export interface GoogleAnalyticsIntegrationConfig {
    enabled: boolean
    measurementId: string
    trackFormViews: boolean
    trackStepChanges: boolean
    trackSubmissions: boolean
}

export interface GoogleSheetsIntegrationConfig {
    enabled: boolean
    syncMethod: "webhook" | "zapier"
    webhookUrl: string
    spreadsheetId?: string
    sheetName?: string
}

export interface NotionIntegrationConfig {
    enabled: boolean
    apiKey: string
    databaseId: string
}

export interface ZapierIntegrationConfig {
    enabled: boolean
    webhookUrl: string
}

export interface GenericWebhookConfig {
    enabled: boolean
    url: string
    secret?: string
}

export interface EmailToMeConfig {
    enabled: boolean
    email: string
}

export interface FormIntegrationsMap {
    "email-to-me"?: EmailToMeConfig
    gmail?: GmailIntegrationConfig
    slack?: SlackIntegrationConfig
    discord?: DiscordIntegrationConfig
    telegram?: TelegramIntegrationConfig
    "google-analytics"?: GoogleAnalyticsIntegrationConfig
    "google-sheets"?: GoogleSheetsIntegrationConfig
    notion?: NotionIntegrationConfig
    zapier?: ZapierIntegrationConfig
    webhook?: GenericWebhookConfig
    [key: string]: any
}
