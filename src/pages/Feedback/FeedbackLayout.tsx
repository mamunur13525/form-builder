import { Outlet } from "react-router-dom"

import { FeedbackTopBar, FeedbackUIProvider, TypeFormLogo } from "./components"

/**
 * Public shell for the feedback board + changelog. Deliberately uses a light,
 * TypeForm-branded palette (not the app's monochrome theme) so the surface
 * matches the reference design regardless of the surrounding app.
 */
export function FeedbackLayout() {
    return (
        <FeedbackUIProvider>
            <div className="min-h-screen bg-[#0c0c0f] text-zinc-100">
                <FeedbackTopBar />
                <Outlet />

                {/* Floating "create your own board" CTA */}
                <a
                    href="http://localhost:5173"
                    target="_blank"
                    rel="noreferrer"
                    className="fixed bottom-5 right-5 z-20 inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-[#16161a] px-3.5 py-2 text-xs font-medium text-zinc-300 shadow-xl transition-all hover:border-[#FF5722]/50 hover:text-white"
                >
                    <TypeFormLogo />
                    Create your own board
                </a>
            </div>
        </FeedbackUIProvider>
    )
}
