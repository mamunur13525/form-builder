import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../../../components/ui/select";
import type {
    FormLogicRule,
    FormPage,
    FormVariable,
    LogicCategory,
} from "../../../shared/types/common";
import { SECTIONS, type SectionConfig } from "./logicEditorConfig";
import { RuleEditor } from "./RuleEditor";

interface AddRuleFlowProps {
    editor: { category: LogicCategory | null; rule: FormLogicRule | null } | null;
    editorSection: SectionConfig | null;
    pageRulesCount: number;
    allPages: FormPage[];
    selectedPageKey: string;
    variables: FormVariable[];
    saveError: string | null;
    onSelectType: (category: LogicCategory) => void;
    onUpdateEditor: (rule: FormLogicRule) => void;
    onSave: (rule: FormLogicRule) => void;
    onCancel: () => void;
}

/** "Add rule" flow: pick a rule type, then edit the draft. */
export function AddRuleFlow({
    editor,
    editorSection,
    pageRulesCount,
    allPages,
    selectedPageKey,
    variables,
    saveError,
    onSelectType,
    onUpdateEditor,
    onSave,
    onCancel,
}: AddRuleFlowProps) {
    if (!editor || (editor.rule !== null && !editorSection)) return null

    if (editor.rule === null) {
        return (
            <div className="flex flex-wrap items-center gap-2 rounded-lg border border-dashed border-[var(--editorial-primary-ring)] bg-[var(--secondary)] px-4 py-3">
                <span className="text-[15px] font-semibold text-[var(--foreground)]">
                    What you want
                </span>
                <Select
                    onValueChange={(v) => {
                        if (v) onSelectType(v as LogicCategory)
                    }}
                >
                    <SelectTrigger
                        aria-label="Rule type"
                        className="h-11 w-full rounded-lg border-[var(--input)] bg-[var(--card)] px-4 text-[15px] font-medium text-[var(--foreground)] hover:border-[var(--editorial-primary-ring)] sm:w-72 data-placeholder:text-[var(--editorial-subtle)]"
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
                    onClick={onCancel}
                    className="ml-auto rounded-lg px-2 py-1 text-[15px] font-medium text-[var(--editorial-subtle)] hover:bg-[var(--secondary)] hover:text-[var(--foreground)]"
                >
                    Cancel
                </button>
            </div>
        )
    }

    return (
        <RuleEditor
            rule={editor.rule}
            section={editorSection!}
            pages={allPages}
            selectedPageKey={selectedPageKey}
            variables={variables}
            index={pageRulesCount + 1}
            onUpdate={onUpdateEditor}
            onSave={onSave}
            onDelete={onCancel}
            error={saveError}
            onCancel={onCancel}
        />
    )
}
