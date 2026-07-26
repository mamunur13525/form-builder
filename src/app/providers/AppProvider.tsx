import type { ReactNode } from "react"
import { useEffect } from "react"
import { QueryClientProvider } from "@tanstack/react-query"
import { ThemeProvider } from "./ThemeProvider"
import { queryClient } from "@/shared/api/queryClient"
import { initializeForms } from "../store/formStore"

export function AppProvider({ children }: { children: ReactNode }) {
    useEffect(() => {
        initializeForms()
    }, [])

    return (
        <QueryClientProvider client={queryClient}>
            <ThemeProvider>{children}</ThemeProvider>
        </QueryClientProvider>
    )
}
