/**
 * Logic editor dialog — single-pane rule manager.
 *
 * Opened from the Logic Builder canvas. A dropdown at the top picks which
 * page's rules are managed. Below it, every saved rule on that page is listed
 * one by one — no sidebar, no category tabs and no grouped sections. A single
 * centered "Add rule" button at the bottom opens a rule editor: it first
 * asks for the rule type via a dropdown (Display page / Hide page / Page
 * branching / Calculations), then shows the matching editor where conditions,
 * values and the type-specific action are filled in. Editing a saved rule
 * opens the same editor for it. Each rule combines multiple conditions with
 * AND/OR and persists through the form-level logic API (useLogicRules +
 * mutations).
 *
 * Split across: ./logicEditorConfig (static config), ./ruleUtils (helpers),
 * ./RuleEditor (single-rule editor), ./RuleCard (read-only rule summary).
 */

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus } from "lucide-react";
import { useParams } from "react-router-dom";
import { Button } from "../../../components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../../../components/ui/select";
import {
    PAGE_TYPE_COLORS,
    PAGE_TYPE_ICONS,
} from "../../../shared/constants/form-types";
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
import { getLogicRules } from "@/entities/form/api/logic.api";
import { useFormStore } from "@/app/store/formStore";
import { SECTIONS } from "./logicEditorConfig";
import { normalizeApiRule, emptyRule } from "./ruleUtils";
import { RuleEditor } from "./RuleEditor";
import { RuleCard } from "./RuleCard";

interface LogicEditorDialogProps {
    /**
     * The page pre-selected when the dialog opens (the canvas node that was
     * clicked), or null when closed. A different page is picked via the
     * dropdown at the top of the dialog.
     */
    page: FormPage | null
    /** All form pages (for source / target picks), in form order. */
    allPages: FormPage[]
    /** Form variables (from settings), shown in condition/calculation picks. */
    variables: FormVariable[]
    /** Explicit close handler — the only way the dialog closes. */
    onClose: () => void
}

/**
 * The rule editor open below the rule list. While `rule` is null the user
 * still has to pick the rule type from the dropdown; `category` carries the
 * picked / edited type so the matching editor config can be resolved.
 */
interface EditorState {
    category: LogicCategory | null
    rule: FormLogicRule | null
}

/** Tinted page-type chip — icon + page number, used in page select items. */
function PageTypeChip({ page, pageNumber }: { page: FormPage; pageNumber: number }) {
    const Icon = PAGE_TYPE_ICONS[page.type]
    if (!Icon) return null
    return (
        <span
            className={`flex shrink-0 items-center gap-1.5 rounded-md bg-gradient-to-br px-2 py-0.5 text-xs font-semibold ${PAGE_TYPE_COLORS[page.type]}`}
        >
            <Icon className="h-3.5 w-3.5" aria-hidden />
            Q{pageNumber}
        </span>
    )
}

