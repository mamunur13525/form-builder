import { cn } from "@/lib/utils"
import { useProductActivity } from "../hooks"

const INTENSITY = ["bg-gray-100", "bg-[#fcd9c8]", "bg-[#f7a98c]", "bg-[#f2542d]"] as const

export function ProductActivity() {
    const { data } = useProductActivity()
    const weeks = data?.weeks ?? []

    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-4">
            <p className="text-sm font-semibold text-gray-900">Product activity</p>
            <p className="mt-0.5 text-xs text-gray-500">
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

            <div className="mt-3 flex items-center justify-end gap-1.5 text-[10px] text-gray-400">
                <span>Less</span>
                {INTENSITY.map((c) => (
                    <span key={c} className={cn("h-2.5 w-2.5 rounded-[3px]", c)} />
                ))}
                <span>More</span>
            </div>
        </div>
    )
}
