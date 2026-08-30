/**
 * Logic editor dialog — the two-pane container.
 *
 * Opened from the Logic Builder canvas. Left pane: every form page (click to
 * switch). Right pane: a four-tab switcher mapping one-to-one onto the rule
 * categories the backend supports — Display, Hide page, Branching and
 * Calculations. Only the active tab's rules are shown. Each rule combines
 * multiple conditions with AND/OR and persists through the form-level logic
 * API (useLogicRules + mutations).
 *
 * Split across: ./logicEditorConfig (static config), ./ruleUtils (helpers),
 * ./RuleEditor (single-rule editor), ./RuleCard (read-only rule summary).
 */

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Workflow, Plus } from "lucide-react";
import { useParams } from "react-router-dom";
import { Button } from "../../../components/ui/button";
import { PAGE_TYPE_ICONS } from "../../../shared/constants/form-types";
import type {
    FormPage,
    FormVariable,
    FormLogicRule,
    LogicCategory,
} from "../../../shared/types/common";
import {
    useLogicRules,
    useCreateLogic,
    useUpdateLogicRule,
    useDeleteLogicRule,
} from "@/features/forms/hooks/useFormLogic";
import { SECTIONS } from "./logicEditorConfig";
import { normalizeApiRule, emptyRule } from "./ruleUtils";
import { RuleEditor } from "./RuleEditor";
import { RuleCard } from "./RuleCard";

interface LogicEditorDialogProps {
    /**
     * The page pre-selected when the dialog opens (the canvas node that was
     * clicked), or null when closed. The user can switch pages inside the
     * dialog via the left-hand page list.
     */
    page: FormPage | null
    /** All form pages (for source / target picks), in form order. */
    allPages: FormPage[]
    /** Form variables (from settings), shown in condition/calculation picks. */
    variables: FormVariable[]
    /**
     * Rule to reveal and briefly highlight when the dialog opens — e.g. when a
     * branch-arc label was clicked on the canvas. Null for a plain page open.
     */
    focusRuleId?: string | null
    /** Category tab to switch to on open (paired with `focusRuleId`). */
    focusCategory?: LogicCategory | null
    /** Explicit close handler — the only way the dialog closes. */
    onClose: () => void
}

