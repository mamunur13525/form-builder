import type { Dispatch, SetStateAction } from "react"
import { useEffect } from "react"
import type { FormLogicRule, LogicCategory } from "../../../shared/types/common"
import {
    useCreateLogic,
    useUpdateLogicRule,
    useDeleteLogicRule,
} from "@/features/forms/hooks/useFormLogic"
import { getLogicRules } from "@/entities/form/api/logic.api"
import { useFormStore } from "@/app/store/formStore"

interface EditorState {
    category: LogicCategory | null
    rule: FormLogicRule | null
}

interface UseRulePersistenceArgs {
    formId: string | undefined
    rules: FormLogicRule[]
    rulesLoading: boolean
    setSaveError: (message: string | null) => void
    setEditor: Dispatch<SetStateAction<EditorState | null>>
}

/** Save/delete mutations for the logic editor, keeping the form store in sync. */
export function useRulePersistence({ formId, rules, rulesLoading, setSaveError, setEditor }: UseRulePersistenceArgs) {
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

    return { saveRule, deleteRule }
}
