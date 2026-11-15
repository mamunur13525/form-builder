import type { FormLogicRule, FormPage } from "../../../shared/types/common";
import { normalizeApiRule } from "./ruleUtils";

/**
 * Rules are keyed by category: display/hide rules target the page, branching
 * rules read from it, and calculation rules are owned by the page their
 * condition or expression references. Every rule shows on exactly ONE page so
 * the dialog only lists the selected page's rules.
 */
export function filterRulesForPage(
    rules: FormLogicRule[],
    selectedPage: FormPage,
    allPages: FormPage[],
): FormLogicRule[] {
    const ownerKeyOf = (rule: FormLogicRule): string | null => {
        const pageCondition = (rule.conditions ?? []).find(
            (c) => (!c.sourceType || c.sourceType === "page") && c.sourceKey,
        )
        const findPageKey = (key: string): string | null => {
            const found = allPages.find((p) => {
                if (p.pageKey === key) return true
                const qs = p.questions ?? p.blocks ?? []
                return qs.some((q) => (q.questionKey || q.blockKey || q._id || q.id) === key)
            })
            return found?.pageKey ?? null
        }

        if (rule.category === "branching") {
            if (pageCondition) {
                const pk = findPageKey(pageCondition.sourceKey)
                if (pk) return pk
            }
            // Variable-driven branch: owned by the page it jumps to.
            return (rule.actions ?? [])[0]?.targetPageKey ?? null
        }
        if (rule.category === "calculation") {
            if (pageCondition) {
                const pk = findPageKey(pageCondition.sourceKey)
                if (pk) return pk
            }
            // Fall back to the first referenced question/page in the expression.
            const expression = (rule.actions ?? [])[0]?.expression ?? ""
            const refs = Array.from(expression.matchAll(/@([\w-]+)/g)).map((m) => m[1])
            for (const ref of refs) {
                const pk = findPageKey(ref)
                if (pk) return pk
            }
            return null
        }
        return null
    }
    return rules
        .map(normalizeApiRule)
        .filter((rule: FormLogicRule) => {
            if (rule.category === "display" || rule.category === "hidePage") {
                return (rule.actions ?? []).some(
                    (a) => a.targetPageKey === selectedPage.pageKey,
                )
            }
            const owner = ownerKeyOf(rule)
            if (owner) return owner === selectedPage.pageKey
            // Rules with no page reference at all (e.g. a calculation from
            // pure variables) live on the first page of the form.
            return allPages[0]?.pageKey === selectedPage.pageKey
        })
}
