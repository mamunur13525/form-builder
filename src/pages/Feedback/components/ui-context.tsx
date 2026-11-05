import { useState, type ReactNode } from "react"

import { SubmitPostModal } from "./SubmitPostModal"
import { SearchModal } from "./SearchModal"
import { FeedbackUIContext } from "./feedback-ui"

/**
 * Hosts the board-wide overlays (submit post, search) and exposes openers so
 * the top bar, sidebar, and empty states can all trigger them.
 */
export function FeedbackUIProvider({ children }: { children: ReactNode }) {
    const [submitOpen, setSubmitOpen] = useState(false)
    const [searchOpen, setSearchOpen] = useState(false)

    return (
        <FeedbackUIContext.Provider
            value={{ openSubmit: () => setSubmitOpen(true), openSearch: () => setSearchOpen(true) }}
        >
            {children}
            <SubmitPostModal open={submitOpen} onOpenChange={setSubmitOpen} />
            <SearchModal open={searchOpen} onOpenChange={setSearchOpen} />
        </FeedbackUIContext.Provider>
    )
}