function LogicEditorDialogComponent({
    page,
    allPages,
    variables,
    focusRuleId,
    focusCategory,
    onClose,
}: LogicEditorDialogProps) {
    const { formId } = useParams<{ formId: string }>()
    const open = page !== null && !!formId

    const { data: rules = [], isLoading: rulesLoading } = useLogicRules(formId ?? "")
    const createMutation = useCreateLogic()
    const updateMutation = useUpdateLogicRule()
    const deleteMutation = useDeleteLogicRule()

    // One rule being edited per session (could be a fresh draft).
    const [editing, setEditing] = useState<FormLogicRule | null>(null)
    // Error from the last save/delete attempt — surfaced next to the Save button.
    const [saveError, setSaveError] = useState<string | null>(null)
    // The page whose rules are shown in the right pane. Pre-selected from the
    // `page` prop when the dialog opens; the user can switch from the list.
    const [selectedPageKey, setSelectedPageKey] = useState<string>(page?.pageKey ?? "")
    // Which category tab is visible in the right pane. Sticky across page
    // switches; each tab's count badge shows which other tabs hold rules.
    const [activeCategory, setActiveCategory] = useState<LogicCategory>(SECTIONS[0].category)
    // Rule to briefly highlight (e.g. when opened from a branch-arc label).
    const [highlightRuleId, setHighlightRuleId] = useState<string | null>(null)

    // Re-select the clicked page (and reset transient state) on every open.
    useEffect(() => {
        if (page) {
            setSelectedPageKey(page.pageKey)
            setEditing(null)
            setSaveError(null)
        }
    }, [page])

    // When opened focused on a rule (e.g. a branch-arc label was clicked),
    // switch to its category tab and mark it for highlighting; otherwise clear
    // any stale highlight.
    useEffect(() => {
        if (!open) return
        if (focusCategory) setActiveCategory(focusCategory)
        if (focusRuleId) {
            setHighlightRuleId(focusRuleId)
            setEditing(null)
        } else {
            setHighlightRuleId(null)
        }
    }, [open, focusRuleId, focusCategory])

    const selectedPage = useMemo<FormPage | null>(
        () =>
            allPages.find((p) => p.pageKey === selectedPageKey) ??
            page ??
            allPages[0] ??
            null,
        [allPages, selectedPageKey, page],
    )
    const selectedIndex = selectedPage
        ? allPages.findIndex((p) => p.pageKey === selectedPage.pageKey)
        : -1

    const handleSelectPage = (pageKey: string) => {
        if (pageKey === selectedPage?.pageKey) return
        setSelectedPageKey(pageKey)
        setEditing(null)
        setSaveError(null)
        setHighlightRuleId(null)
    }

    // Rules are keyed by category: display/hide rules target the page,
    // branching rules read from it, and calculation rules are owned by the
    // page their condition or expression references. Every rule shows on
    // exactly ONE page so the dialog only lists the selected page's rules.
    const pageRules = useMemo(() => {
        if (!selectedPage) return [] as FormLogicRule[]
        const ownerKeyOf = (rule: FormLogicRule): string | null => {
            const pageCondition = (rule.conditions ?? []).find(
                (c) => (!c.sourceType || c.sourceType === "page") && c.sourceKey,
            )
            if (rule.category === "branching") {
                if (pageCondition) return pageCondition.sourceKey
                // Variable-driven branch: owned by the page it jumps to.
                return (rule.actions ?? [])[0]?.targetPageKey ?? null
            }
            if (rule.category === "calculation") {
                if (pageCondition) return pageCondition.sourceKey
                // Fall back to the first @pageKey referenced in the expression.
                const expression = (rule.actions ?? [])[0]?.expression ?? ""
                const refs = Array.from(expression.matchAll(/@([\w-]+)/g)).map((m) => m[1])
                return refs.find((ref) => allPages.some((p) => p.pageKey === ref)) ?? null
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
    }, [selectedPage, rules, allPages])

    // Once the focused rule is on screen, scroll it into view.
    useEffect(() => {
        if (!open || !highlightRuleId) return
        const el = document.getElementById(`logic-rule-${highlightRuleId}`)
        el?.scrollIntoView({ block: "nearest", behavior: "smooth" })
    }, [open, highlightRuleId, activeCategory, pageRules])

    const rulesBySection = (category: LogicCategory): FormLogicRule[] =>
        pageRules.filter((rule) => rule.category === category)

    const activeSection =
        SECTIONS.find((s) => s.category === activeCategory) ?? SECTIONS[0]
    const activeSectionRules = rulesBySection(activeSection.category)
    const isEditingActive =
        editing !== null && editing.category === activeSection.category

    const selectTab = (category: LogicCategory): void => {
        if (category === activeCategory) return
        setActiveCategory(category)
        // Drop any half-finished draft so it can't linger on a now-hidden tab.
        setEditing(null)
        setSaveError(null)
        setHighlightRuleId(null)
    }

    const saveRule = async (rule: FormLogicRule) => {
        if (!formId) return
        // Do not persist incomplete rules — keep the editor open.
        const missing = (rule.conditions ?? []).some((c) => !c.sourceKey || !c.operator)
        if (missing) return
        const action = (rule.actions ?? [])[0]
        // A calculation is complete when it has a target and either an operation
        // with a filled operand (current model) or a legacy expression.
        const calcInvalid =
            action?.action === "setVariable" &&
            (() => {
                if (!action.variableName) return true
                if (action.operation) {
                    const raw = String(action.value ?? "").trim()
                    return raw === "" || raw === "@"
                }
                return !(typeof action.expression === "string" && action.expression.trim())
            })()
        if ((action?.action === "jumpToPage" && !action.targetPageKey) || calcInvalid) {
            return
        }
        const isNew = rule.id.startsWith("draft-")
        const common = {
            category: rule.category,
            name: rule.name,
            enabled: rule.enabled,
            combinator: rule.combinator,
            conditions: (rule.conditions ?? []).map((c) => ({
                sourceType: c.sourceType,
                sourceKey: c.sourceKey,
                operator: c.operator,
                value: c.value,
                combinator: c.combinator,
            })),
            actions: (rule.actions ?? []).map((a) => ({
                action: a.action,
                targetPageKey: a.targetPageKey,
                variableName: a.variableName,
                operation: a.operation,
                expression: a.expression,
                value: a.value,
            })),
        }
        try {
            setSaveError(null)
            if (isNew) {
                await createMutation.mutateAsync({ formId, data: common })
            } else {
                await updateMutation.mutateAsync({ formId, logicId: rule.id, data: common })
            }
            // Only close the editor once the rule is actually persisted.
            setEditing(null)
        } catch (err) {
            setSaveError(
                err instanceof Error ? err.message : "Could not save the rule. Please try again.",
            )
        }
    }

    const deleteRule = async (ruleId: string) => {
        if (!formId) return
        try {
            setSaveError(null)
            await deleteMutation.mutateAsync({ formId, logicId: ruleId })
        } catch (err) {
            setSaveError(
                err instanceof Error ? err.message : "Could not delete the rule. Please try again.",
            )
        }
    }

    if (!open || !selectedPage) return null

    return (
        <AnimatePresence>
            <div
                className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4"
                role="dialog"
                aria-modal="true"
                aria-label="Edit form logic"
            >
                <motion.div
                    className="fixed inset-0 bg-black/50"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                />

                <motion.div
                    className="editorial relative z-50 flex max-h-[94vh] min-h-[70vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-[0_24px_60px_rgba(0,0,0,0.18)] sm:max-h-[88vh]"
                    initial={{ opacity: 0, scale: 0.96, y: -12 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96, y: 12 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3 border-b border-[var(--editorial-border-light)] px-4 py-4 sm:px-6">
                        <div className="flex min-w-0 flex-col gap-0.5">
                            <span className="editorial-eyebrow text-[var(--editorial-subtle)]">
                                Logic builder
                            </span>
                            <h2 className="truncate font-display text-base text-[var(--foreground)] sm:text-lg">
                                Page {String(selectedIndex + 1).padStart(2, "0")} ·{" "}
                                {selectedPage.label || "Untitled page"}
                            </h2>
                        </div>
                        <button
                            type="button"
                            aria-label="Close"
                            onClick={onClose}
                            className="editorial-transition flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[var(--editorial-subtle)] hover:bg-[var(--secondary)] hover:text-[var(--foreground)]"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    {/* Two-pane body — side by side on desktop, stacked on mobile */}
                    <div className="flex min-h-0 flex-1 flex-col md:flex-row">
                        {/* Left: page list (horizontal chips on mobile, sidebar on desktop) */}
                        <aside className="shrink-0 border-b border-[var(--editorial-border-light)] p-3 md:w-60 md:border-b-0 md:border-r">
                            <p className="hidden px-2 pb-2 text-[11px] font-semibold uppercase tracking-wide text-[var(--editorial-subtle)] md:block">
                                Pages
                            </p>
                            <ul className="flex gap-1 overflow-x-auto pb-1 md:flex-col md:gap-1 md:overflow-x-visible md:pb-0">
                                {allPages.map((p, index) => {
                                    const PageIcon = PAGE_TYPE_ICONS[p.type] ?? Workflow
                                    const isSelected = p.pageKey === selectedPage.pageKey
                                    return (
                                        <li key={p.pageKey} className="shrink-0 md:w-full">
                                            <button
                                                type="button"
                                                onClick={() => handleSelectPage(p.pageKey)}
                                                className={`flex w-full items-center gap-2 whitespace-nowrap rounded-lg px-2.5 py-2 text-left text-[13px] transition-colors ${isSelected
                                                    ? "bg-[var(--editorial-primary-selected)] font-medium text-[var(--primary)]"
                                                    : "text-[var(--foreground)] hover:bg-[var(--secondary)]"
                                                    }`}
                                            >
                                                <span className="hidden w-5 shrink-0 text-[11px] text-[var(--editorial-subtle)] md:block">
                                                    {String(index + 1).padStart(2, "0")}
                                                </span>
                                                <PageIcon className="h-3.5 w-3.5 shrink-0" />
                                                <span className="max-w-[180px] truncate md:max-w-none">
                                                    {p.label || "Untitled page"}
                                                </span>
                                            </button>
                                        </li>
                                    )
                                })}
                            </ul>
                        </aside>

                        {/* Right: logic sections for the selected page */}
                        <div className="min-w-0 flex-1 overflow-y-auto p-4 sm:p-5">
                            {rulesLoading ? (
                                <div className="flex items-center justify-center py-12 text-sm text-[var(--editorial-subtle)]">
                                    Loading rules…
                                </div>
                            ) : (
                                <>
                                    {/* Category tabs */}
                                    <div
                                        role="tablist"
                                        aria-label="Rule categories"
                                        className="mb-4 w-full flex gap-1 border-b border-[var(--border)]"
                                    >
                                        {SECTIONS.map((section) => {
                                            const SectionIcon = section.icon
                                            const count = rulesBySection(section.category).length
                                            const isActive = section.category === activeCategory
                                            return (
                                                <button
                                                    key={section.category}
                                                    type="button"
                                                    role="tab"
                                                    aria-selected={isActive}
                                                    onClick={() => selectTab(section.category)}
                                                    className={`flex-1 cursor-pointer -mb-px flex shrink-0 items-center gap-1.5 whitespace-nowrap border-b-2 px-3 py-2 text-[13px] transition-colors ${isActive
                                                        ? "border-[var(--primary)] font-semibold text-[var(--foreground)]"
                                                        : "border-transparent font-medium text-[var(--editorial-subtle)] hover:text-[var(--foreground)]"
                                                        }`}
                                                >
                                                    <SectionIcon className="h-4 w-4 shrink-0" />
                                                    {section.title}
                                                    {count > 0 && (
                                                        <span
                                                            className={`rounded-md px-1.5 py-0.5 text-[11px] font-medium ${isActive
                                                                ? "bg-[var(--editorial-primary-selected)] text-[var(--primary)]"
                                                                : "bg-[var(--secondary)] text-[var(--editorial-subtle)]"
                                                                }`}
                                                        >
                                                            {count}
                                                        </span>
                                                    )}
                                                </button>
                                            )
                                        })}
                                    </div>

                                    {/* Active tab panel */}
                                    <motion.div
                                        key={activeSection.category}
                                        role="tabpanel"
                                        initial={{ opacity: 0, y: 4 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.15, ease: "easeOut" }}
                                        className="flex flex-col gap-2"
                                    >
                                        <p className="text-xs leading-relaxed text-[var(--editorial-subtle)]">
                                            {activeSection.description}
                                        </p>

                                        {activeSectionRules.length > 0 ? (
                                            <ul className="flex flex-col gap-2">
                                                {activeSectionRules.map((rule) => (
                                                    <RuleCard
                                                        key={rule.id}
                                                        rule={rule}
                                                        highlighted={rule.id === highlightRuleId}
                                                        onEdit={() =>
                                                            setEditing({
                                                                ...rule,
                                                                conditions: rule.conditions ?? [],
                                                                actions: rule.actions ?? [],
                                                            })
                                                        }
                                                        onDelete={() => deleteRule(rule.id)}
                                                    />
                                                ))}
                                            </ul>
                                        ) : !isEditingActive ? (
                                            <div className="rounded-lg border border-dashed border-[var(--border)] bg-[var(--secondary)] px-4 py-3 text-[13px] text-[var(--editorial-subtle)]">
                                                No rules on this tab yet.
                                            </div>
                                        ) : null}
                                        {!isEditingActive && !editing && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setEditing(
                                                        emptyRule(
                                                            activeSection.category,
                                                            selectedPage.pageKey,
                                                        ),
                                                    )
                                                }
                                                className="flex w-fit items-center gap-1 text-[13px] font-medium text-[var(--primary)] hover:underline"
                                            >
                                                <Plus className="h-3.5 w-3.5" /> Add{" "}
                                                {activeSection.title.toLowerCase()} rule
                                            </button>
                                        )}
                                        {isEditingActive && editing && (
                                            <RuleEditor
                                                rule={editing}
                                                section={activeSection}
                                                pages={allPages}
                                                selectedPageKey={selectedPage.pageKey}
                                                variables={variables}
                                                onUpdate={(next) => setEditing(next)}
                                                onSave={(next) => saveRule(next)}
                                                error={saveError}
                                                onCancel={() => setEditing(null)}
                                            />
                                        )}
                                    </motion.div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end gap-2 border-t border-[var(--editorial-border-light)] px-4 py-3 sm:px-6">
                        <Button variant="outline" size="sm" onClick={onClose}>
                            Done
                        </Button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    )
}

export const LogicEditorDialog = LogicEditorDialogComponent
