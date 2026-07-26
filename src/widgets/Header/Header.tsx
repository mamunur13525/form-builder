import { Menu, Sun, Moon, LogOut } from "lucide-react"
import { Button } from "../../components/ui/button"
import { useTheme } from "../../app/providers/ThemeProvider"
import { useNavigate } from "react-router-dom"
import { ROUTES } from "../../shared/constants/routes"
import { useLogout } from "../../features/auth/hooks/useAuth"

interface HeaderProps {
    onMenuClick: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
    const { theme, setTheme } = useTheme()
    const navigate = useNavigate()
    const logout = useLogout()

    const handleLogout = () => {
        logout.mutate()
        navigate(ROUTES.LOGIN)
    }

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-14 items-center px-4 gap-4">
                <Button variant="ghost" size="icon" onClick={onMenuClick}>
                    <Menu className="h-5 w-5" />
                </Button>
                <div
                    className="font-bold text-lg cursor-pointer"
                    onClick={() => navigate(ROUTES.DASHBOARD)}
                >
                    FormFlow
                </div>
                <div className="flex-1" />
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                >
                    {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                </Button>
                <Button variant="ghost" size="icon" onClick={handleLogout}>
                    <LogOut className="h-5 w-5" />
                </Button>
            </div>
        </header>
    )
}
