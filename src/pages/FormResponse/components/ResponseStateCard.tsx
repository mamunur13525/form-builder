import { Loader2 } from "lucide-react"
import type { ReactNode } from "react"
import { Card, CardContent } from "@/components/ui/card"

interface ResponseStateCardProps {
    /** Shows a spinner alongside the message. */
    loading?: boolean
    message: string
    /** Optional call to action, e.g. a share or retry button. */
    action?: ReactNode
}

/** Uniform card used for the loading, error and empty states of the response pages. */
export function ResponseStateCard({ loading = false, message, action }: ResponseStateCardProps) {
    return (
        <Card className="editorial-shadow-sm rounded-lg border-[var(--border)] bg-[var(--card)] dark:border-zinc-800 dark:bg-[#141418] dark:shadow-[0_4px_14px_rgba(0,0,0,0.45)]">
            <CardContent className="px-5 py-12 text-center sm:py-16">
                <div className="flex items-center justify-center gap-2">
                    {loading && (
                        <Loader2 className="h-5 w-5 shrink-0 animate-spin text-[var(--primary)]" />
                    )}
                    <p className="text-sm text-[var(--editorial-subtle)] dark:text-zinc-500 sm:text-base">{message}</p>
                </div>
                {action && <div className="mt-6 sm:mt-8">{action}</div>}
            </CardContent>
        </Card>
    )
}
