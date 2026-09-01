/**
 * Collapsible summary card for a saved logic rule.
 *
 * Collapsed: the rule's category plus the chip-based summary (RuleSummary).
 * Clicking the card — or its chevron — expands a readable, plain-language
 * preview (readableRuleParts): what the rule watches for, condition by
 * condition, and what it does — page references are compact pills that
 * truncate with "…" (hover shows the full page title), values as quiet pills.
 * Edit/delete stay hover-revealed on desktop and always visible on touch.
 */

import { useState } from "react";
import { ChevronDown, Pencil, Trash2 } from "lucide-react";
import type { FormLogicRule, FormPage } from "../../../shared/types/common";
import { SECTIONS } from "./logicEditorConfig";
import { readableRuleParts, ruleSummary } from "./ruleUtils";
import type { ReadableSegment } from "./ruleUtils";
import { RuleSummary } from "./RuleSummary";

interface RuleCardProps {
    rule: FormLogicRule
    /** All form pages — used for human-readable labels in the preview. */
    pages?: FormPage[]
    /** Briefly true when the dialog was opened focused on this rule. */
    highlighted?: boolean
    onEdit: () => void
    onDelete: () => void
}

/** Renders a readable sentence: truncated page pills, value pills, plain text. */
function ReadableSegments({ segments }: { segments: ReadableSegment[] }) {
    return (
        <>
            {segments.map((segment, index) => {
                if (segment.kind === "page") {
                    return (
                        <span
                            key={index}
                            title={segment.text}
                            className="inline-flex w-56 items-center overflow-hidden truncate rounded-md border border-[var(--border)] bg-[var(--secondary)] px-1.5 py-0.5 font-medium text-[var(--foreground)]"
                        >
                            {segment.text}
                        </span>
                    )
                }
                if (segment.kind === "value") {
                    return (
                        <span
                            key={index}
                            className="mx-0.5 inline-flex items-center rounded-md border border-[var(--border)] bg-[var(--secondary)] px-1.5 py-0.5 font-medium text-[var(--foreground)]"
                        >
                            {segment.text}
                        </span>
                    )
                }
                return <span key={index}>{segment.text}</span>
            })}
        </>
    )
}

export function RuleCard({
    rule,
    pages = [],
    highlighted = false,
    onEdit,
    onDelete,
}: RuleCardProps) {
    const [expanded, setExpanded] = useState(false)
    const section = SECTIONS.find((s) => s.category === rule.category)
    const SectionIcon = section?.icon
    const parts = readableRuleParts(rule, pages)

    const toggle = () => setExpanded((prev) => !prev)

    return (
        <li
            id={`logic-rule-${rule.id}`}
            className={`group flex flex-col gap-1 rounded-lg border bg-[var(--secondary)] px-3 py-2.5 text-[13px] editorial-transition ${
                highlighted
                    ? "border-[var(--editorial-primary-ring)] ring-2 ring-[var(--editorial-primary-ring)]"
                    : "border-[var(--border)]"
            }`}
        >
            <div className="flex items-start justify-between gap-2">
                {/* Click anywhere on the summary to expand the readable preview. */}
                <button
                    type="button"
                    onClick={toggle}
                    aria-expanded={expanded}
                    title={ruleSummary(rule, pages)}
                    className="min-w-0 flex-1 cursor-pointer text-left"
                >
                    <span className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--editorial-subtle)]">
                        {SectionIcon ? <SectionIcon className="h-3 w-3" /> : null}
                        {section?.title ?? "Rule"}
                    </span>
                    <RuleSummary rule={rule} pages={pages} />
                </button>

                <div className="flex shrink-0 items-center gap-1">
                    {/* Always visible on touch/mobile; hover-revealed on desktop. */}
                    <div className="flex items-center gap-1 md:opacity-0 md:transition-opacity md:group-hover:opacity-100 md:focus-within:opacity-100">
                        <button
                            type="button"
                            aria-label="Edit rule"
                            onClick={onEdit}
                            className="rounded bg-[var(--card)] p-1 text-[var(--editorial-subtle)] transition-colors hover:bg-[var(--secondary)] hover:text-[var(--foreground)] md:bg-transparent"
                        >
                            <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                            type="button"
                            aria-label="Delete rule"
                            onClick={onDelete}
                            className="rounded bg-[var(--card)] p-1 text-[var(--editorial-subtle)] transition-colors hover:bg-[var(--secondary)] hover:text-[var(--destructive)] md:bg-transparent"
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                        </button>
                    </div>
                    <button
                        type="button"
                        onClick={toggle}
                        aria-label={expanded ? "Hide rule details" : "Show rule details"}
                        aria-expanded={expanded}
                        className="editorial-transition rounded p-1 text-[var(--editorial-subtle)] hover:bg-[var(--card)] hover:text-[var(--foreground)]"
                    >
                        <ChevronDown
                            className={`h-4 w-4 transition-transform ${expanded ? "rotate-180" : ""}`}
                        />
                    </button>
                </div>
            </div>

            {/* Expandable readable preview */}
            {expanded && (
                <div className="mt-0.5 flex flex-col gap-2 rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2.5">
                    <p className="font-medium leading-relaxed text-[var(--foreground)]">
                        <ReadableSegments segments={parts.intro} />
                    </p>
                    {parts.conditions.length > 0 && (
                        <ul className="flex flex-col gap-1.5 border-l border-[var(--border)] pl-3">
                            {parts.conditions.map((condition, index) => (
                                <li
                                    key={index}
                                    className="leading-relaxed text-[var(--editorial-body)]"
                                >
                                    {condition.connective && (
                                        <span className="mr-1.5 inline-flex items-center rounded border border-[var(--border)] bg-[var(--secondary)] px-1 py-px align-middle text-[10px] font-semibold uppercase tracking-wide text-[var(--editorial-subtle)]">
                                            {condition.connective}
                                        </span>
                                    )}
                                    <ReadableSegments segments={condition.segments} />
                                </li>
                            ))}
                        </ul>
                    )}
                    {parts.outcome && (
                        <p className="leading-relaxed text-[var(--foreground)]">
                            <span className="mr-1 text-[var(--editorial-subtle)]">→</span>
                            <ReadableSegments segments={parts.outcome} />
                        </p>
                    )}
                </div>
            )}

            {rule.enabled === false && (
                <span className="text-[11px] font-medium uppercase tracking-wide text-[var(--editorial-subtle)]">
                    Disabled
                </span>
            )}
        </li>
    )
}
