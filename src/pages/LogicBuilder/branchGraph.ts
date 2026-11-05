/**
 * Pure helpers that turn a form's branching rules into the extra graph the
 * Logic Builder canvas draws on top of the default page-to-page flow.
 *
 * The canvas shows two kinds of connectors:
 *  - default flow: page i -> page i+1 (and the last page -> end page), drawn as
 *    straight horizontal connectors on a single row.
 *  - branch arcs: one per branching rule, from the page the rule reads to the
 *    page (or end) it jumps to. Forward jumps arc above the row, backward jumps
 *    arc below, so the row stays readable and the jumps stay legible.
 *
 * Branch links are computed statically — conditions are NOT evaluated — so every
 * possible jump is shown regardless of answers. This is an editor view, not a
 * respondent run.
 */

import type {
    EndPage,
    FormLogicRule,
    FormPage,
    LogicCondition,
    LogicOperator,
} from "@/shared/types/common"

/** Stable id for the (single) shown-on-submit end-page node. */
export const END_PAGE_NODE_ID = "end-page-0"

/** Stable id for a page, used for both nodes and edge endpoints. */
export function pageId(page: FormPage, index: number): string {
    return page._id ?? page.pageKey ?? `page-${index}`
}

/**
 * Handle ids shared by the nodes and the edges that connect them. `in`/`out`
 * are the default left/right flow handles; the four `b-*` handles anchor branch
 * arcs so they leave/enter from the top (forward) or bottom (backward) of a
 * card, clear of the straight default connectors.
 */
export const HANDLE = {
    in: "in",
    out: "out",
    srcTop: "b-src-top",
    tgtTop: "b-tgt-top",
    srcBottom: "b-src-bottom",
    tgtBottom: "b-tgt-bottom",
} as const

export type BranchDirection = "forward" | "backward"

export interface BranchLink {
    id: string
    /** The logic rule this arc represents (so a click can open it). */
    ruleId: string
    /** pageKey of the page that owns the rule (the arc's source page). */
    ownerKey: string
    sourceId: string
    targetId: string
    sourceIndex: number
    targetIndex: number
    direction: BranchDirection
    /** Compact trigger label shown on the arc, e.g. "if > 18" or a rule name. */
    label: string
}

/** Which branch handles a given node needs rendered. */
export interface BranchHandleFlags {
    srcTop?: boolean
    tgtTop?: boolean
    srcBottom?: boolean
    tgtBottom?: boolean
}

const OPERATOR_SYMBOLS: Record<LogicOperator, string> = {
    equals: "=",
    notEquals: "≠",
    contains: "contains",
    notContains: "excludes",
    greaterThan: ">",
    greaterThanOrEquals: "≥",
    lessThan: "<",
    lessThanOrEquals: "≤",
    isEmpty: "is empty",
    isNotEmpty: "is filled",
}

const truncate = (text: string, max = 14): string =>
    text.length > max ? `${text.slice(0, max - 1)}…` : text

/** One compact condition, e.g. `= Yes`, `> 18`, `is empty`. */
function describeCondition(c: LogicCondition): string {
    const symbol = OPERATOR_SYMBOLS[c.operator] ?? String(c.operator)
    if (c.operator === "isEmpty" || c.operator === "isNotEmpty") return symbol
    const value = truncate(String(c.value ?? "").trim())
    return value ? `${symbol} ${value}` : symbol
}

/**
 * A short label for a branch arc. Prefers the rule's own name; otherwise
 * summarizes the first condition (with `+N` when more conditions follow). The
 * arc starts at the page the condition reads, so the source is left implicit.
 */
export function shortConditionLabel(rule: FormLogicRule): string {
    if (rule.name && rule.name.trim()) return truncate(rule.name.trim(), 22)
    const conditions = (rule.conditions ?? []).filter((c) => c && c.sourceKey)
    if (conditions.length === 0) return "always"
    const first = `if ${describeCondition(conditions[0])}`
    return conditions.length > 1 ? `${first} +${conditions.length - 1}` : first
}

/**
 * Build the branch links for a form. `endPage` resolves `goToEnd` jumps to the
 * end-page node; when there is no end page those jumps are skipped (there is
 * nothing on the canvas to point at). Rules missing an owner page, a jump
 * action, or a valid target are skipped.
 */
export function computeBranchLinks(
    pages: FormPage[],
    endPage: EndPage | null,
    rules: FormLogicRule[],
): BranchLink[] {
    const indexByKey = new Map<string, number>()
    pages.forEach((p, i) => {
        if (p.pageKey) indexByKey.set(p.pageKey, i)
    })
    const idFor = (index: number) => pageId(pages[index], index)

    const links: BranchLink[] = []
    let seq = 0

    for (const rule of rules) {
        if (rule.category !== "branching") continue
        if (rule.enabled === false) continue

        // Owner = the page the first page-condition reads from.
        const ownerCondition = (rule.conditions ?? []).find(
            (c) =>
                c &&
                (!c.sourceType || c.sourceType === "page") &&
                c.sourceKey &&
                indexByKey.has(c.sourceKey),
        )
        const ownerKey = ownerCondition?.sourceKey
        if (!ownerKey) continue
        const sourceIndex = indexByKey.get(ownerKey)!

        const action = (rule.actions ?? []).find(
            (a) => a && (a.action === "jumpToPage" || a.action === "goToEnd"),
        )
        if (!action) continue

        let targetId: string
        let targetIndex: number
        if (action.action === "goToEnd") {
            if (!endPage) continue // nothing to point at
            targetId = END_PAGE_NODE_ID
            targetIndex = pages.length // the end node sits after the last page
        } else {
            const targetKey = action.targetPageKey
            if (!targetKey || !indexByKey.has(targetKey) || targetKey === ownerKey) continue
            targetIndex = indexByKey.get(targetKey)!
            targetId = idFor(targetIndex)
        }

        links.push({
            id: `branch-${rule.id ?? "rule"}-${seq}`,
            ruleId: rule.id ?? "",
            ownerKey,
            sourceId: idFor(sourceIndex),
            targetId,
            sourceIndex,
            targetIndex,
            direction: targetIndex > sourceIndex ? "forward" : "backward",
            label: shortConditionLabel(rule),
        })
        seq += 1
    }

    return links
}

/** Collect, per node id, which branch handles must be rendered. */
export function branchHandleFlags(links: BranchLink[]): Map<string, BranchHandleFlags> {
    const flags = new Map<string, BranchHandleFlags>()
    const ensure = (id: string): BranchHandleFlags => {
        const existing = flags.get(id)
        if (existing) return existing
        const created: BranchHandleFlags = {}
        flags.set(id, created)
        return created
    }
    for (const link of links) {
        if (link.direction === "forward") {
            ensure(link.sourceId).srcTop = true
            ensure(link.targetId).tgtTop = true
        } else {
            ensure(link.sourceId).srcBottom = true
            ensure(link.targetId).tgtBottom = true
        }
    }
    return flags
}
