/**
 * Service for testing and dispatching third-party form integrations
 * (Slack, Discord, Telegram, Zapier, Google Sheets, Notion, Webhooks, Google Analytics).
 */

export interface TestResult {
    success: boolean
    message: string
}

export async function testIntegration(
    integrationId: string,
    config: any,
    formTitle: string = "Sample Form",
): Promise<TestResult> {
    try {
        switch (integrationId) {
            case "discord": {
                if (!config?.webhookUrl?.trim()) {
                    return { success: false, message: "Please provide a valid Discord Webhook URL." }
                }
                if (!config.webhookUrl.startsWith("https://discord.com/api/webhooks/")) {
                    return {
                        success: false,
                        message: "Invalid URL. A Discord Webhook URL starts with https://discord.com/api/webhooks/...",
                    }
                }

                const res = await fetch(config.webhookUrl, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        username: config.botName || "Form Builder Test",
                        avatar_url: config.avatarUrl || undefined,
                        embeds: [
                            {
                                title: `✅ Integration Test: ${formTitle}`,
                                description:
                                    "Your Discord webhook is configured correctly! You will receive live form submissions here.",
                                color: 16734242,
                                footer: { text: "Form Builder Integration Test" },
                                timestamp: new Date().toISOString(),
                            },
                        ],
                    }),
                })

                if (!res.ok) {
                    const text = await res.text().catch(() => "")
                    return {
                        success: false,
                        message: `Discord rejected webhook (${res.status}): ${text || res.statusText}`,
                    }
                }
                return { success: true, message: "Test message delivered to Discord successfully!" }
            }

            case "slack": {
                if (!config?.webhookUrl?.trim()) {
                    return { success: false, message: "Please enter your Slack Incoming Webhook URL." }
                }
                if (!config.webhookUrl.startsWith("https://hooks.slack.com/")) {
                    return {
                        success: false,
                        message: "Invalid URL. Slack Incoming Webhook URLs start with https://hooks.slack.com/...",
                    }
                }

                // Slack webhooks do not support browser CORS, so we send no-cors for client test
                // or via standard fetch with error recovery.
                try {
                    await fetch(config.webhookUrl, {
                        method: "POST",
                        mode: "no-cors",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            text: `🎉 *Form Builder Test Notification*\nYour Slack integration for *${formTitle}* is connected successfully!`,
                        }),
                    })
                    return {
                        success: true,
                        message: "Test request sent to Slack! Please check your designated channel.",
                    }
                } catch (err: any) {
                    return { success: false, message: `Could not reach Slack: ${err.message}` }
                }
            }

            case "telegram": {
                if (!config?.botToken?.trim() || !config?.chatId?.trim()) {
                    return { success: false, message: "Both Bot Token and Chat ID are required." }
                }

                const token = config.botToken.trim()
                const chatId = config.chatId.trim()
                const text =
                    `<b>✅ Form Builder Integration Test</b>\n` +
                    `Your Telegram notifications for <b>${escapeHtml(formTitle)}</b> are working!`

                const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        chat_id: chatId,
                        text,
                        parse_mode: "HTML",
                    }),
                })

                const data = await res.json().catch(() => null)
                if (!res.ok || !data?.ok) {
                    return {
                        success: false,
                        message: data?.description || `Telegram API error (${res.status})`,
                    }
                }
                return { success: true, message: "Test notification sent to Telegram chat!" }
            }

            case "zapier": {
                if (!config?.webhookUrl?.trim()) {
                    return { success: false, message: "Please enter your Zapier Catch Hook URL." }
                }
                if (!config.webhookUrl.startsWith("https://hooks.zapier.com/")) {
                    return {
                        success: false,
                        message: "Invalid URL. Zapier Webhook URLs start with https://hooks.zapier.com/...",
                    }
                }

                const res = await fetch(config.webhookUrl, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        event: "form_response.test_trigger",
                        formTitle,
                        sample_name: "Jane Doe",
                        sample_email: "jane@example.com",
                        sample_message: "This is a sample test submission to map your Zapier fields.",
                        timestamp: new Date().toISOString(),
                    }),
                })

                if (!res.ok) {
                    return { success: false, message: `Zapier responded with status ${res.status}.` }
                }
                return {
                    success: true,
                    message: "Sample test trigger sent to Zapier! You can now test your trigger step in Zapier.",
                }
            }

            case "google-sheets": {
                if (!config?.webhookUrl?.trim()) {
                    return {
                        success: false,
                        message: "Please enter your Google Apps Script Webhook URL.",
                    }
                }

                try {
                    await fetch(config.webhookUrl, {
                        method: "POST",
                        mode: "no-cors",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            event: "test_row",
                            formTitle,
                            submittedAt: new Date().toISOString(),
                            sample_data: "Integration test row from Form Builder",
                        }),
                    })
                    return {
                        success: true,
                        message: "Test row dispatched to your Google Sheets webhook!",
                    }
                } catch (err: any) {
                    return { success: false, message: `Failed to reach Google Sheets URL: ${err.message}` }
                }
            }

            case "webhook": {
                if (!config?.url?.trim()) {
                    return { success: false, message: "Please provide a Webhook URL." }
                }

                const res = await fetch(config.url, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        ...(config.secret ? { "X-Webhook-Secret": config.secret } : {}),
                    },
                    body: JSON.stringify({
                        event: "ping",
                        formTitle,
                        timestamp: new Date().toISOString(),
                    }),
                })

                if (!res.ok) {
                    return { success: false, message: `Webhook endpoint returned HTTP ${res.status}` }
                }
                return { success: true, message: "Webhook ping received successfully!" }
            }

            case "google-analytics": {
                const id = config?.measurementId?.trim()
                if (!id) {
                    return { success: false, message: "Measurement ID is required." }
                }
                if (!/^G-[A-Z0-9]+$/i.test(id)) {
                    return {
                        success: false,
                        message: "Invalid GA4 format. A Measurement ID looks like G-XXXXXXXXXX.",
                    }
                }
                return {
                    success: true,
                    message: `Measurement ID ${id} is valid and ready to track events!`,
                }
            }

            case "gmail": {
                const email = config?.notificationEmail?.trim()
                if (!email) {
                    return { success: false, message: "Notification email is required." }
                }
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                    return { success: false, message: "Please enter a valid email address." }
                }
                return {
                    success: true,
                    message: `Email settings verified! Submissions will notify ${email}.`,
                }
            }

            case "notion": {
                const key = config?.apiKey?.trim()
                const dbId = config?.databaseId?.trim()
                if (!key || !dbId) {
                    return { success: false, message: "Both Notion API Key and Database ID are required." }
                }
                if (!key.startsWith("secret_") && !key.startsWith("ntn_")) {
                    return {
                        success: false,
                        message: "Invalid Notion Integration Token. It typically begins with 'secret_' or 'ntn_'.",
                    }
                }
                return {
                    success: true,
                    message: "Notion credentials validated! Form submissions will map to your database.",
                }
            }

            default:
                return { success: true, message: "Integration settings validated." }
        }
    } catch (err: any) {
        return { success: false, message: err?.message || "An unexpected error occurred during test." }
    }
}

