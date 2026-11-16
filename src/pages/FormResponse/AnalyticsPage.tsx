import { useState } from "react"
import { useParams } from "react-router-dom"
import { motion } from "framer-motion"
import {
    Calendar,
    Check,
    Clock,
    Eye,
    HelpCircle,
    ListChecks,
    Mail,
    Percent,
    Phone,
    Play,
    ShieldCheck,
    SlidersHorizontal,
    Star,
    Type,
    Hash,
    CalendarDays,
} from "lucide-react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useForm } from "@/features/forms/hooks/useForms"
import { useFormAnalytics } from "@/features/forms/hooks/useFormResponses"
import { adaptApiForm } from "@/features/forms/model/adapters"
import type { Form as CommonForm } from "@/shared/types/common"
import type { AnalyticsTrendPoint, FormAnalyticsFilter } from "@/entities/response/model/types"
import { cn } from "@/lib/utils"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from "@/components/ui/chart"
import { ResponsePageShell } from "./components/ResponsePageShell"
import { ResponseStateCard } from "./components/ResponseStateCard"
import { AnalyticsSkeleton } from "./components/ResponseSkeletons"

/** Format a duration in seconds as `45s` or `2m 5s`. */
function formatDuration(seconds: number): string {
    if (!Number.isFinite(seconds) || seconds <= 0) return "0s"
    const rounded = Math.round(seconds)
    if (rounded < 60) return `${rounded}s`
    const minutes = Math.floor(rounded / 60)
    const remainder = rounded % 60
    return remainder ? `${minutes}m ${remainder}s` : `${minutes}m`
}

/** Get badge style and icon for a question type. */
function getQuestionTypeBadge(type: string) {
    switch (type?.toLowerCase()) {
        case "multiplechoice":
        case "dropdown":
            return {
                icon: ListChecks,
                bg: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300",
            }
        case "rating":
        case "opinion_scale":
            return {
                icon: Star,
                bg: "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300",
            }
        case "email":
            return {
                icon: Mail,
                bg: "bg-sky-100 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300",
            }
        case "phone":
            return {
                icon: Phone,
                bg: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300",
            }
        case "number":
            return {
                icon: Hash,
                bg: "bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300",
            }
        case "date":
            return {
                icon: CalendarDays,
                bg: "bg-orange-100 text-orange-700 dark:bg-orange-950/50 dark:text-orange-300",
            }
        default:
            return {
                icon: Type,
                bg: "bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300",
            }
    }
}

type TrendMetric = "views" | "starts" | "submissions"

/** Colors match the metric cards above so each series is recognizable. */
const trendConfig = {
    views: { label: "Views", color: "#A855F7" },
    starts: { label: "Starts", color: "#0EA5E9" },
    submissions: { label: "Submissions", color: "#22C55E" },
} satisfies ChartConfig

interface TrendChartProps {
    data: AnalyticsTrendPoint[]
    metric: TrendMetric
}

function TrendChart({ data, metric }: TrendChartProps) {
    const { color } = trendConfig[metric]
    const gradientId = `trend-${metric}-fill`

    return (
        <ChartContainer config={trendConfig} className="aspect-auto h-48 w-full sm:h-56">
            <AreaChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
                <defs>
                    <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity={0.45} />
                        <stop offset="100%" stopColor={color} stopOpacity={0} />
                    </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    minTickGap={24}
                />
                <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    allowDecimals={false}
                    width={32}
                />
                <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                <Area
                    type="monotone"
                    dataKey={metric}
                    stroke={color}
                    strokeWidth={2.5}
                    fill={`url(#${gradientId})`}
                    dot={{ r: 3, fill: "var(--background)", stroke: color, strokeWidth: 2 }}
                    activeDot={{ r: 5 }}
                />
            </AreaChart>
        </ChartContainer>
    )
}

