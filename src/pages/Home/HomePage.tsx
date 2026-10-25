import { useNavigate } from "react-router-dom"
import { Button } from "../../components/ui/button"
import { ROUTES } from "../../shared/constants/routes"

export function HomePage() {
    const navigate = useNavigate()

    return (
        <div className="relative min-h-screen flex flex-col items-center justify-center bg-[#0c0c0f] text-zinc-100 px-4 overflow-hidden">
            {/* Ambient radiant studio glow */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[600px] rounded-full bg-gradient-to-tr from-[#FF5722]/15 via-violet-600/10 to-transparent blur-[140px]"
            />

            <div className="relative z-10 text-center max-w-2xl">
                <div className="flex justify-center mb-6">
                    <img src="/flogo.png" alt="FormFlow logo" className="h-16 w-16 object-contain rounded-2xl shadow-xl shadow-[#FF5722]/20" />
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-[#FF5722]/30 bg-[#FF5722]/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-[#FF5722] mb-6">
                    Forms, Reimagined
                </div>
                <h1 className="font-display text-4xl sm:text-6xl font-bold tracking-tight mb-4 text-white">
                    Build Forms That People Love
                </h1>
                <p className="text-base sm:text-lg text-zinc-400 mb-8 max-w-xl mx-auto leading-relaxed">
                    Create beautiful, responsive forms in minutes. Collect responses, analyze data,
                    and make better decisions with FormFlow.
                </p>
                <div className="flex flex-wrap gap-4 justify-center">
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