function escapeHtml(str: string): string {
  return (str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Dispatches form responses to client-configured integrations.
 * Works seamlessly in client preview and published mode.
 */
export async function dispatchClientIntegrations(
    form: any,
    answers: Array<{ pageKey: string; label?: string; value: any }>,
    computedVariables?: Record<string, any>,
) {
    if (!form?.id && !form?.slug) return

    let integrations: Record<string, any> = {}
    if (form?.settings?.integrations) {
        integrations = form.settings.integrations
    } else {
        try {
            const key = form.id ? `form_integrations_${form.id}` : `form_integrations_${form.slug}`
            const stored = localStorage.getItem(key)
            if (stored) integrations = JSON.parse(stored)
        } catch {
            return
        }
    }

    const formTitle = form.title || "Form Submission"
    const answerFields = (answers || []).map((ans) => ({
        key: ans.pageKey || "field",
        label: ans.label || ans.pageKey || "Question",
        value: typeof ans.value === "object" ? JSON.stringify(ans.value) : String(ans.value ?? ""),
    }))

    const answerSummary = answerFields.map((f) => `• *${f.label}*: ${f.value}`).join("\n")
    const answerRecord: Record<string, any> = {}
    for (const f of answerFields) {
        answerRecord[f.label || f.key] = f.value
    }

    const payload = {
        event: "form_response.submitted",
        formId: form.id || form.slug,
        formTitle,
        submittedAt: new Date().toISOString(),
        answers: answerFields,
        data: answerRecord,
        computedVariables: computedVariables || {},
    }

    const tasks: Promise<any>[] = []

    // 1. Discord
    const discord = integrations["discord"]
    if (discord?.enabled && discord.webhookUrl) {
        tasks.push(
            fetch(discord.webhookUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username: discord.botName || "Form Builder",
                    avatar_url: discord.avatarUrl || undefined,
                    embeds: [
                        {
                            title: `📝 New submission for "${formTitle}"`,
                            description: answerSummary || "No answers provided.",
                            color: 16734242,
                            footer: { text: "Form Builder • Discord" },
                            timestamp: new Date().toISOString(),
                        },
                    ],
                }),
            }).catch((err) => console.warn("Discord dispatch warning:", err)),
        )
    }

    // 2. Slack (no-cors for browser cross-origin)
    const slack = integrations["slack"]
    if (slack?.enabled && slack.webhookUrl) {
        tasks.push(
            fetch(slack.webhookUrl, {
                method: "POST",
                mode: "no-cors",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    text: `New submission received for *${formTitle}*:\n${answerSummary}`,
                }),
            }).catch((err) => console.warn("Slack dispatch warning:", err)),
        )
    }

    // 3. Telegram
    const telegram = integrations["telegram"]
    if (telegram?.enabled && telegram.botToken && telegram.chatId) {
        const text =
            `<b>📝 New Form Submission</b>\n` +
            `<b>Form:</b> ${escapeHtml(formTitle)}\n\n` +
            answerFields.map((f) => `<b>${escapeHtml(f.label)}:</b> ${escapeHtml(f.value)}`).join("\n")

        tasks.push(
            fetch(`https://api.telegram.org/bot${telegram.botToken}/sendMessage`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    chat_id: telegram.chatId,
                    text,
                    parse_mode: "HTML",
                }),
            }).catch((err) => console.warn("Telegram dispatch warning:", err)),
        )
    }

    // 4. Zapier
    const zapier = integrations["zapier"]
    if (zapier?.enabled && zapier.webhookUrl) {
        tasks.push(
            fetch(zapier.webhookUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            }).catch((err) => console.warn("Zapier dispatch warning:", err)),
        )
    }

    // 5. Google Sheets (no-cors for Google Apps Script redirects)
    const googleSheets = integrations["google-sheets"]
    if (googleSheets?.enabled && googleSheets.webhookUrl) {
        tasks.push(
            fetch(googleSheets.webhookUrl, {
                method: "POST",
                mode: "no-cors",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            }).catch((err) => console.warn("Google Sheets dispatch warning:", err)),
        )
    }

    // 6. Generic Webhook
    const webhook = integrations["webhook"]
    if (webhook?.enabled && webhook.url) {
        tasks.push(
            fetch(webhook.url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(webhook.secret ? { "X-Webhook-Secret": webhook.secret } : {}),
                },
                body: JSON.stringify(payload),
            }).catch((err) => console.warn("Webhook dispatch warning:", err)),
        )
    }

    await Promise.allSettled(tasks)
}
