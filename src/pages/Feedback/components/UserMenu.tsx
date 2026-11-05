import { useNavigate } from "react-router-dom"
import { User, Settings, Send, Globe, LogOut } from "lucide-react"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu"
import { useAuthStore } from "@/shared/stores/authStore"
import { ROUTES } from "@/shared/constants/routes"
import { showInfo, showSuccess } from "@/shared/hooks/useToast"
import { useCurrentAuthor } from "../hooks"
import { Avatar } from "./primitives"

export function UserMenu({ onSubmitPost }: { onSubmitPost: () => void }) {
    const navigate = useNavigate()
    const clearTokens = useAuthStore((s) => s.clearTokens)
    const author = useCurrentAuthor()

    return (
        <DropdownMenu>
            <DropdownMenuTrigger
                className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-[#f2542d]/40"
                aria-label="Account menu"
            >
                {author ? (
                    <Avatar author={author} size="sm" />
                ) : (
                    <span className="block h-8 w-8 rounded-full bg-gray-200" />
                )}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" sideOffset={8} className="w-56 bg-white text-gray-700">
                <DropdownMenuItem onClick={onSubmitPost}>
                    <Send className="text-gray-500" />
                    Submit a Post
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => showInfo("Profile", "Your public profile isn't wired up in this demo.")}>
                    <User className="text-gray-500" />
                    Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate(ROUTES.SETTINGS)}>
                    <Settings className="text-gray-500" />
                    Settings
                </DropdownMenuItem>
                <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                        <Globe className="text-gray-500" />
                        Language
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent className="bg-white text-gray-700">
                        <DropdownMenuRadioGroup defaultValue="en">
                            <DropdownMenuRadioItem value="en">English</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="es">Español</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="fr">Français</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="de">Deutsch</DropdownMenuRadioItem>
                        </DropdownMenuRadioGroup>
                    </DropdownMenuSubContent>
                </DropdownMenuSub>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    variant="destructive"
                    onClick={() => {
                        clearTokens()
                        showSuccess("Logged out", "You've been signed out.")
                        navigate(ROUTES.FEEDBACK)
                    }}
                >
                    <LogOut />
                    Logout
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
