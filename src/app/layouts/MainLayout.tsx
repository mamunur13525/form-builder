import type { ReactNode } from "react"
import { Sidebar } from "../../widgets/Sidebar"
import { useLocation } from "react-router-dom"
import { useState } from "react"

export function MainLayout({ children }: { children: ReactNode }) {
    const location = useLocation()
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const isDashboard = location.pathname === "/dashboard"

    return (
        <div className="min-h-screen bg-background">
            {isDashboard && <Sidebar open={sidebarOpen} />}
            <main className={isDashboard ? "transition-all duration-300 p-5" : ""} style={isDashboard ? { marginLeft: sidebarOpen ? "18rem" : "0" } : undefined}>
                {children}
            </main>
        </div>
    )
}