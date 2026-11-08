import { useState } from "react"
import { useParams } from "react-router-dom"
import { useCurrentUser } from "@/features/auth/hooks/useAuth"
import { useFormContext } from "@/features/forms/hooks/useFormContext"
import { useIntegrationFilter } from "./useIntegrationFilter"
import { ConnectedView } from "./components/ConnectedView"
import { BrowseView } from "./components/BrowseView"
import { IntegrationModal } from "./components/IntegrationModal"
import { useFormIntegrations } from "./hooks/useFormIntegrations"
import type { Integration } from "./types"

type View = "connected" | "browse"

/**
 * Integrations screen. Connect your form to third-party tools (Gmail, Slack,
 * Discord, Telegram, Google Analytics, Google Sheets, Notion, Zapier).
 */
export function FormIntegrationsPage() {
    const { formId } = useParams<{ formId: string }>()
    const { form } = useFormContext()
    const { data: user } = useCurrentUser()
    const [view, setView] = useState<View>("connected")
    const [category, setCategory] = useState("All")
    const [search, setSearch] = useState("")
    const [activeModalIntegration, setActiveModalIntegration] = useState<Integration | null>(null)

    const {
        integrations,
        connectedIntegrations,
        featuredIntegrations,
        saveIntegration,
        disconnectIntegration,
        getConfig,
    } = useFormIntegrations(formId)

    const { groups, counts } = useIntegrationFilter(category, search, integrations)

    const handleAction = (integration: Integration) => {
        setActiveModalIntegration(integration)
    }

    return (
        <div className="editorial h-full w-full overflow-y-auto">
            <div className="mx-auto w-full max-w-[1160px] space-y-8 px-0 py-0 pb-12 sm:px-6 sm:pt-10 sm:pb-16 lg:px-8">
                {view === "connected" ? (
                    <ConnectedView
                        connected={connectedIntegrations}
                        featured={featuredIntegrations}
                        total={integrations.length}
                        email={user?.email}
                        onBrowse={() => setView("browse")}
                        onAction={handleAction}
                    />
                ) : (
                    <BrowseView
                        category={category}
                        onCategoryChange={setCategory}
                        search={search}
                        onSearchChange={setSearch}
                        groups={groups}
                        counts={counts}
                        onBack={() => setView("connected")}
                        onAction={handleAction}
                    />
                )}
            </div>

            <IntegrationModal
                open={Boolean(activeModalIntegration)}
                onOpenChange={(open) => !open && setActiveModalIntegration(null)}
                integration={activeModalIntegration}
                initialConfig={activeModalIntegration ? getConfig(activeModalIntegration.id) : {}}
                onSave={saveIntegration}
                onDisconnect={disconnectIntegration}
                formTitle={form?.title || "My Form"}
                defaultEmail={user?.email}
            />
        </div>
    )
}
