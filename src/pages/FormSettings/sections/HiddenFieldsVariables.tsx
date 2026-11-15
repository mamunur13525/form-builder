import { useMemo } from "react"
import { useParams } from "react-router-dom"
import { SaveBar } from "../components/SaveBar"
import { useSectionState } from "../hooks/useSectionState"
import { useFormContext } from "@/features/forms/hooks/useFormContext"
import {
    useFormSettings,
    useUpdateHiddenFields,
    useUpdateVariables,
} from "@/features/forms/hooks/useFormSettings"
import type {
    FormVariable,
    HiddenFieldsSettings,
} from "@/entities/form/model/types"
import { HiddenFieldsSection } from "./HiddenFieldsSection"
import { VariablesSection } from "./VariablesSection"

const HIDDEN_DEFAULTS: HiddenFieldsSettings = { enabled: false, fields: [] }
const VARIABLES_DEFAULTS: FormVariable[] = []

/**
 * Hidden fields (query-string values captured with each submission) and
 * variables (named values used in logic/calculations). These are two separate
 * endpoints — hidden-fields and variables — saved together by the bar below.
 */
export function HiddenFieldsVariables() {
    const { formId } = useParams<{ formId: string }>()
    const { data, isLoading } = useFormSettings(formId ?? "")
    const { showSaveStatus, setHasUnpublishedChanges, saveStatus } =
        useFormContext()

    const hiddenMutation = useUpdateHiddenFields()
    const variablesMutation = useUpdateVariables()

    // --- Hidden fields state -------------------------------------------------
    const loadedHidden = useMemo<HiddenFieldsSettings | undefined>(
        () =>
            data
                ? { ...HIDDEN_DEFAULTS, ...(data.settings.hiddenFields ?? {}) }
                : undefined,
        [data],
    )
    const {
        values: hidden,
        setValues: setHidden,
        dirty: hiddenDirty,
        commit: commitHidden,
    } = useSectionState(loadedHidden, HIDDEN_DEFAULTS)

    const fields = hidden.fields
    const setFields = (next: HiddenFieldsSettings["fields"]) =>
        setHidden((prev) => ({ ...prev, fields: next }))

    // --- Variables state -----------------------------------------------------
    const loadedVariables = useMemo<FormVariable[] | undefined>(
        () => (data ? (data.settings.variables ?? VARIABLES_DEFAULTS) : undefined),
        [data],
    )
    const {
        values: variables,
        setValues: setVariables,
        dirty: variablesDirty,
        commit: commitVariables,
    } = useSectionState(loadedVariables, VARIABLES_DEFAULTS)

    const isNew = !formId || formId === "new"
    const dirty = hiddenDirty || variablesDirty
    const isSaving = hiddenMutation.isPending || variablesMutation.isPending
    const errorMessage =
        hiddenMutation.error instanceof Error
            ? hiddenMutation.error.message
            : variablesMutation.error instanceof Error
              ? variablesMutation.error.message
              : undefined

    const handleSave = async () => {
        if (isNew) return
        showSaveStatus("saving")
        try {
            // Sequential so the second response reflects both changes in cache.
            if (hiddenDirty) {
                const payload: HiddenFieldsSettings = {
                    enabled: hidden.enabled,
                    fields: fields.filter((f) => f.key.trim()),
                }
                const res = await hiddenMutation.mutateAsync({
                    formId: formId!,
                    data: payload,
                })
                commitHidden(res?.settings?.hiddenFields ?? payload)
            }
            if (variablesDirty) {
                const cleaned = variables.filter((v) => String(v.name).trim())
                const res = await variablesMutation.mutateAsync({
                    formId: formId!,
                    data: { variables: cleaned },
                })
                commitVariables(res?.settings?.variables ?? cleaned)
            }
            setHasUnpublishedChanges(true)
            showSaveStatus("saved")
        } catch {
            showSaveStatus("error")
        }
    }

    const status = isSaving ? "saving" : saveStatus

    return (
        <>
            <div className="flex flex-col gap-6">
                <HiddenFieldsSection
                    enabled={hidden.enabled}
                    fields={fields}
                    onEnabledChange={(enabled) =>
                        setHidden((prev) => ({ ...prev, enabled }))
                    }
                    onFieldsChange={setFields}
                />

                <VariablesSection
                    variables={variables}
                    onVariablesChange={setVariables}
                />
            </div>

            <SaveBar
                status={status}
                dirty={dirty}
                onSave={handleSave}
                disabled={isLoading || isNew}
                errorMessage={errorMessage}
            />
        </>
    )
}
