import { useNavigate } from "react-router-dom"
import { Button } from "../../components/ui/button"
import { ROUTES } from "../../shared/constants/routes"

export function HomePage() {
    const navigate = useNavigate()

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-background to-muted/50 px-4">
            <div className="text-center max-w-2xl">
                <h1 className="text-5xl font-bold tracking-tight mb-4">
                    Build Forms That People Love
                </h1>
                <p className="text-lg text-muted-foreground mb-8">
                    Create beautiful, responsive forms in minutes. Collect responses, analyze data,
                    and make better decisions with FormFlow.
                </p>
                <div className="flex gap-4 justify-center">
                    <Button size="lg" onClick={() => navigate(ROUTES.LOGIN)}>
                        Get Started
                    </Button>
                    <Button size="lg" variant="outline" onClick={() => navigate(ROUTES.LOGIN)}>
                        Sign In
                    </Button>
                </div>
            </div>
        </div>
    )
}