export function AnalyticsPage() {
    const { formId } = useParams<{ formId: string }>()

    const [timeRange, setTimeRange] = useState<NonNullable<FormAnalyticsFilter["timeRange"]>>("all")
    const [device, setDevice] = useState<NonNullable<FormAnalyticsFilter["device"]>>("all")
    const [trendMetric, setTrendMetric] = useState<TrendMetric>("views")

    const {
        data: apiForm,
        isLoading: formLoading,
        isError: formError,
    } = useForm(formId || "")

    const {
        data: analytics,
        isLoading: analyticsLoading,
        isError: analyticsError,
    } = useFormAnalytics(formId || "", { timeRange, device })

    const form: CommonForm | null = apiForm ? adaptApiForm(apiForm) : null
    const isLoading = formLoading || analyticsLoading

    if (!formId || (!isLoading && !form)) {
        return (
            <div className="editorial px-4 py-20 text-center sm:py-32">
                <h2 className="font-display text-3xl leading-tight text-[var(--foreground)] sm:text-[40px]">
                    Form not found
                </h2>
            </div>
        )
    }

    const views = analytics?.views ?? 0
    const starts = analytics?.starts ?? 0
    const submissions = analytics?.submissions ?? 0
    const completionRate = analytics?.completionRate ?? 0
    const completionTime = analytics?.completionTime ?? 0
    const trends = analytics?.trends ?? []
    const dropoff = analytics?.dropoff ?? []

    return (
        <ResponsePageShell
            activeTab="analytics"
            actions={
                <a
                    href="https://help.youform.com/form-analytics-and-drop-off-rate-041xe"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors"
                >
                    <HelpCircle className="h-4 w-4" />
                    <span>Help</span>
                </a>
            }
        >
            {isLoading ? (
                <AnalyticsSkeleton />
            ) : formError || analyticsError ? (
                <ResponseStateCard message="Could not load analytics. Please try again." />
            ) : (
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className="max-w-6xl mx-auto space-y-6 pb-12"
                >
                    {/* Filters Row */}
                    <div className="flex flex-wrap items-center gap-3">
                        {/* Time Range Filter */}
                        <div className="w-40">
                            <Select
                                value={timeRange}
                                onValueChange={(val) => {
                                    if (val) setTimeRange(val as NonNullable<FormAnalyticsFilter["timeRange"]>)
                                }}
                            >
                                <SelectTrigger className="h-9 w-full rounded-lg border border-slate-200 bg-white dark:border-zinc-800 dark:bg-[#18181b] text-xs font-medium px-3 text-slate-700 dark:text-zinc-200 shadow-sm">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                        <SelectValue />
                                    </div>
                                </SelectTrigger>
                                <SelectContent className="editorial rounded-lg border-slate-200 dark:border-zinc-800">
                                    <SelectItem value="all">All Time</SelectItem>
                                    <SelectItem value="today">Today</SelectItem>
                                    <SelectItem value="7d">Last 7 days</SelectItem>
                                    <SelectItem value="30d">Last 30 days</SelectItem>
                                    <SelectItem value="90d">Last 90 days</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Device Filter */}
                        <div className="w-40">
                            <Select
                                value={device}
                                onValueChange={(val) => {
                                    if (val) setDevice(val as NonNullable<FormAnalyticsFilter["device"]>)
                                }}
                            >
                                <SelectTrigger className="h-9 w-full rounded-lg border border-slate-200 bg-white dark:border-zinc-800 dark:bg-[#18181b] text-xs font-medium px-3 text-slate-700 dark:text-zinc-200 shadow-sm">
                                    <div className="flex items-center gap-2">
                                        <SlidersHorizontal className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                        <SelectValue />
                                    </div>
                                </SelectTrigger>
                                <SelectContent className="editorial rounded-lg border-slate-200 dark:border-zinc-800">
                                    <SelectItem value="all">All Devices</SelectItem>
                                    <SelectItem value="desktop">Desktop</SelectItem>
                                    <SelectItem value="mobile">Mobile</SelectItem>
                                    <SelectItem value="tablet">Tablet</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* 5 Metric Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
                        {/* Views */}
                        <div className="rounded-xl border border-[#EDE9FE] bg-[#FAF5FF] dark:border-purple-900/30 dark:bg-purple-950/20 p-4 sm:p-5 transition-shadow">
                            <div className="flex items-center gap-2 text-[#7C3AED] dark:text-[#A78BFA]">
                                <Eye className="h-4 w-4" />
                                <span className="text-xs font-semibold tracking-wide">Views</span>
                            </div>
                            <p className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-zinc-100">
                                {views}
                            </p>
                        </div>

                        {/* Starts */}
                        <div className="rounded-xl border border-[#BAE6FD] bg-[#F0F9FF] dark:border-sky-900/30 dark:bg-sky-950/20 p-4 sm:p-5 transition-shadow">
                            <div className="flex items-center gap-2 text-[#0284C7] dark:text-[#38BDF8]">
                                <Play className="h-4 w-4 fill-current" />
                                <span className="text-xs font-semibold tracking-wide">Starts</span>
                            </div>
                            <p className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-zinc-100">
                                {starts}
                            </p>
                        </div>

                        {/* Submissions */}
                        <div className="rounded-xl border border-[#BBF7D0] bg-[#F0FDF4] dark:border-emerald-900/30 dark:bg-emerald-950/20 p-4 sm:p-5 transition-shadow">
                            <div className="flex items-center gap-2 text-[#16A34A] dark:text-[#4ADE80]">
                                <Check className="h-4 w-4 stroke-[3]" />
                                <span className="text-xs font-semibold tracking-wide">Submissions</span>
                            </div>
                            <p className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-zinc-100">
                                {submissions}
                            </p>
                        </div>

                        {/* Completion Rate */}
                        <div className="rounded-xl border border-[#FEF08A] bg-[#FEFCE8] dark:border-amber-900/30 dark:bg-amber-950/20 p-4 sm:p-5 transition-shadow">
                            <div className="flex items-center gap-2 text-[#CA8A04] dark:text-[#FACC15]">
                                <Percent className="h-4 w-4 stroke-[2.5]" />
                                <span className="text-xs font-semibold tracking-wide">Completion Rate</span>
                            </div>
                            <p className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-zinc-100">
                                {completionRate}%
                            </p>
                        </div>

                        {/* Completion Time */}
                        <div className="rounded-xl border border-slate-200 bg-[#F8FAFC] dark:border-zinc-800 dark:bg-zinc-900/40 p-4 sm:p-5 transition-shadow col-span-2 sm:col-span-1">
                            <div className="flex items-center gap-2 text-slate-600 dark:text-zinc-400">
                                <Clock className="h-4 w-4" />
                                <span className="text-xs font-semibold tracking-wide">Completion Time</span>
                            </div>
                            <p className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-zinc-100">
                                {formatDuration(completionTime)}
                            </p>
                        </div>
                    </div>

                    {/* Feature / Pro Banner */}
                    <div className="rounded-xl border border-rose-200/80 bg-rose-50/50 dark:border-rose-900/40 dark:bg-rose-950/20 p-4 sm:px-5 sm:py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                        <div className="flex items-center gap-2.5">
                            <ShieldCheck className="h-4 w-4 text-rose-500 shrink-0" />
                            <div className="text-xs text-rose-900 dark:text-rose-200">
                                <span className="font-semibold">Analytics are limited</span>
                                <span className="mx-1.5 opacity-60">•</span>
                                <span>See trends and the drop-off rate for each question in your form.</span>{" "}
                                <a
                                    href="https://help.youform.com/form-analytics-and-drop-off-rate-041xe"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-medium underline hover:text-rose-950 dark:hover:text-rose-100"
                                >
                                    Learn more
                                </a>
                            </div>
                        </div>
                        <a
                            href="https://youform.com/pricing"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center shrink-0 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-slate-800 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800 shadow-xs transition-colors"
                        >
                            Buy Youform Pro →
                        </a>
                    </div>

                    {/* Trends Section */}
                    <div className="rounded-xl border border-slate-200/90 dark:border-zinc-800 bg-white dark:bg-[#18181b] p-5 sm:p-6 shadow-xs">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">Trends</h3>
                            <div className="w-32">
                                <Select
                                    value={trendMetric}
                                    onValueChange={(val) => {
                                        if (val) setTrendMetric(val as TrendMetric)
                                    }}
                                >
                                    <SelectTrigger className="h-8 w-full rounded-lg border border-slate-200 bg-white dark:border-zinc-800 dark:bg-[#18181b] text-xs font-medium px-2.5 text-slate-700 dark:text-zinc-200 shadow-xs">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="editorial rounded-lg border-slate-200 dark:border-zinc-800">
                                        <SelectItem value="views">Views</SelectItem>
                                        <SelectItem value="starts">Starts</SelectItem>
                                        <SelectItem value="submissions">Submissions</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {trends.length === 0 ? (
                            <div className="py-12 text-center text-xs text-slate-400 dark:text-zinc-500">
                                No trend data available for this range.
                            </div>
                        ) : (
                            <TrendChart data={trends} metric={trendMetric} />
                        )}
                    </div>

                    {/* Drop-off Rate Section */}
                    <div className="rounded-xl border border-slate-200/90 dark:border-zinc-800 bg-white dark:bg-[#18181b] p-5 sm:p-6 shadow-xs">
                        <div className="space-y-1 mb-5">
                            <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">Drop-off Rate</h3>
                            <p className="text-xs text-slate-500 dark:text-zinc-400">
                                The drop-off rate shows the percentage of users who view a question but don't move past it.{" "}
                                <a
                                    href="https://help.youform.com/form-analytics-and-drop-off-rate-041xe"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-medium underline hover:text-slate-800 dark:hover:text-zinc-200"
                                >
                                    Learn more
                                </a>
                            </p>
                        </div>

                        {dropoff.length === 0 ? (
                            <div className="py-8 text-center text-xs text-slate-400 dark:text-zinc-500">
                                No questions found in this form.
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead>
                                        <tr className="border-b border-slate-100 dark:border-zinc-800/80 text-xs font-medium text-slate-400 dark:text-zinc-500">
                                            <th className="pb-3 font-medium">Question</th>
                                            <th className="pb-3 text-center font-medium w-28">Views</th>
                                            <th className="pb-3 text-right font-medium w-28">Drop-off</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/50">
                                        {dropoff.map((q, idx) => {
                                            const typeBadge = getQuestionTypeBadge(q.type)
                                            const Icon = typeBadge.icon
                                            return (
                                                <tr
                                                    key={q.id || idx}
                                                    className="hover:bg-slate-50/60 dark:hover:bg-zinc-800/30 transition-colors"
                                                >
                                                    <td className="py-3.5 pr-4">
                                                        <div className="flex items-center gap-3">
                                                            <span
                                                                className={cn(
                                                                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-xs",
                                                                    typeBadge.bg,
                                                                )}
                                                            >
                                                                <Icon className="h-3.5 w-3.5" />
                                                            </span>
                                                            <span className="font-medium text-slate-800 dark:text-zinc-200 text-xs sm:text-sm line-clamp-1">
                                                                {q.title || `Question ${idx + 1}`}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="py-3.5 px-4 text-center text-xs sm:text-sm text-slate-600 dark:text-zinc-400 font-mono">
                                                        {q.views}
                                                    </td>
                                                    <td className="py-3.5 pl-4 text-right">
                                                        <span
                                                            className={cn(
                                                                "inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold",
                                                                q.dropoffRate > 35
                                                                    ? "bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400"
                                                                    : q.dropoffRate > 15
                                                                    ? "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400"
                                                                    : "text-slate-600 dark:text-zinc-400",
                                                            )}
                                                        >
                                                            {q.dropoffRate}%
                                                        </span>
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </motion.div>
            )}
        </ResponsePageShell>
    )
}
