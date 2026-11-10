import type { FormLogicRule, FormPage, FormVariable } from "../../../shared/types/common";
import { SECTIONS, type SectionConfig } from "./logicEditorConfig";
import { RuleEditor } from "./RuleEditor";
import { RuleCard } from "./RuleCard";

interface LogicRuleListProps {
    rulesLoading: boolean;
    pageRules: FormLogicRule[];
    editingRule: FormLogicRule | null;
    editorOpen: boolean;
    editorSection: SectionConfig | null;
    saveError: string | null;
    allPages: FormPage[];
    selectedPageKey: string;
    variables: FormVariable[];
    onUpdateEditor: (rule: FormLogicRule) => void;
    onSave: (rule: FormLogicRule) => void;
    onDelete: (ruleId: string) => void;
    onEdit: (rule: FormLogicRule) => void;
    onCancelEditor: () => void;
}

/** Saved rules on the selected page, one card/editor at a time. */
export function LogicRuleList({
    rulesLoading,
    pageRules,
    editingRule,
    editorOpen,
    editorSection,
    saveError,
    allPages,
    selectedPageKey,
    variables,
    onUpdateEditor,
    onSave,
    onDelete,
    onEdit,
    onCancelEditor,
}: LogicRuleListProps) {
    if (rulesLoading) {
        return (
            <div className="flex items-center justify-center py-12 text-sm text-[var(--editorial-subtle)]">
                Loading rules…
            </div>
        )
    }

    if (pageRules.length > 0) {
        return (
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
                                selectedPageKey={selectedPageKey}
                                variables={variables}
                                index={ruleIndex + 1}
                                onUpdate={onUpdateEditor}
                                onSave={onSave}
                                onDelete={() => onDelete(editingRule.id)}
                                error={saveError}
                                onCancel={onCancelEditor}
                            />
                        </li>
                    ) : (
                        <RuleCard
                            key={rule.id}
                            rule={rule}
                            index={ruleIndex + 1}
                            pages={allPages}
                            onEdit={() => onEdit(rule)}
                            onDelete={() => onDelete(rule.id)}
                        />
                    ),
                )}
            </ul>
        )
    }

    if (editorOpen) return null

    return (
        <div className="rounded-lg border border-dashed border-[var(--editorial-border-light)] bg-[var(--secondary)] px-4 py-6 text-center text-[15px] text-[var(--editorial-subtle)]">
            No rules on this page yet.
        </div>
    )
}
