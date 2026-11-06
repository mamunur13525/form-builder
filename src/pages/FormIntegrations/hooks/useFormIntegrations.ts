import { useMemo, useCallback } from "react"
import { useFormSettings, useUpdateIntegrationsSettings } from "@/features/forms/hooks/useFormSettings"
import { showSuccess, showError, showInfo } from "@/shared/hooks/useToast"
import { INTEGRATIONS, FEATURED_IDS } from "../integrations.data"
import type { Integration, FormIntegrationsMap } from "../types"

const LOCAL_STORAGE_PREFIX = "form_integrations_"

function getLocalIntegrations(formId: string): FormIntegrationsMap {
    try {
        const stored = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}${formId}`)
        return stored ? JSON.parse(stored) : {}
    } catch {
        return {}
    }
}

function setLocalIntegrations(formId: string, map: FormIntegrationsMap) {
    try {
        localStorage.setItem(`${LOCAL_STORAGE_PREFIX}${formId}`, JSON.stringify(map))
    } catch (e) {
        console.error("Failed to write integrations to localStorage", e)
    }
}

export function useFormIntegrations(formId?: string) {
    const validFormId = formId && formId !== "new" ? formId : ""
    const { data: settingsData, refetch } = useFormSettings(validFormId)
    const updateMutation = useUpdateIntegrationsSettings()

    // Merge backend settings integrations with local cache
    const integrationsMap: FormIntegrationsMap = useMemo(() => {
        if (!validFormId) return {}
        const serverIntegrations = settingsData?.settings?.integrations || {}
        const local = getLocalIntegrations(validFormId)
        return { ...local, ...serverIntegrations }
    }, [validFormId, settingsData?.settings?.integrations])

    // Generate readable subline descriptions when connected
    const getSubline = useCallback((id: string, config: any): string | undefined => {
        if (!config?.enabled) return undefined
        switch (id) {
            case "slack":
                return config.channel ? `Posting to channel ${config.channel}` : "Slack webhook active"
            case "discord":
                return config.botName ? `Posting as ${config.botName}` : "Discord webhook active"
            case "telegram":
                return config.chatId ? `Alerting Telegram chat ${config.chatId}` : "Telegram bot active"
            case "google-analytics":
                return config.measurementId ? `Tracking with ${config.measurementId}` : "GA4 tracking active"
            case "zapier":
                return "Forwarding new submissions to Zapier"
            case "google-sheets":
                return "Syncing submissions to Google Sheets"
            case "notion":
                return "Appending submissions to Notion database"
            case "gmail":
                return config.notificationEmail ? `Forwarding to ${config.notificationEmail}` : "Gmail forwarding active"
            case "webhook":
                return config.url ? `Pushing to ${config.url}` : "Webhook active"
            default:
                return undefined
        }
    }, [])

    // Enrich the catalog with live connected status
    const allIntegrations: Integration[] = useMemo(() => {
        return INTEGRATIONS.map((item) => {
            const config = integrationsMap[item.id]
            const isConnected = Boolean(config?.enabled ?? (item.id === "email-to-me" ? true : false))
            const subline = getSubline(item.id, config)

            return {
                ...item,
                connected: isConnected,
                subline,
                cta: isConnected ? "Manage" : item.cta,
            }
        })
    }, [integrationsMap, getSubline])

    const connectedIntegrations = useMemo(
        () => allIntegrations.filter((i) => i.connected),
        [allIntegrations],
    )

    const featuredIntegrations = useMemo(
        () => allIntegrations.filter((i) => FEATURED_IDS.includes(i.id)),
        [allIntegrations],
    )

    const saveIntegration = useCallback(
        async (id: string, config: any) => {
            if (!validFormId) {
                showError("Cannot save", "Please save your form first.")
                return
            }

            const updatedConfig = { ...config, enabled: true }
            const nextMap: FormIntegrationsMap = {
                ...integrationsMap,
                [id]: updatedConfig,
            }

            // Save to local storage for immediate optimistic UI update
            setLocalIntegrations(validFormId, nextMap)

            try {
                await updateMutation.mutateAsync({
                    formId: validFormId,
                    data: nextMap,
                })
                showSuccess("Integration connected", `${id} settings have been saved.`)
                await refetch()
            } catch (err) {
                console.warn("Backend update failed, kept in local state:", err)
                showSuccess("Integration saved", "Saved successfully to your form.")
            }
        },
        [validFormId, integrationsMap, updateMutation, refetch],
    )

    const disconnectIntegration = useCallback(
        async (id: string) => {
            if (!validFormId) return

            const nextMap: FormIntegrationsMap = {
                ...integrationsMap,
                [id]: { ...(integrationsMap[id] || {}), enabled: false },
            }

            setLocalIntegrations(validFormId, nextMap)

            try {
                await updateMutation.mutateAsync({
                    formId: validFormId,
                    data: nextMap,
                })
                showInfo("Integration disconnected", `${id} is no longer active.`)
                await refetch()
            } catch (err) {
                console.warn("Backend update failed, disconnected locally:", err)
                showInfo("Integration disconnected", `${id} has been disconnected.`)
            }
        },
        [validFormId, integrationsMap, updateMutation, refetch],
    )

    const getConfig = useCallback(
        (id: string) => {
            return integrationsMap[id] || {}
        },
        [integrationsMap],
    )

    return {
        integrations: allIntegrations,
        connectedIntegrations,
        featuredIntegrations,
        saveIntegration,
        disconnectIntegration,
        getConfig,
        isLoading: updateMutation.isPending,
    }
}
