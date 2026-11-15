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

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import { useParams } from "react-router-dom";
import { Button } from "../../../components/ui/button";
import type {
    FormPage,
    FormVariable,
    FormLogicRule,
    LogicCategory,
} from "../../../shared/types/common";
import {
    useLogicRules,
} from "@/features/forms/hooks/useFormLogic";
import { SECTIONS } from "./logicEditorConfig";
import { normalizeApiRule, emptyRule, extractAllQuestions } from "./ruleUtils";
import { filterRulesForPage } from "./ruleOwners";
import { useRulePersistence } from "./useRulePersistence";
import { LogicEditorHeader } from "./LogicEditorHeader";
import { LogicRuleList } from "./LogicRuleList";
import { AddRuleFlow } from "./AddRuleFlow";

interface LogicEditorDialogProps {
    /**
     * The page pre-selected when the dialog opens (the canvas node that was
     * clicked), or null when closed. A different page is picked via the
     * dropdown at the top of the dialog.
     */
    page: FormPage | null
    /** Optional rule ID to immediately open for editing when the dialog launches. */
    initialRuleId?: string | null
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

function LogicEditorDialogComponent({
    page,
    initialRuleId,
    allPages,
    variables,
    onClose,
}: LogicEditorDialogProps) {
    const { formId } = useParams<{ formId: string }>()
    const open = page !== null && !!formId

    const { data: rules = [], isLoading: rulesLoading } = useLogicRules(formId ?? "")

    // The open rule editor (a new draft or a saved rule being edited) — null
    // when the list is idle.
    const [editor, setEditor] = useState<EditorState | null>(null)
    // Error from the last save/delete attempt — surfaced near the editor.
    const [saveError, setSaveError] = useState<string | null>(null)
    // The page whose rules are managed. Pre-selected from the `page` prop when
    // the dialog opens; switchable from the dropdown at the top.
    const [selectedPageKey, setSelectedPageKey] = useState<string>(page?.pageKey ?? "")

    const { saveRule, deleteRule } = useRulePersistence({ formId, rules, rulesLoading, setSaveError, setEditor })

    // Re-select the clicked page and drop any half-finished editor whenever
    // the dialog opens on a page (prop identity changes). Adjusted during
    // render — the React-recommended alternative to a prop-syncing effect.
    const [prevPage, setPrevPage] = useState<FormPage | null>(page)
    const [prevInitialRuleId, setPrevInitialRuleId] = useState<string | null | undefined>(initialRuleId)
    const [prevRules, setPrevRules] = useState(rules)
    if (page !== prevPage || initialRuleId !== prevInitialRuleId || rules !== prevRules) {
        setPrevPage(page)
        setPrevInitialRuleId(initialRuleId)
        setPrevRules(rules)
        setSaveError(null)
        if (page) setSelectedPageKey(page.pageKey)
        if (initialRuleId && rules.length > 0) {
            const ruleToEdit = rules.map(normalizeApiRule).find((r) => r.id === initialRuleId)
            if (ruleToEdit) {
                setEditor({
                    category: ruleToEdit.category,
                    rule: ruleToEdit,
                })
            } else if (page !== prevPage || initialRuleId !== prevInitialRuleId) {
                setEditor(null)
            }
        } else if (page !== prevPage || initialRuleId !== prevInitialRuleId) {
            setEditor(null)
        }
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

    const pageRules = useMemo(() => {
        if (!selectedPage) return [] as FormLogicRule[]
        return filterRulesForPage(rules, selectedPage, allPages)
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
        const allQs = extractAllQuestions(allPages)
        const firstQKey =
            allQs.find((q) => q.pageKey === selectedPage?.pageKey)?.questionKey ||
            selectedPage?.pageKey ||
            ""
        setEditor({
            category,
            rule: emptyRule(category, firstQKey, selectedPage?.pageKey ?? ""),
        })
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
                    className="editorial relative z-50 flex max-h-[94vh] min-h-[70vh] w-full max-w-4xl flex-col overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--card)] shadow-[0_24px_60px_rgba(0,0,0,0.18)] sm:max-h-[88vh]"
                    initial={{ opacity: 0, scale: 0.96, y: -12 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96, y: 12 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                >
                    {/* Header — eyebrow, page dropdown, close */}
                    <LogicEditorHeader
                        selectedPage={selectedPage}
                        allPages={allPages}
                        onSelectPage={handleSelectPage}
                        onClose={onClose}
                    />

                    {/* Body — every rule one by one, plus the add-rule flow */}
                    <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6">
                        <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
                            {/* Every saved rule on the selected page, one by one */}
                            <LogicRuleList
                                rulesLoading={rulesLoading}
                                pageRules={pageRules}
                                editingRule={editingRule}
                                editorOpen={editor !== null}
                                editorSection={editorSection}
                                saveError={saveError}
                                allPages={allPages}
                                selectedPageKey={selectedPage.pageKey}
                                variables={variables}
                                onUpdateEditor={(next) =>
                                    setEditor({ category: next.category, rule: next })
                                }
                                onSave={saveRule}
                                onDelete={deleteRule}
                                onEdit={editRule}
                                onCancelEditor={cancelEditor}
                            />

                            {!rulesLoading && (
                                <>
                                    {/* Add flow — pick a rule type first, then edit the draft */}
                                    <AddRuleFlow
                                        editor={editor}
                                        editorSection={editorSection}
                                        pageRulesCount={pageRules.length}
                                        allPages={allPages}
                                        selectedPageKey={selectedPage.pageKey}
                                        variables={variables}
                                        saveError={saveError}
                                        onSelectType={selectRuleType}
                                        onUpdateEditor={(next) =>
                                            setEditor({ category: next.category, rule: next })
                                        }
                                        onSave={saveRule}
                                        onCancel={cancelEditor}
                                    />

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
