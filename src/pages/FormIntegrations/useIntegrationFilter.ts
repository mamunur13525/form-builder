import { useMemo } from "react"
import {
    CATEGORIES,
    INTEGRATIONS,
    type Integration,
} from "./integrations.data"

export interface IntegrationGroup {
    category: string
    items: Integration[]
}

export interface IntegrationFilter {
    /** Integrations matching the active category + search term, flat. */
    visible: Integration[]
    /** The same set, split into category sections (empty sections dropped). */
    groups: IntegrationGroup[]
    /** How many integrations sit under each category tab (plus "All"). */
    counts: Record<string, number>
}

/**
 * Derives the browse-view lists from the active category and search term. Kept
 * out of the page component so the filtering rules live in one testable place
 * and the view stays declarative.
 */
export function useIntegrationFilter(
    category: string,
    search: string,
): IntegrationFilter {
    const visible = useMemo(() => {
        const term = search.trim().toLowerCase()
        return INTEGRATIONS.filter((integration) => {
            const matchesCategory =
                category === "All" || integration.category === category
            const matchesQuery =
                !term ||
                integration.title.toLowerCase().includes(term) ||
                integration.description.toLowerCase().includes(term)
            return matchesCategory && matchesQuery
        })
    }, [category, search])

    const groups = useMemo<IntegrationGroup[]>(() => {
        const order = CATEGORIES.filter((c) => c !== "All")
        const byCategory: Record<string, Integration[]> = {}
        for (const integration of visible) {
            ;(byCategory[integration.category] ||= []).push(integration)
        }
        return order
            .filter((c) => byCategory[c]?.length)
            .map((c) => ({ category: c, items: byCategory[c] }))
    }, [visible])

    const counts = useMemo(() => {
        const result: Record<string, number> = { All: INTEGRATIONS.length }
        for (const integration of INTEGRATIONS) {
            result[integration.category] =
                (result[integration.category] ?? 0) + 1
        }
        return result
    }, [])

    return { visible, groups, counts }
}
