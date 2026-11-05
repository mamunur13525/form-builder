import { Link } from "react-router-dom"
import { Bot, Sheet, Puzzle } from "lucide-react"

import { cn } from "@/lib/utils"
import { ROUTES } from "@/shared/constants/routes"
import type { UpdateEntry } from "../types"
import { formatMedium } from "./format"

const COVER: Record<
    NonNullable<UpdateEntry["cover"]>,
    { icon: typeof Bot; from: string; to: string; label: string }
> = {
    mcp: { icon: Bot, from: "#f2542d", to: "#ff8a5c", label: "TypeForm MCP" },
    sheets: { icon: Sheet, from: "#16a34a", to: "#4ade80", label: "Google Sheets" },
    integrations: { icon: Puzzle, from: "#2563eb", to: "#60a5fa", label: "Integrations" },
}

export function UpdateCover({
    cover,
    className,
}: {
    cover: NonNullable<UpdateEntry["cover"]>
    className?: string
}) {
    const c = COVER[cover]
    const Icon = c.icon
    return (
        <div
            className={cn("relative flex items-center justify-center overflow-hidden", className)}
            style={{ background: `linear-gradient(135deg, ${c.from}, ${c.to})` }}
        >
            <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/15" />
            <div className="absolute -bottom-8 -left-4 h-28 w-28 rounded-full bg-black/10" />
            <div className="relative flex flex-col items-center gap-2 text-white">
                <Icon className="h-9 w-9" strokeWidth={1.75} />
                <span className="text-sm font-semibold">{c.label}</span>
            </div>
        </div>
    )
}

const TAG_STYLE: Record<string, string> = {
    "new feature": "bg-[#fff1ec] text-[#f2542d]",
    announcement: "bg-purple-50 text-purple-600",
    improvement: "bg-blue-50 text-blue-600",
    fix: "bg-green-50 text-green-600",
}

export function UpdateTag({ tag }: { tag: string }) {
    return (
        <span
            className={cn(
                "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
                TAG_STYLE[tag] ?? "bg-gray-100 text-gray-600",
            )}
        >
            {tag}
        </span>
    )
}

export function UpdateCard({ update }: { update: UpdateEntry }) {
    return (
        <Link
            to={`${ROUTES.UPDATES}/${update.slug}`}
            className="group block overflow-hidden rounded-2xl border border-gray-200 bg-white transition-shadow hover:shadow-sm"
        >
            {update.cover && <UpdateCover cover={update.cover} className="h-44 w-full" />}
            <div className="p-5">
                <div className="flex flex-wrap items-center gap-2">
                    {update.tags.map((t) => (
                        <UpdateTag key={t} tag={t} />
                    ))}
                    <span className="text-xs text-gray-400">{formatMedium(update.date)}</span>
                </div>
                <h3 className="mt-2 text-lg font-semibold text-gray-900 group-hover:text-[#f2542d]">
                    {update.title}
                </h3>
                <p className="mt-1 line-clamp-2 text-sm text-gray-500">{update.excerpt}</p>
            </div>
        </Link>
    )
}
