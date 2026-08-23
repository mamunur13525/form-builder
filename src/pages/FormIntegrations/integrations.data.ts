import {
    Mail,
    Zap,
    Bot,
    Webhook,
    MessageCircle,
    Send,
    BarChart3,
    Database,
    Table2,
    HardDrive,
    Package,
    Banknote,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

/**
 * The verb shown on an integration's action button. It stays the same through
 * the whole flow (a card that says "Connect" leads to a connect step), so the
 * label is part of the integration's data rather than the view.
 */
export type IntegrationCta = "Connect" | "Authorize" | "Add" | "Set up" | "Manage"

export interface Integration {
    id: string
    title: string
    description: string
    category: string
    icon: LucideIcon
    cta: IntegrationCta
    /** Whether this integration is already live for the current form. */
    connected?: boolean
    /** The URL to the integration's settings page. */
    link?: string
}

/**
 * The integration catalogue. Appearance is intentionally *not* stored here:
 * every tile is rendered with the same neutral, monochrome treatment so the
 * grid reads as one coherent set, and the single connected item is the one
 * thing that stands out. See `IntegrationCard`.
 */
export const INTEGRATIONS: Integration[] = [
    {
        id: "email-to-me",
        title: "Email to me",
        description: "Get a full email for every new submission.",
        category: "Email",
        icon: Mail,
        cta: "Manage",
        link: "/form-settings/${formId}/email-settings",
        connected: true,
    },
    {
        id: "gmail",
        title: "Gmail",
        description: "Forward submissions to a Gmail inbox.",
        category: "Email",
        icon: Mail,
        cta: "Connect",
    },
    {
        id: "zapier",
        title: "Zapier",
        description: "Connect your form to Zapier and send data to 6,000+ apps.",
        category: "Automation",
        icon: Zap,
        cta: "Connect",
    },
    {
        id: "make",
        title: "Make",
        description: "Connect your form to Make.com for automations using webhooks.",
        category: "Automation",
        icon: Bot,
        cta: "Connect",
    },
    {
        id: "webhook",
        title: "Webhook",
        description: "Receive a webhook for all submissions in real time.",
        category: "Automation",
        icon: Webhook,
        cta: "Connect",
    },
    {
        id: "slack",
        title: "Slack",
        description: "Send new submissions to a Slack channel.",
        category: "Automation",
        icon: Send,
        cta: "Connect",
    },
    {
        id: "discord",
        title: "Discord",
        description: "Post new submissions to a Discord channel.",
        category: "Automation",
        icon: MessageCircle,
        cta: "Connect",
    },
    {
        id: "telegram",
        title: "Telegram",
        description: "Send notifications to a Telegram chat.",
        category: "Automation",
        icon: Send,
        cta: "Connect",
    },
    {
        id: "google-analytics",
        title: "Google Analytics",
        description: "Track form views and completions as events.",
        category: "Analytics",
        icon: BarChart3,
        cta: "Authorize",
    },
    {
        id: "plausible",
        title: "Plausible",
        description: "Send goal conversions to Plausible Analytics.",
        category: "Analytics",
        icon: BarChart3,
        cta: "Authorize",
    },
    {
        id: "hubspot",
        title: "HubSpot",
        description: "Push contacts into your HubSpot CRM.",
        category: "CRM",
        icon: Package,
        cta: "Authorize",
    },
    {
        id: "salesforce",
        title: "Salesforce",
        description: "Create or update leads in Salesforce.",
        category: "CRM",
        icon: Database,
        cta: "Authorize",
    },
    {
        id: "airtable",
        title: "Airtable",
        description: "Append submissions to an Airtable base.",
        category: "Storage",
        icon: HardDrive,
        cta: "Connect",
    },
    {
        id: "google-sheets",
        title: "Google Sheets",
        description: "Sync all your submissions to a Google Sheet stored on your Google Drive.",
        category: "Storage",
        icon: Table2,
        cta: "Authorize",
    },
    {
        id: "notion",
        title: "Notion",
        description: "Add submissions to a Notion database.",
        category: "Storage",
        icon: HardDrive,
        cta: "Connect",
    },
    {
        id: "stripe",
        title: "Stripe",
        description: "Create Stripe checkout sessions from form submissions.",
        category: "Payments",
        icon: Banknote,
        cta: "Authorize",
    },
]

/** "All" plus every distinct category, in first-seen order. */
export const CATEGORIES = [
    "All",
    ...Array.from(new Set(INTEGRATIONS.map((i) => i.category))),
]

/** The handful surfaced on the landing view before the full catalogue. */
export const FEATURED_IDS = ["gmail", "zapier", "webhook", "google-sheets", "notion"]
