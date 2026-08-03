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
        <Card>
            <CardContent className="text-center py-12">
                <div className="flex items-center justify-center gap-2">
                    {loading && (
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    )}
                    <p className="text-base text-muted-foreground">{message}</p>
                </div>
                {action && <div className="mt-4">{action}</div>}
            </CardContent>
        </Card>
    )
}
