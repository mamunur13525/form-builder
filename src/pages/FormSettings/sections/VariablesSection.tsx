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
    FieldLabel,
} from "../components/primitives"
import type { FormVariable, VariableType } from "@/entities/form/model/types"

const toNum = (v: string) => (v === "" ? 0 : Number.isNaN(Number(v)) ? 0 : Number(v))

interface VariablesSectionProps {
    variables: FormVariable[]
    onVariablesChange: (variables: FormVariable[]) => void
}

export function VariablesSection({
    variables,
    onVariablesChange,
}: VariablesSectionProps) {
    return (
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
                                    onVariablesChange(
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
                                    onVariablesChange(
                                        variables.map((cur, i) =>
                                            i === index
                                                ? {
                                                      ...cur,
                                                      type,
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
                                    <SelectItem value="text">Text</SelectItem>
                                    <SelectItem value="number">Number</SelectItem>
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
                                    onVariablesChange(
                                        variables.map((v, i) =>
                                            i === index
                                                ? {
                                                      ...v,
                                                      value:
                                                          v.type === "number"
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
                                    onVariablesChange(
                                        variables.filter((_, i) => i !== index),
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
                            onVariablesChange([
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
    )
}