function LogicEditorDialogComponent({
    page,
    allPages,
    variables,
    onClose,
}: LogicEditorDialogProps) {
    const { formId } = useParams<{ formId: string }>()
    const open = page !== null && !!formId

    const { data: rules = [], isLoading: rulesLoading } = useLogicRules(formId ?? "")
    const createMutation = useCreateLogic()
    const updateMutation = useUpdateLogicRule()
    const deleteMutation = useDeleteLogicRule()
    // The preview reads its rules from the form store, so after any rule
    // mutation the store is re-synced with the freshly saved rules.
    const setLogicRules = useFormStore((s) => s.setLogicRules)

    // Keep the store hydrated whenever the rules load, so opening the dialog
    // alone is enough for the preview to reflect the current rules.
    useEffect(() => {
        if (formId && !rulesLoading) setLogicRules(formId, rules)
    }, [formId, rules, rulesLoading, setLogicRules])

    // The open rule editor (a new draft or a saved rule being edited) — null
    // when the list is idle.
    const [editor, setEditor] = useState<EditorState | null>(null)
    // Error from the last save/delete attempt — surfaced near the editor.
    const [saveError, setSaveError] = useState<string | null>(null)
    // The page whose rules are managed. Pre-selected from the `page` prop when
    // the dialog opens; switchable from the dropdown at the top.
    const [selectedPageKey, setSelectedPageKey] = useState<string>(page?.pageKey ?? "")

    // Re-select the clicked page and drop any half-finished editor whenever
    // the dialog opens on a page (prop identity changes). Adjusted during
    // render — the React-recommended alternative to a prop-syncing effect.
    const [prevPage, setPrevPage] = useState<FormPage | null>(page)
    if (page !== prevPage) {
        setPrevPage(page)
        setEditor(null)
        setSaveError(null)
        if (page) setSelectedPageKey(page.pageKey)
    }

    const selectedPage = useMemo<FormPage | null>(
        () =>
            allPages.find((p) => p.pageKey === selectedPageKey) ??
            page ??
            allPages[0] ??
            null,
        [allPages, selectedPageKey, page],
    )

    const handleSelectPage = (pageKey: string) => {
        if (pageKey === selectedPage?.pageKey) return
        setSelectedPageKey(pageKey)
        setEditor(null)
        setSaveError(null)
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

    // Editor config for the category being added/edited (drives the action row).
    const editorSection =
        editor && editor.rule !== null && editor.category
            ? SECTIONS.find((s) => s.category === editor.category) ?? null
            : null

    // The saved rule currently being edited in place in the list — null while
    // idle or during the add-rule flow (which always edits a fresh draft at
    // the bottom instead). Rules before and after it stay in view.
    const editingRule =
        editor !== null && editor.rule !== null && !editor.rule.id.startsWith("draft-")
            ? editor.rule
            : null

    // Centered "Add rule" — opens the editor with the type dropdown first.
    const startAdding = () => {
        setSaveError(null)
        setEditor({ category: null, rule: null })
    }

    // Rule type picked from the dropdown — open a fresh editor for it.
    const selectRuleType = (category: LogicCategory) => {
        setSaveError(null)
        setEditor({ category, rule: emptyRule(category, selectedPage?.pageKey ?? "") })
    }

    // Edit a saved rule from its card — same editor, type already known.
    const editRule = (rule: FormLogicRule) => {
        setSaveError(null)
        setEditor({
            category: rule.category,
            rule: { ...rule, conditions: rule.conditions ?? [], actions: rule.actions ?? [] },
        })
    }

    const cancelEditor = () => {
        setEditor(null)
        setSaveError(null)
    }

    const saveRule = async (rule: FormLogicRule) => {
        if (!formId) return
        // Do not persist incomplete rules — keep the editor open.
        const missing = (rule.conditions ?? []).some((c) => !c.sourceKey || !c.operator)
        if (missing) {
            setSaveError(
                "This rule is incomplete — pick a source and operator for every condition.",
            )
            return
        }
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
            setSaveError("This rule is incomplete — finish the action before saving.")
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
            // Sync the form store so the preview picks up the new rules.
            setLogicRules(formId, await getLogicRules(formId))
            // Only close the editor once the rule is actually persisted.
            setEditor(null)
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
            // Sync the form store so the preview drops the deleted rule.
            setLogicRules(formId, await getLogicRules(formId))
            // If the deleted rule was open in the in-place editor, close it.
            setEditor((prev) => (prev?.rule && prev.rule.id === ruleId ? null : prev))
        } catch (err) {
            setSaveError(
                err instanceof Error
                    ? err.message
                    : "Could not delete the rule. Please try again.",
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
                    {/* Header — eyebrow, page dropdown, close */}
                    <div className="flex items-start justify-between gap-3 border-b border-[var(--editorial-border-light)] px-4 py-3 sm:px-6 sm:py-4">
                        <div className="flex min-w-0 flex-1 flex-col gap-2">
                            <div className="flex w-full max-w-sm mx-auto flex-col gap-1">
                                <label
                                    htmlFor="logic-builder-page-select"
                                    className="text-[11px] text-center font-semibold uppercase tracking-wide text-[var(--editorial-subtle)]"
                                >
                                    Select page
                                </label>
                                <Select
                                    value={selectedPage.pageKey}
                                    onValueChange={(v) => {
                                        if (v) handleSelectPage(v)
                                    }}
                                >
                                    <SelectTrigger
                                        id="logic-builder-page-select"
                                        size="sm"
                                        aria-label="Select page"
                                        className="w-full rounded-lg border-[var(--input)] bg-[var(--card)] px-3.5 text-[15px] shadow-sm hover:border-[var(--editorial-primary-ring)]"
                                    >
                                        <SelectValue>
                                            <span className="flex min-w-0 items-center gap-2 truncate">
                                                <PageTypeChip
                                                    page={selectedPage}
                                                    pageNumber={
                                                        allPages.findIndex(
                                                            (p) =>
                                                                p.pageKey ===
                                                                selectedPage.pageKey,
                                                        ) + 1
                                                    }
                                                />
                                                <span className="truncate">
                                                    {selectedPage.label || "Untitled page"}
                                                </span>
                                            </span>
                                        </SelectValue>
                                    </SelectTrigger>
                                    <SelectContent className="editorial">
                                        {allPages.map((p, index) => (
                                            <SelectItem key={p.pageKey} value={p.pageKey}>
                                                <span className="flex items-center gap-2">
                                                    <PageTypeChip page={p} pageNumber={index + 1} />
                                                    <span className="truncate">
                                                        {p.label || "Untitled page"}
                                                    </span>
                                                </span>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
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

                    {/* Body — every rule one by one, plus the add-rule flow */}
                    <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6">
                        {rulesLoading ? (
                            <div className="flex items-center justify-center py-12 text-sm text-[var(--editorial-subtle)]">
                                Loading rules…
                            </div>
                        ) : (
                            <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
                                {/* Every saved rule on the selected page, one by one */}
                                {pageRules.length > 0 ? (
                                    <ul className="flex flex-col gap-6">
                                        {/* Editing opens the editor on the rule itself, so
                                            the rules before and after it stay in view. */}
                                        {pageRules.map((rule, ruleIndex) =>
                                            editingRule && editingRule.id === rule.id ? (
                                                <li key={rule.id}>
                                                    <RuleEditor
                                                        rule={editingRule}
                                                        section={editorSection ?? SECTIONS[0]}
                                                        pages={allPages}
                                                        selectedPageKey={selectedPage.pageKey}
                                                        variables={variables}
                                                        index={ruleIndex + 1}
                                                        onUpdate={(next) =>
                                                            setEditor({
                                                                category: next.category,
                                                                rule: next,
                                                            })
                                                        }
                                                        onSave={saveRule}
                                                        error={saveError}
                                                        onCancel={cancelEditor}
                                                    />
                                                </li>
                                            ) : (
                                                <RuleCard
                                                    key={rule.id}
                                                    rule={rule}
                                                    index={ruleIndex + 1}
                                                    pages={allPages}
                                                    onEdit={() => editRule(rule)}
                                                    onDelete={() => deleteRule(rule.id)}
                                                />
                                            ),
                                        )}
                                    </ul>
                                ) : !editor ? (
                                    <div className="rounded-xl border border-dashed border-[var(--editorial-border-light)] bg-[var(--secondary)] px-4 py-6 text-center text-[15px] text-[var(--editorial-subtle)]">
                                        No rules on this page yet.
                                    </div>
                                ) : null}

                                {/* Add flow — pick a rule type first, then edit the draft */}
                                {editor && !editingRule &&
                                    (editor.rule === null ? (
                                        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-dashed border-[var(--editorial-primary-ring)] bg-[var(--secondary)] px-4 py-3">
                                            <span className="text-[15px] font-semibold text-[var(--foreground)]">
                                                What you want
                                            </span>
                                            <Select
                                                onValueChange={(v) => {
                                                    if (v) selectRuleType(v as LogicCategory)
                                                }}
                                            >
                                                <SelectTrigger
                                                    aria-label="Rule type"
                                                    className="h-11 w-full rounded-xl border-[var(--input)] bg-[var(--card)] px-4 text-[15px] font-medium text-[var(--foreground)] hover:border-[var(--editorial-primary-ring)] sm:w-72 data-placeholder:text-[var(--editorial-subtle)]"
                                                >
                                                    <SelectValue placeholder="Select rule type…" />
                                                </SelectTrigger>
                                                <SelectContent className="editorial">
                                                    {SECTIONS.map((s) => (
                                                        <SelectItem
                                                            key={s.category}
                                                            value={s.category}
                                                        >
                                                            {s.title}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <button
                                                type="button"
                                                onClick={cancelEditor}
                                                className="ml-auto rounded-lg px-2 py-1 text-[15px] font-medium text-[var(--editorial-subtle)] hover:bg-[var(--secondary)] hover:text-[var(--foreground)]"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    ) : editorSection ? (
                                        <RuleEditor
                                            rule={editor.rule}
                                            section={editorSection}
                                            pages={allPages}
                                            selectedPageKey={selectedPage.pageKey}
                                            variables={variables}
                                            index={pageRules.length + 1}
                                            onUpdate={(next) =>
                                                setEditor({ category: next.category, rule: next })
                                            }
                                            onSave={saveRule}
                                            error={saveError}
                                            onCancel={cancelEditor}
                                        />
                                    ) : null)}

                                {/* Save/delete error with no editor open */}
                                {saveError && !editor && (
                                    <p className="text-sm font-medium text-[var(--destructive)]">
                                        {saveError}
                                    </p>
                                )}

                                {/* Centered add-rule button */}
                                {!editor && (
                                    <div className="flex justify-center pt-1">
                                        <Button
                                            type="button"
                                            onClick={startAdding}
                                            variant={'outline'}
                                            className={'text-sm'}
                                        >
                                            <Plus className="h-4! w-4!" /> Add new rule
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}
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
