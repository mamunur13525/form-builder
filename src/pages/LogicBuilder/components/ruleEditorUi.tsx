/**
 * Shared visual building blocks for the logic rule editor: editorial select
 * triggers, operator icons, page chips and page select content.
 */

import { Circle, CircleSlash, Equal, Hash, List, Maximize2, Minimize2, Slash } from "lucide-react";
import { cn } from "@/lib/utils";
import { SelectTrigger } from "../../../components/ui/select";
import type { FormPage, LogicOperator } from "../../../shared/types/common";
import type { LucideIcon } from "lucide-react";
import { PAGE_TYPE_ICONS, PAGE_TYPE_VISUALS } from "../../../shared/constants/form-types";

/** Editorial select trigger — styled like the reference design's pill buttons. */
export const TRIGGER_CLASS =
    "h-9 rounded-lg border-[var(--input)] bg-[var(--card)] px-3.5 text-[15px] text-[var(--foreground)] shadow-sm hover:border-[var(--editorial-primary-ring)] focus-visible:border-[var(--ring)] data-[placeholder]:text-[var(--editorial-subtle)]"

/** Portalled select popup — inherits the `.editorial` subtree styling. */
export const OVERLAY_CLASS =
    "editorial rounded-lg border border-[var(--border)] bg-[var(--popover)] text-[var(--foreground)]"

/** Editorial input field that matches the select trigger height/width. */
export const INPUT_CLASS =
    "h-9 rounded-lg border-[var(--input)] bg-[var(--card)] px-3.5 text-[15px] text-[var(--foreground)] placeholder:text-[var(--editorial-subtle)] shadow-sm hover:border-[var(--editorial-primary-ring)] focus-visible:border-[var(--ring)] focus-visible:outline-none"

/** Fixed-width combinator select (AND / OR divider button between rows). */
export const COMBINATOR_CLASS =
    "h-9 rounded-lg border-none bg-[var(--secondary)] px-3.5 text-[15px] font-medium text-[var(--foreground)] shadow-none hover:bg-[var(--accent)]"

/** "If the answer" row label. */
export const IF_LABEL_CLASS =
    "w-[90px] shrink-0 text-[15px] text-[var(--foreground)] whitespace-nowrap"

/** Amber-ish chip shown inside page selectors — icon + page number. */
const PAGE_CHIP_CLASS =
    "flex shrink-0 items-center gap-1.5 rounded-lg bg-[var(--editorial-primary-selected)] px-2 py-0.5 text-xs font-semibold text-[var(--editorial-primary)]"

/** Pill-style select trigger wrapper. */
export function Trigger({
    className,
    ...props
}: React.ComponentProps<typeof SelectTrigger>) {
    return <SelectTrigger {...props} className={cn(TRIGGER_CLASS, className)} />
}

/** Icon per comparison operator — shown in the operator trigger and items. */
export const OPERATOR_ICONS: Record<LogicOperator, LucideIcon> = {
    equals: Equal,
    notEquals: Slash,
    contains: Maximize2,
    notContains: Minimize2,
    greaterThan: Hash,
    greaterThanOrEquals: Hash,
    lessThan: Hash,
    lessThanOrEquals: Hash,
    isEmpty: CircleSlash,
    isNotEmpty: Circle,
}

function hexToRgba(hex: string, alpha: number): string {
    const clean = hex.replace("#", "");
    if (clean.length !== 6) return hex;
    const r = parseInt(clean.substring(0, 2), 16);
    const g = parseInt(clean.substring(2, 4), 16);
    const b = parseInt(clean.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/** Page-type chip — tinted, shows the page-type icon + page number matching icon color with low opacity. */
export function PageTypeChip({
    page,
    pageNumber,
}: {
    page: FormPage
    pageNumber: number
}) {
    const visual = PAGE_TYPE_VISUALS[page.type]
    const Icon = visual?.icon ?? PAGE_TYPE_ICONS[page.type]
    const iconHexColor = visual?.bgColor?.match(/#[0-9a-fA-F]{6}/)?.[0] ?? "#5da2f6"

    return (
        <span
            className="flex shrink-0 items-center gap-1.5 rounded-lg border px-2 py-0.5 text-xs font-semibold leading-none"
            style={{
                borderColor: hexToRgba(iconHexColor, 0.45),
                backgroundColor: hexToRgba(iconHexColor, 0.12),
                color: iconHexColor,
            }}
        >
            {Icon && <Icon className="h-3.5 w-3.5" aria-hidden />}
            P{pageNumber}
        </span>
    )
}

/** Trigger / item content for a page select: page-type chip, then title. */
export function PageSelectContent({
    page,
    pageNumber,
    placeholder,
}: {
    page?: FormPage
    pageNumber: number | null
    placeholder?: string
}) {
    const title = page?.title || page?.label || (pageNumber != null ? `Page ${pageNumber}` : placeholder)
    return (
        <span className="flex min-w-0 items-center gap-2 truncate">
            {pageNumber != null &&
                (page ? (
                    <PageTypeChip page={page} pageNumber={pageNumber} />
                ) : (
                    <span className={PAGE_CHIP_CLASS}>
                        <List className="h-3.5 w-3.5" aria-hidden />
                        P{pageNumber}
                    </span>
                ))}
            <span className="min-w-0 truncate">
                {title}
            </span>
        </span>
    )
}
