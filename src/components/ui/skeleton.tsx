import { cn } from "@/lib/utils"

/** shadcn/ui placeholder block — pulse it while real content loads. */
function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
    return (
        <div
            data-slot="skeleton"
            className={cn("animate-pulse rounded-md bg-slate-300 dark:bg-zinc-700", className)}
            {...props}
        />
    )
}

export { Skeleton }
