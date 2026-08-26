import { createContext, useContext } from "react"

export interface FeedbackUI {
    openSubmit: () => void
    openSearch: () => void
}

export const FeedbackUIContext = createContext<FeedbackUI | null>(null)

export function useFeedbackUI(): FeedbackUI {
    const ctx = useContext(FeedbackUIContext)
    if (!ctx) throw new Error("useFeedbackUI must be used within FeedbackUIProvider")
    return ctx
}
