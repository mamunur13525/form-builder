import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type {
    AddressSettings as AddressSettingsType,
    MatrixSettings as MatrixSettingsType,
    OpinionScaleSettings as OpinionScaleSettingsType,
    StatementSettings as StatementSettingsType,
    UploadSettings as UploadSettingsType,
} from "@/shared/types/common"
import { STATEMENT_PROVIDERS, UPLOAD_FILE_GROUPS } from "@/features/forms/model/field-defaults"
import { ToggleRow, NumberSetting, TextSetting } from "./primitives"
import { Eye, EyeOff, Plus, X } from "lucide-react"

// ---------------------------------------------------------------------------
// Statement
// ---------------------------------------------------------------------------

export function StatementSettingsWidget({
    settings,
    onChange,
}: {
    settings: StatementSettingsType
    onChange: (next: StatementSettingsType) => void
}) {
    return (
        <div className="space-y-3">
            <p className="text-xs text-muted-foreground">
                Embed any link: YouTube, Loom, Vimeo, PDF etc.
            </p>

            <div className="space-y-1">
                <Label className="text-base text-muted-foreground">Provider</Label>
                <Select
                    value={settings.embedProvider}
                    onValueChange={(v) =>
                        onChange({
                            ...settings,
                            embedProvider: v as StatementSettingsType["embedProvider"],
                        })
                    }
                >
                    <SelectTrigger className="w-full h-[52px]! rounded-xl border-[var(--input)] bg-[var(--secondary)] px-5 text-base ">
                        <SelectValue placeholder="Select provider" />
                    </SelectTrigger>
                    <SelectContent>
                        {STATEMENT_PROVIDERS.map((p) => (
                            <SelectItem key={p.value} value={p.value}>
                                {p.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <TextSetting
                label="Embed URL"
                value={settings.embedUrl}
                onChange={(embedUrl) => onChange({ ...settings, embedUrl })}
                placeholder="https://youtube.com/watch?v=..."
            />

            <TextSetting
                label="Embed title"
                value={settings.embedTitle}
                onChange={(embedTitle) => onChange({ ...settings, embedTitle })}
                placeholder="Optional title"
            />
        </div>
    )
}

// ---------------------------------------------------------------------------
// Opinion scale
// ---------------------------------------------------------------------------

export function OpinionScaleSettingsWidget({
    settings,
    onChange,
}: {
    settings: OpinionScaleSettingsType
    onChange: (next: OpinionScaleSettingsType) => void
}) {
    return (
        <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
                <NumberSetting
                    label="Min"
                    value={settings.min}
                    onChange={(min) => onChange({ ...settings, min: min ?? 0 })}
                    placeholder="0"
                    min={0}
                    max={100}
                />
                <NumberSetting
                    label="Max"
                    value={settings.max}
                    onChange={(max) => onChange({ ...settings, max: max ?? 10 })}
                    placeholder="10"
                    min={0}
                    max={100}
                />
            </div>

            <TextSetting
                label="Left label"
                description="Shown under the left end of the number row."
                value={settings.leftLabel}
                onChange={(leftLabel) => onChange({ ...settings, leftLabel })}
                placeholder="Not likely"
            />

            <TextSetting
                label="Right label"
                description="Shown under the right end of the number row."
                value={settings.rightLabel}
                onChange={(rightLabel) => onChange({ ...settings, rightLabel })}
                placeholder="Very likely"
            />
        </div>
    )
}

// ---------------------------------------------------------------------------
// Upload
// ---------------------------------------------------------------------------

export function UploadSettingsWidget({
    settings,
    onChange,
}: {
    settings: UploadSettingsType
    onChange: (next: UploadSettingsType) => void
}) {
    const toggleType = (value: string) => {
        const current = settings.allowedFileTypes
        const next = current.includes(value)
            ? current.filter((t) => t !== value)
            : [...current, value]
        onChange({ ...settings, allowedFileTypes: next })
    }

    return (
        <div className="space-y-3">
            <ToggleRow
                id="allow-multiple"
                label="Allow multiple"
                description="If checked, user will be able to upload multiple files."
                checked={settings.allowMultiple}
                onCheckedChange={(allowMultiple) => onChange({ ...settings, allowMultiple })}
            />

            <div className="space-y-2">
                <Label className="text-base">Allowed file types</Label>
                <p className="text-xs text-muted-foreground">
                    Leave all unchecked to allow every file type.
                </p>
                <div className="space-y-1.5 rounded-md border bg-muted/20 p-3">
                    {UPLOAD_FILE_GROUPS.map((group) => (
                        <label
                            key={group.value}
                            className="flex cursor-pointer items-center justify-between text-sm"
                        >
                            <span>{group.label}</span>
                            <input
                                type="checkbox"
                                checked={settings.allowedFileTypes.includes(group.value)}
                                onChange={() => toggleType(group.value)}
                                className="h-4 w-4"
                            />
                        </label>
                    ))}
                </div>
            </div>

            <NumberSetting
                label="Max file size (MB)"
                description="Maximum allowed is 100 MB."
                value={settings.maxFileSizeMb}
                onChange={(v) => onChange({ ...settings, maxFileSizeMb: v ?? 10 })}
                placeholder="10"
                min={1}
                max={100}
            />
        </div>
    )
}

// ---------------------------------------------------------------------------
// Address
// ---------------------------------------------------------------------------

export function AddressSettingsWidget({
    settings,
    onChange,
}: {
    settings: AddressSettingsType
    onChange: (next: AddressSettingsType) => void
}) {
    const updateField = (
        key: string,
        patch: Partial<AddressSettingsType["fields"][number]>,
    ) => {
        onChange({
            ...settings,
            fields: settings.fields.map((f) => (f.key === key ? { ...f, ...patch } : f)),
        })
    }

    const sorted = [...settings.fields].sort((a, b) => a.order - b.order)

    return (
        <div className="space-y-2">
            <p className="text-xs text-muted-foreground">
                Rename labels, set placeholders, and choose which parts are required or hidden.
            </p>
            {sorted.map((field) => (
                <div
                    key={field.key}
                    className="space-y-2 rounded-md border bg-muted/20 p-3"
                    data-hidden={field.hidden}
                >
                    <div className="flex items-center justify-between gap-2">
                        <Input
                            value={field.label}
                            onChange={(e) => updateField(field.key, { label: e.target.value })}
                            className="h-8 flex-1 text-sm font-medium"
                            placeholder="Label"
                        />
                        <button
                            type="button"
                            onClick={() => updateField(field.key, { hidden: !field.hidden })}
                            title={field.hidden ? "Show field" : "Hide field"}
                            className="rounded-md border p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
                        >
                            {field.hidden ? (
                                <EyeOff className="h-3.5 w-3.5" />
                            ) : (
                                <Eye className="h-3.5 w-3.5" />
                            )}
                        </button>
                    </div>

                    {!field.hidden && (
                        <>
                            <Input
                                value={field.placeholder}
                                onChange={(e) =>
                                    updateField(field.key, { placeholder: e.target.value })
                                }
                                className="h-8 text-sm"
                                placeholder="Placeholder"
                            />
                            <label className="flex cursor-pointer items-center justify-between text-xs text-muted-foreground">
                                Required
                                <input
                                    type="checkbox"
                                    checked={field.required}
                                    onChange={(e) =>
                                        updateField(field.key, { required: e.target.checked })
                                    }
                                    className="h-3.5 w-3.5"
                                />
                            </label>
                        </>
                    )}
                </div>
            ))}
        </div>
    )
}

// ---------------------------------------------------------------------------
// Matrix
// ---------------------------------------------------------------------------

export function MatrixSettingsWidget({
    settings,
    onChange,
}: {
    settings: MatrixSettingsType
    onChange: (next: MatrixSettingsType) => void
}) {
    const addRow = () => {
        if (settings.rows.length >= 50) return
        onChange({
            ...settings,
            rows: [
                ...settings.rows,
                {
                    key: `row_${Date.now()}`,
                    label: `Row ${settings.rows.length + 1}`,
                    order: settings.rows.length + 1,
                },
            ],
        })
    }

    const addColumn = () => {
        if (settings.columns.length >= 20) return
        onChange({
            ...settings,
            columns: [
                ...settings.columns,
                {
                    key: `col_${Date.now()}`,
                    label: `Column ${settings.columns.length + 1}`,
                    order: settings.columns.length + 1,
                },
            ],
        })
    }

    return (
        <div className="space-y-4">
            <MatrixList
                title="Rows"
                items={settings.rows}
                max={50}
                onAdd={addRow}
                onRename={(key, label) =>
                    onChange({
                        ...settings,
                        rows: settings.rows.map((r) => (r.key === key ? { ...r, label } : r)),
                    })
                }
                onRemove={(key) =>
                    onChange({
                        ...settings,
                        rows: settings.rows
                            .filter((r) => r.key !== key)
                            .map((r, i) => ({ ...r, order: i + 1 })),
                    })
                }
            />

            <MatrixList
                title="Columns"
                items={settings.columns}
                max={20}
                onAdd={addColumn}
                onRename={(key, label) =>
                    onChange({
                        ...settings,
                        columns: settings.columns.map((c) =>
                            c.key === key ? { ...c, label } : c,
                        ),
                    })
                }
                onRemove={(key) =>
                    onChange({
                        ...settings,
                        columns: settings.columns
                            .filter((c) => c.key !== key)
                            .map((c, i) => ({ ...c, order: i + 1 })),
                    })
                }
            />

            <ToggleRow
                id="matrix-multiple"
                label="Multiple selection"
                description="Allow multiple selections per row."
                checked={settings.allowMultiplePerRow}
                onCheckedChange={(allowMultiplePerRow) =>
                    onChange({ ...settings, allowMultiplePerRow })
                }
            />
        </div>
    )
}

function MatrixList({
    title,
    items,
    max,
    onAdd,
    onRename,
    onRemove,
}: {
    title: string
    items: { key: string; label: string; order: number }[]
    max: number
    onAdd: () => void
    onRename: (key: string, label: string) => void
    onRemove: (key: string) => void
}) {
    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <Label className="text-base">{title}</Label>
                <span className="text-xs text-muted-foreground">
                    {items.length} / {max}
                </span>
            </div>
            {items
                .slice()
                .sort((a, b) => a.order - b.order)
                .map((item) => (
                    <div key={item.key} className="flex items-center gap-2">
                        <Input
                            value={item.label}
                            onChange={(e) => onRename(item.key, e.target.value)}
                            className="h-8 flex-1 text-sm"
                            placeholder={title === "Rows" ? "Row label" : "Column label"}
                        />
                        <button
                            type="button"
                            onClick={() => onRemove(item.key)}
                            disabled={items.length <= 1}
                            className="rounded-md border p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:opacity-40"
                        >
                            <X className="h-3.5 w-3.5" />
                        </button>
                    </div>
                ))}
            <button
                type="button"
                onClick={onAdd}
                disabled={items.length >= max}
                className="flex w-full items-center justify-center gap-1 rounded-md border py-1.5 text-sm hover:bg-accent disabled:opacity-40"
            >
                <Plus className="h-3.5 w-3.5" />
                Add {title === "Rows" ? "row" : "column"}
            </button>
        </div>
    )
}
