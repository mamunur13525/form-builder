import type { ReactNode } from "react"

export function AuthLayout({ children }: { children: ReactNode }) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-muted/50 px-4">
            <div className="w-full max-w-md">{children}</div>
        </div>
    )
}