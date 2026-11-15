import type { ReactNode } from "react"

interface PageLayoutProps {
    /** Page heading — always rendered, so it never turns into a skeleton. */
    title: string
    description: string
    /** Optional controls aligned with the heading, e.g. a "New" button. */
    actions?: ReactNode
    children: ReactNode
}

/**
 * Shared shell for the top-level app pages (dashboard, forms, templates).
 *
 * The heading lives here rather than inside each page's loading branch, so the
 * title and description stay on screen while the page body shows skeletons.
 */
export function PageLayout({ title, description, actions, children }: PageLayoutProps) {
    return (
        <div className="editorial mx-auto w-full max-w-[1600px] space-y-8 px-4 pt-8 pb-12 sm:space-y-12 sm:px-6 sm:pt-12 sm:pb-16 lg:px-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between sm:gap-8">
                <div>
                    <h1 className="font-display text-[32px] leading-[1.1] sm:text-[48px] text-[var(--foreground)]">
                        {title}
                    </h1>
                    <p className="mt-1 max-w-xl text-sm leading-6 sm:mt-2 sm:text-base text-[var(--editorial-body)]">
                        {description}
                    </p>
                </div>
                {actions}
            </div>
            {children}
        </div>
    )
}
