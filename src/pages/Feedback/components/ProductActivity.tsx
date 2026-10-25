import { cn } from "@/lib/utils"
import { useProductActivity } from "../hooks"

const INTENSITY = ["bg-zinc-800", "bg-[#FF5722]/30", "bg-[#FF5722]/60", "bg-[#FF5722]"] as const

export function ProductActivity() {
    const { data } = useProductActivity()
    const weeks = data?.weeks ?? []

    return (
        <div className="rounded-2xl border border-zinc-800 bg-[#141418] p-4">
            <p className="text-sm font-semibold text-zinc-100">Product activity</p>
            <p className="mt-0.5 text-xs text-zinc-400">
                {data ? `${data.completed} shipped in the last 3 months` : "Loading…"}
            </p>

            <div className="mt-3 grid grid-cols-6 gap-1.5">
                {weeks.map((v, i) => (
                    <span
                        key={i}
                        className={cn("aspect-square rounded-[4px]", INTENSITY[Math.min(v, 3)])}
                        title={`Week ${i + 1}: ${v} update${v === 1 ? "" : "s"}`}
                    />
                ))}
            </div>

            <div className="mt-3 flex items-center justify-end gap-1.5 text-[10px] text-zinc-500">
                <span>Less</span>
                {INTENSITY.map((c) => (
                    <span key={c} className={cn("h-2.5 w-2.5 rounded-[3px]", c)} />
                ))}
                <span>More</span>
            </div>
        </div>
    )
}
