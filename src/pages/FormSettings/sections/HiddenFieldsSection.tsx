import { Plus, Trash2 } from "lucide-react"
import { Input } from "../../../components/ui/input"
import {
    SettingsSection,
    ToggleRow,
    FieldLabel,
} from "../components/primitives"
import type { HiddenFieldsSettings } from "@/entities/form/model/types"

interface HiddenFieldsSectionProps {
    enabled: boolean
    fields: HiddenFieldsSettings["fields"]
    onEnabledChange: (enabled: boolean) => void
    onFieldsChange: (fields: HiddenFieldsSettings["fields"]) => void
}

export function HiddenFieldsSection({
    enabled,
    fields,
    onEnabledChange,
    onFieldsChange,
}: HiddenFieldsSectionProps) {
    return (
        <SettingsSection
            title="Hidden fields"
            description="Capture values passed in the form’s URL (for example UTM parameters) alongside each submission."
        >
            <ToggleRow
                label="Enable hidden fields"
                htmlFor="toggle-hidden-fields"
                description="Store the key/value pairs below with every response."
                checked={enabled}
                onCheckedChange={onEnabledChange}
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
                                    onFieldsChange(
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
                                    onFieldsChange(
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
                                    onFieldsChange(
                                        fields.filter((_, i) => i !== index),
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
                            onFieldsChange([...fields, { key: "", value: "" }])
                        }
                        className="editorial-transition mt-0.5 inline-flex w-fit items-center gap-1.5 rounded-lg border border-dashed border-[var(--border)] px-3 py-1.5 text-[13px] font-medium text-[var(--editorial-body)] hover:border-[var(--editorial-primary-ring)] hover:text-[var(--foreground)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
                    >
                        <Plus className="h-4 w-4" />
                        Add hidden field
                    </button>
                </div>
            </ToggleRow>
        </SettingsSection>
    )
}
