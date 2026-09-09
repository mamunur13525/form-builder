import { useEffect } from "react"
import { Navigate } from "react-router-dom"
import { ROUTES } from "@/shared/constants/routes"
import {
    type SettingsSection,
    useSettingsModalStore,
} from "@/shared/stores/settingsModalStore"

/** Opens the settings modal on a given tab, then returns to the workspace home. */
export function SettingsDeepLink({ section }: { section: SettingsSection }) {
    const openSettings = useSettingsModalStore((state) => state.openSettings)

    useEffect(() => {
        openSettings(section)
    }, [openSettings, section])

    return <Navigate to={ROUTES.DASHBOARD} replace />
}
