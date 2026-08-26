import { Link, useParams } from "react-router-dom"
import { ArrowLeft, ExternalLink } from "lucide-react"

import { ROUTES } from "@/shared/constants/routes"
import type { TextRun, UpdateBlock } from "../types"
import { useUpdate } from "../hooks"
import { UpdateCover, UpdateTag, formatLong, Avatar } from "../components"

function Run({ run }: { run: TextRun }) {
    if (run.link) {
        return (
            <a
                href={run.link}
                target="_blank"
                rel="noreferrer"
                className="font-medium text-[#f2542d] hover:underline"
            >
                {run.text}
            </a>
        )
    }
    if (run.code) {
        return (
            <code className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-[13px] text-gray-800">
                {run.text}
            </code>
        )
    }
    if (run.bold) return <strong className="font-semibold text-gray-900">{run.text}</strong>
    return <>{run.text}</>
}

function Block({ block }: { block: UpdateBlock }) {
    if (block.type === "readmore") {
        return (
            <a
                href={block.url}
                target="_blank"
                rel="noreferrer"
                className="my-2 inline-flex items-center gap-1.5 rounded-lg bg-[#fff1ec] px-4 py-2 text-sm font-semibold text-[#f2542d] hover:bg-[#ffe4d8]"
            >
                {block.label}
                <ExternalLink className="h-4 w-4" />
            </a>
        )
    }
    return (
        <p className="text-[15px] leading-relaxed text-gray-700">
            {block.runs.map((r, i) => (
                <Run key={i} run={r} />
            ))}
        </p>
    )
}

export function UpdateDetailPage() {
    const { slug } = useParams<{ slug: string }>()
    const { data: update, isLoading } = useUpdate(slug)

    if (isLoading) {
        return (
            <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
                <div className="h-6 w-32 animate-pulse rounded bg-gray-100" />
                <div className="mt-6 h-56 animate-pulse rounded-2xl bg-gray-100" />
            </div>
        )
    }

    if (!update) {
        return (
            <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
                <p className="text-lg font-semibold text-gray-900">Update not found</p>
                <Link to={ROUTES.UPDATES} className="mt-4 inline-block text-sm font-medium text-[#f2542d]">
                    ← Back to Updates
                </Link>
            </div>
        )
    }

    return (
        <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:py-8">
            <Link
                to={ROUTES.UPDATES}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-800"
            >
                <ArrowLeft className="h-4 w-4" />
                Updates
            </Link>

            {update.cover && (
                <UpdateCover cover={update.cover} className="mt-4 h-60 w-full rounded-2xl" />
            )}

            <div className="mt-6 flex flex-wrap items-center gap-2">
                {update.tags.map((t) => (
                    <UpdateTag key={t} tag={t} />
                ))}
                <span className="text-xs text-gray-400">{formatLong(update.date)}</span>
            </div>

            <h1 className="mt-3 text-3xl font-bold tracking-tight text-gray-900">{update.title}</h1>

            {update.author && (
                <div className="mt-4 flex items-center gap-2">
                    <Avatar author={update.author} size="sm" />
                    <span className="text-sm text-gray-600">{update.author.name}</span>
                </div>
            )}

            <article className="mt-6 flex flex-col gap-4">
                {update.content.map((b, i) => (
                    <Block key={i} block={b} />
                ))}
            </article>
        </div>
    )
}
