import { useNavigate, useLocation } from "react-router-dom"
import { LayoutDashboard, Sun, Moon, LogOut } from "lucide-react"
import { ROUTES } from "../../shared/constants/routes"
import { cn } from "../../shared/utils/cn"
import { useTheme } from "../../app/providers/ThemeProvider"
import { Button } from "../../components/ui/button"
import { useLogout } from "../../features/auth/hooks/useAuth"

interface SidebarProps {
    open: boolean
}

const navItems = [
    { label: "Dashboard", icon: LayoutDashboard, path: ROUTES.DASHBOARD },
]

export function Sidebar({ open }: SidebarProps) {
    const navigate = useNavigate()
    const location = useLocation()
    const { theme, setTheme } = useTheme()
    const logout = useLogout()

    const handleLogout = () => {
        logout.mutate()
        navigate(ROUTES.LOGIN)
    }

    return (
        <aside
            className={cn(
                "fixed left-0 top-0 z-40 h-screen border-r bg-background transition-all duration-300",
                open ? "w-72" : "w-0 overflow-hidden"
            )}
        >
            <div className="flex flex-col h-full">
                {/* Logo */}
                <div className="p-4 border-b">
                    <h1 className="text-xl font-bold">FormFlow</h1>
                </div>

                {/* Navigation */}
                <nav className="flex-1 flex flex-col gap-1 p-4">
                    {navItems.map((item) => (
                        <button
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            className={cn(
                                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                                location.pathname === item.path
                                    ? "bg-accent text-accent-foreground"
                                    : "text-muted-foreground"
                            )}
                        >
                            <item.icon className="h-4 w-4" />
                            {item.label}
                        </button>
                    ))}
                </nav>

                {/* Bottom section - Theme & Logout */}
                <div className="p-4 border-t space-y-2">
                    <Button
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                    >
                        {theme === "light" ? <Moon className="mr-2 h-4 w-4" /> : <Sun className="mr-2 h-4 w-4" />}
                        {theme === "light" ? "Dark Mode" : "Light Mode"}
                    </Button>
                    <Button
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={handleLogout}
                    >
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                    </Button>
                </div>
            </div>
        </aside>
    )
}
