/** Pure helpers behind the response summary breakdown. */

/** One tally per answer; checkbox arrays count each selected option. */
export function tally(values: unknown[]): Map<string, number> {
    const counts = new Map<string, number>()
    for (const value of values) {
        for (const item of Array.isArray(value) ? value : [value]) {
            if (item === null || item === undefined || item === "") continue
            const key = typeof item === "object" ? JSON.stringify(item) : String(item)
            counts.set(key, (counts.get(key) ?? 0) + 1)
        }
    }
    return counts
}

export function percent(count: number, total: number): number {
    return total > 0 ? Math.min((count / total) * 100, 100) : 0
}

export function plural(count: number): string {
    return count === 1 ? "response" : "responses"
}

export interface NpsGroup {
    label: string
    range: string
    count: number
    pct: number
    boxClass: string
    textClass: string
    dotClass: string
    values: number[]
}

export interface NpsSummary {
    groups: NpsGroup[]
    score: number
}

/** Standard NPS buckets: detractors 0–6, passives 7–8, promoters 9–10. */
export function npsGroups(counts: Map<string, number>, answered: number): NpsSummary {
    const group = (
        label: string,
        range: string,
        values: number[],
        boxClass: string,
        textClass: string,
        dotClass: string,
    ): NpsGroup => {
        const count = values.reduce((sum, value) => sum + (counts.get(String(value)) ?? 0), 0)
        return {
            label,
            range,
            count,
            pct: Math.round(percent(count, answered)),
            boxClass,
            textClass,
            dotClass,
            values,
        }
    }

    const groups = [
        group(
            "Detractors",
            "0–6",
            [0, 1, 2, 3, 4, 5, 6],
            "bg-rose-50 dark:bg-rose-950/30",
            "text-rose-600 dark:text-rose-400",
            "bg-rose-500",
        ),
        group(
            "Passives",
            "7–8",
            [7, 8],
            "bg-amber-50 dark:bg-amber-950/30",
            "text-amber-600 dark:text-amber-400",
            "bg-amber-400",
        ),
        group(
            "Promoters",
            "9–10",
            [9, 10],
            "bg-emerald-50 dark:bg-emerald-950/30",
            "text-emerald-600 dark:text-emerald-400",
            "bg-emerald-500",
        ),
    ]

    const score =
        answered > 0 ? Math.round(((groups[2].count - groups[0].count) / answered) * 100) : 0
    return { groups, score }
}
