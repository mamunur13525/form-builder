import { useMemo, useState } from "react"
import { useCurrentUser } from "@/features/auth/hooks/useAuth"
import { FEATURED_IDS, INTEGRATIONS, type Integration } from "./integrations.data"
import { useIntegrationFilter } from "./useIntegrationFilter"
import { ConnectedView } from "./components/ConnectedView"
import { BrowseView } from "./components/BrowseView"

type View = "connected" | "browse"

/**
 * Integrations screen. This shell owns only the routing-level state — which
 * view is showing and the browse filters — and composes the presentational
 * pieces. Catalogue data lives in `integrations.data`, filtering in
 * `useIntegrationFilter`, and each view renders itself.
 */
export function FormIntegrationsPage() {
    const { data: user } = useCurrentUser()
    const [view, setView] = useState<View>("connected")
    const [category, setCategory] = useState("All")
    const [search, setSearch] = useState("")

    const { groups, counts } = useIntegrationFilter(category, search)

    const connected = useMemo(
        () => INTEGRATIONS.filter((integration) => integration.connected),
        [],
    )
    const featured = useMemo(
        () => INTEGRATIONS.filter((integration) => FEATURED_IDS.includes(integration.id)),
        [],
    )

    // Placeholder until connect flows are wired up.
    const handleAction = (_integration: Integration) => { }

    return (
        <div className="editorial mx-auto w-full max-w-[1160px] space-y-8 px-0 py-0 sm:px-6 sm:pt-10 lg:px-8">
            {view === "connected" ? (
                <>
                    <ConnectedView
                        connected={connected}
                        featured={featured}
                        total={INTEGRATIONS.length}
                        email={user?.email}
                        onBrowse={() => setView("browse")}
                        onAction={handleAction}
                    />
                </>
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
    )
}
