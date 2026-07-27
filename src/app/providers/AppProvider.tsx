import type { ReactNode } from "react"
import { useEffect } from "react"
import { QueryClientProvider } from "@tanstack/react-query"
import { GoogleOAuthProvider } from "@react-oauth/google"
import { ThemeProvider } from "./ThemeProvider"
import { queryClient } from "@/shared/api/queryClient"
import { initializeForms } from "../store/formStore"
import { Toaster } from "@/components/ui/toast"

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? "placeholder"

export function AppProvider({ children }: { children: ReactNode }) {
    useEffect(() => {
        initializeForms()
    }, [])

    return (
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
            <QueryClientProvider client={queryClient}>
                <ThemeProvider>
                    {children}
                    <Toaster />
                </ThemeProvider>
            </QueryClientProvider>
        </GoogleOAuthProvider>
    )
}