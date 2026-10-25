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
import { STATEMENT_PROVIDERS, UPLOAD_FILE_GROUPS } from "@/features/forms/model/page-defaults"
import { ToggleRow, NumberSetting, TextSetting, CONTROL_CLASS } from "./primitives"
import { Switch } from "@/components/ui/switch"
import { Eye, EyeOff, Plus, X, Shield, Link2, Type } from "lucide-react"

// Provider brand badges
const YoutubeBadge = () => (
    <span className="flex h-3.5 w-4.5 items-center justify-center rounded-xs bg-[#FF0000] text-white shrink-0">
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-2 w-2">
            <path d="M8 5v14l11-7z" />
        </svg>
    </span>
)

const LoomBadge = () => (
    <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#625DF5] text-white shrink-0 font-bold text-[8px]">
        ✻
    </span>
)

const VimeoBadge = () => (
    <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#1AB7EA] text-white font-bold text-[8px] italic shrink-0">
        v
    </span>
)

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
        <div className="space-y-3.5">
            <p className="text-xs leading-4 text-zinc-400">
                Embed any link: YouTube, Loom, Vimeo, PDF etc.
            </p>

            <div className="space-y-1.5">
                <Label className="text-xs font-medium text-zinc-300">Provider</Label>
                <Select
                    value={settings.embedProvider}
                    onValueChange={(v) =>
                        onChange({
                            ...settings,
                            embedProvider: v as StatementSettingsType["embedProvider"],
                        })
                    }
                >
                    <SelectTrigger className={CONTROL_CLASS + " w-full flex items-center justify-between [&>svg:last-child]:text-zinc-400"}>
                        <div className="flex items-center gap-2 text-zinc-200">
                            <Shield className="h-4 w-4 text-zinc-400 shrink-0" />
                            <SelectValue placeholder="Select provider" className="font-medium" />
                        </div>
                        <div className="flex items-center gap-1.5 mr-2 pointer-events-none">
                            <YoutubeBadge />
                            <LoomBadge />
                            <VimeoBadge />
                        </div>
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border border-zinc-800 bg-[#18181c] text-zinc-100 shadow-2xl p-1.5 z-50">
                        {STATEMENT_PROVIDERS.map((p) => (
                            <SelectItem
                                key={p.value}
                                value={p.value}
                                className="cursor-pointer rounded-lg px-3 py-2 text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 focus:bg-zinc-800 focus:text-white"
                            >
                                <span className="font-medium">{p.label}</span>
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
                icon={<Link2 className="h-4 w-4" />}
            />

            <TextSetting
                label="Embed title"
                value={settings.embedTitle}
                onChange={(embedTitle) => onChange({ ...settings, embedTitle })}
                placeholder="Optional title"
                icon={<Type className="h-4 w-4" />}
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

            <div className="space-y-1.5">
                <Label className="text-sm font-medium text-zinc-200">Allowed file types</Label>
                <p className="text-xs leading-5 text-zinc-400">
                    Leave all unchecked to allow every file type.
                </p>
                <div className="space-y-3 rounded-xl border border-zinc-800 bg-zinc-900/50 p-3">
                    {UPLOAD_FILE_GROUPS.map((group) => (
                        <label
                            key={group.value}
                            className="flex cursor-pointer items-center justify-between text-sm text-zinc-300 hover:text-white"
                        >
                            <span>{group.label}</span>
                            <Switch
                                checked={settings.allowedFileTypes.includes(group.value)}
                                onCheckedChange={() => toggleType(group.value)}
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
    const updatePage = (
        key: string,
        patch: Partial<AddressSettingsType["pages"][number]>,
    ) => {
        onChange({
            ...settings,
            pages: settings.pages.map((f) => (f.key === key ? { ...f, ...patch } : f)),
        })
    }

    const sorted = [...settings.pages].sort((a, b) => a.order - b.order)

    return (
        <div className="space-y-3">
            <p className="text-xs leading-5 text-zinc-400">
                Rename labels, set placeholders, and choose which parts are required or hidden.
            </p>
            {sorted.map((page) => (
                <div
                    key={page.key}
                    className="space-y-3 rounded-xl border border-zinc-800 bg-zinc-900/50 p-3"
                    data-hidden={page.hidden}
                >
                    <div className="flex items-center gap-2">
                        <Input
                            value={page.label}
                            onChange={(e) => updatePage(page.key, { label: e.target.value })}
                            className={CONTROL_CLASS + " flex-1 px-3 font-medium"}
                            placeholder="Label"
                        />
                        <button
                            type="button"
                            onClick={() => updatePage(page.key, { hidden: !page.hidden })}
                            title={page.hidden ? "Show page" : "Hide page"}
                            className="rounded-xl border border-zinc-800 bg-[#1a1a20] p-2 text-zinc-400 hover:border-zinc-700 hover:text-white transition-colors cursor-pointer"
                        >
                            {page.hidden ? (
                                <EyeOff className="h-3.5 w-3.5" />
                            ) : (
                                <Eye className="h-3.5 w-3.5" />
                            )}
                        </button>
                    </div>

                    {!page.hidden && (
                        <>
                            <Input
                                value={page.placeholder}
                                onChange={(e) =>
                                    updatePage(page.key, { placeholder: e.target.value })
                                }
                                className={CONTROL_CLASS + " px-3"}
                                placeholder="Placeholder"
                            />
                            <div className="flex items-center justify-between gap-3">
                                <Label
                                    htmlFor={`address-required-${page.key}`}
                                    className="cursor-pointer text-xs text-zinc-400"
                                >
                                    Required
                                </Label>
                                <Switch
                                    id={`address-required-${page.key}`}
                                    checked={page.required}
                                    onCheckedChange={(required) =>
                                        updatePage(page.key, { required })
                                    }
                                />
                            </div>
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
                <Label className="text-sm font-medium text-zinc-200">{title}</Label>
                <span className="text-xs text-zinc-500">
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
                            className={CONTROL_CLASS + " flex-1 px-3"}
                            placeholder={title === "Rows" ? "Row label" : "Column label"}
                        />
                        <button
                            type="button"
                            onClick={() => onRemove(item.key)}
                            disabled={items.length <= 1}
                            className="rounded-xl border border-zinc-800 bg-[#1a1a20] p-2 text-zinc-400 hover:border-rose-500/30 hover:text-rose-400 disabled:pointer-events-none disabled:opacity-40 transition-colors cursor-pointer"
                        >
                            <X className="h-3.5 w-3.5" />
                        </button>
                    </div>
                ))}
            <button
                type="button"
                onClick={onAdd}
                disabled={items.length >= max}
                className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-zinc-800 bg-[#1a1a20] py-2.5 text-xs font-medium text-zinc-300 hover:border-[#FF5722] hover:text-[#FF5722] hover:bg-zinc-800/60 disabled:pointer-events-none disabled:opacity-40 transition-all cursor-pointer"
            >
                <Plus className="h-4 w-4" />
                Add {title === "Rows" ? "row" : "column"}
            </button>
        </div>
    )
}
