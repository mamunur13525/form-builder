import { useMemo } from "react"
import { useParams } from "react-router-dom"
import { Plus, Trash2, Braces } from "lucide-react"
import { Input } from "../../../components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../../../components/ui/select"
import {
    SettingsSection,
    SettingRow,
    ToggleRow,
    FieldLabel,
} from "../components/primitives"
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
    VariableType,
} from "@/entities/form/model/types"

const HIDDEN_DEFAULTS: HiddenFieldsSettings = { enabled: false, fields: [] }
const VARIABLES_DEFAULTS: FormVariable[] = []

const toNum = (v: string) => (v === "" ? 0 : Number.isNaN(Number(v)) ? 0 : Number(v))

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
                <SettingsSection
                    title="Hidden fields"
                    description="Capture values passed in the form’s URL (for example UTM parameters) alongside each submission."
                >
                    <ToggleRow
                        label="Enable hidden fields"
                        htmlFor="toggle-hidden-fields"
                        description="Store the key/value pairs below with every response."
                        checked={hidden.enabled}
                        onCheckedChange={(v) =>
                            setHidden((prev) => ({ ...prev, enabled: v }))
                        }
                    >
                        <div className="flex flex-col gap-2">
                            <div className="hidden grid-cols-[1fr_1fr_auto] gap-2 px-1 sm:grid">
                                <FieldLabel>Key</FieldLabel>
                                <FieldLabel>Value</FieldLabel>
                                <span className="w-9" />
                            </div>

                            {fields.length === 0 && (
                                <p className="px-1 py-2 text-[13px] text-[var(--muted-foreground)]">
                                    No hidden fields yet.
                                </p>
                            )}

                            {fields.map((field, index) => (
                                <div
                                    key={index}
                                    className="flex flex-col gap-2 rounded-lg border border-[var(--border)] p-2 sm:grid sm:grid-cols-[1fr_1fr_auto] sm:items-center sm:gap-2 sm:rounded-none sm:border-0 sm:p-0"
                                >
                                    <Input
                                        placeholder="utm_source"
                                        value={field.key}
                                        onChange={(e) =>
                                            setFields(
                                                fields.map((f, i) =>
                                                    i === index
                                                        ? { ...f, key: e.target.value }
                                                        : f,
                                                ),
                                            )
                                        }
                                        className="h-9 bg-[var(--card)] font-mono text-[13px]"
                                    />
                                    <Input
                                        placeholder="google"
                                        value={field.value}
                                        onChange={(e) =>
                                            setFields(
                                                fields.map((f, i) =>
                                                    i === index
                                                        ? { ...f, value: e.target.value }
                                                        : f,
                                                ),
                                            )
                                        }
                                        className="h-9 bg-[var(--card)] font-mono text-[13px]"
                                    />
                                    <button
                                        type="button"
                                        aria-label="Remove hidden field"
                                        onClick={() =>
                                            setFields(
                                                fields.filter(
                                                    (_, i) => i !== index,
                                                ),
                                            )
                                        }
                                        className="editorial-transition flex h-9 w-9 shrink-0 items-center justify-center self-end rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--editorial-subtle)] hover:border-[var(--destructive)]/40 hover:text-[var(--destructive)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)] sm:self-auto"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            ))}

                            <button
                                type="button"
                                onClick={() =>
                                    setFields([...fields, { key: "", value: "" }])
                                }
                                className="editorial-transition mt-0.5 inline-flex w-fit items-center gap-1.5 rounded-lg border border-dashed border-[var(--border)] px-3 py-1.5 text-[13px] font-medium text-[var(--editorial-body)] hover:border-[var(--editorial-primary-ring)] hover:text-[var(--foreground)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
                            >
                                <Plus className="h-4 w-4" />
                                Add hidden field
                            </button>
                        </div>
                    </ToggleRow>
                </SettingsSection>

                <SettingsSection
                    title="Variables"
                    description="Named values you can reference in logic and calculations across the form."
                >
                    <SettingRow
                        label="Form variables"
                        description="Define a starting value and type for each variable."
                    >
                        <div className="flex flex-col gap-2">
                            <div className="hidden grid-cols-[1.2fr_0.8fr_1fr_auto] gap-2 px-1 sm:grid">
                                <FieldLabel>Name</FieldLabel>
                                <FieldLabel>Type</FieldLabel>
                                <FieldLabel>Default value</FieldLabel>
                                <span className="w-9" />
                            </div>

                            {variables.length === 0 && (
                                <p className="px-1 py-2 text-[13px] text-[var(--muted-foreground)]">
                                    No variables yet.
                                </p>
                            )}

                            {variables.map((variable, index) => (
                                <div
                                    key={index}
                                    className="flex flex-col gap-2 rounded-lg border border-[var(--border)] p-2 sm:grid sm:grid-cols-[1.2fr_0.8fr_1fr_auto] sm:items-center sm:gap-2 sm:rounded-none sm:border-0 sm:p-0"
                                >
                                    <Input
                                        placeholder="score"
                                        value={variable.name}
                                        onChange={(e) =>
                                            setVariables(
                                                variables.map((v, i) =>
                                                    i === index
                                                        ? { ...v, name: e.target.value }
                                                        : v,
                                                ),
                                            )
                                        }
                                        className="h-9 bg-[var(--card)]"
                                    />
                                    <Select
                                        value={variable.type}
                                        onValueChange={(v) => {
                                            if (!v) return
                                            const type = v as VariableType
                                            setVariables(
                                                variables.map((cur, i) =>
                                                    i === index
                                                        ? {
                                                              ...cur,
                                                              type,
                                                              // Re-coerce the value to the new type.
                                                              value:
                                                                  type === "number"
                                                                      ? toNum(
                                                                            String(
                                                                                cur.value,
                                                                            ),
                                                                        )
                                                                      : String(
                                                                            cur.value,
                                                                        ),
                                                          }
                                                        : cur,
                                                ),
                                            )
                                        }}
                                    >
                                        <SelectTrigger className="w-full bg-[var(--editorial-purple-light)]">
                                            <SelectValue placeholder="Type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="text">
                                                Text
                                            </SelectItem>
                                            <SelectItem value="number">
                                                Number
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Input
                                        type={
                                            variable.type === "number"
                                                ? "number"
                                                : "text"
                                        }
                                        placeholder={
                                            variable.type === "number" ? "0" : "—"
                                        }
                                        value={String(variable.value)}
                                        onChange={(e) =>
                                            setVariables(
                                                variables.map((v, i) =>
                                                    i === index
                                                        ? {
                                                              ...v,
                                                              value:
                                                                  v.type ===
                                                                  "number"
                                                                      ? toNum(
                                                                            e.target
                                                                                .value,
                                                                        )
                                                                      : e.target
                                                                            .value,
                                                          }
                                                        : v,
                                                ),
                                            )
                                        }
                                        className="h-9 bg-[var(--card)]"
                                    />
                                    <button
                                        type="button"
                                        aria-label="Remove variable"
                                        onClick={() =>
                                            setVariables(
                                                variables.filter(
                                                    (_, i) => i !== index,
                                                ),
                                            )
                                        }
                                        className="editorial-transition flex h-9 w-9 shrink-0 items-center justify-center self-end rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--editorial-subtle)] hover:border-[var(--destructive)]/40 hover:text-[var(--destructive)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)] sm:self-auto"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            ))}

                            <button
                                type="button"
                                onClick={() =>
                                    setVariables([
                                        ...variables,
                                        { name: "", type: "text", value: "" },
                                    ])
                                }
                                className="editorial-transition mt-0.5 inline-flex w-fit items-center gap-1.5 rounded-lg border border-dashed border-[var(--border)] px-3 py-1.5 text-[13px] font-medium text-[var(--editorial-body)] hover:border-[var(--editorial-primary-ring)] hover:text-[var(--foreground)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
                            >
                                <Plus className="h-4 w-4" />
                                Add variable
                            </button>

                            <p className="mt-1 flex items-center gap-1.5 px-1 text-[12px] text-[var(--muted-foreground)]">
                                <Braces className="h-3.5 w-3.5" />
                                Reference variables in logic as{" "}
                                <code className="rounded bg-[var(--secondary)] px-1 py-0.5 font-mono text-[11px]">
                                    {"{{variable_name}}"}
                                </code>
                            </p>
                        </div>
                    </SettingRow>
                </SettingsSection>
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
