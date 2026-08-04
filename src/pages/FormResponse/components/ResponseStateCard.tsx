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
        <Card className="editorial-shadow-sm rounded-[24px] border-[var(--border)] bg-[var(--card)]">
            <CardContent className="py-16 text-center">
                <div className="flex items-center justify-center gap-2">
                    {loading && (
                        <Loader2 className="h-5 w-5 animate-spin text-[var(--primary)]" />
                    )}
                    <p className="text-base text-[var(--editorial-subtle)]">{message}</p>
                </div>
                {action && <div className="mt-8">{action}</div>}
            </CardContent>
        </Card>
    )
}
