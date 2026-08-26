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
            <div className="min-h-screen bg-gray-50 text-gray-900">
                <FeedbackTopBar />
                <Outlet />

                {/* Floating "create your own board" CTA */}
                <a
                    href="http://localhost:5173"
                    target="_blank"
                    rel="noreferrer"
                    className="fixed bottom-5 right-5 z-20 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3.5 py-2 text-xs font-medium text-gray-600 shadow-lg transition-shadow hover:shadow-xl"
                >
                    <TypeFormLogo />
                    Create your own board
                </a>
            </div>
        </FeedbackUIProvider>
    )
}
