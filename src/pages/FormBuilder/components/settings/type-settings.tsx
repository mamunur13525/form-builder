import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type {
    AddressSettings as AddressSettingsType,
    ContactInfoSettings as ContactInfoSettingsType,
    FieldsPerRow,
    MatrixSettings as MatrixSettingsType,
    OpinionScaleSettings as OpinionScaleSettingsType,
    StatementSettings as StatementSettingsType,
    UploadSettings as UploadSettingsType,
} from "@/shared/types/common"
import { STATEMENT_PROVIDERS, UPLOAD_FILE_GROUPS } from "@/features/forms/model/page-defaults"
import { DEFAULT_ADDRESS_PLACEHOLDERS } from "@/shared/constants/address"
import { DEFAULT_CONTACT_INFO_PLACEHOLDERS } from "@/shared/constants/contact-info"
import { ToggleRow, NumberSetting, TextSetting, CONTROL_CLASS } from "./primitives"
import { PhoneSettingsWidget } from "./phone-settings"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import { Eye, EyeOff, Plus, X, Shield, Link2, Type, FileText, Image as ImageIcon, Globe } from "lucide-react"

// Provider brand badges
const PROVIDER_ICONS: Record<string, { label: string; badge: React.ReactNode }> = {
    youtube: {
        label: "YouTube",
        badge: (
            <span className="flex h-5 w-5 items-center justify-center rounded-md bg-[#FF0000] text-white shrink-0 shadow-xs">
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-3 w-3">
                    <path d="M8 5v14l11-7z" />
                </svg>
            </span>
        ),
    },
    loom: {
        label: "Loom",
        badge: (
            <span className="flex h-5 w-5 items-center justify-center rounded-md bg-[#625DF5] text-white shrink-0 font-bold text-xs shadow-xs">
                ✻
            </span>
        ),
    },
    vimeo: {
        label: "Vimeo",
        badge: (
            <span className="flex h-5 w-5 items-center justify-center rounded-md bg-[#1AB7EA] text-white font-bold text-xs italic shrink-0 shadow-xs">
                v
            </span>
        ),
    },
    pdf: {
        label: "PDF",
        badge: (
            <span className="flex h-5 w-5 items-center justify-center rounded-md bg-[#E11D48] text-white shrink-0 shadow-xs">
                <FileText className="h-3 w-3 stroke-[2.5]" />
            </span>
        ),
    },
    image: {
        label: "Image",
        badge: (
            <span className="flex h-5 w-5 items-center justify-center rounded-md bg-[#10B981] text-white shrink-0 shadow-xs">
                <ImageIcon className="h-3 w-3 stroke-[2.5]" />
            </span>
        ),
    },
    other: {
        label: "Other",
        badge: (
            <span className="flex h-5 w-5 items-center justify-center rounded-md bg-slate-500 text-white shrink-0 shadow-xs">
                <Globe className="h-3 w-3 stroke-[2.5]" />
            </span>
        ),
    },
}

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
    // Statement settings saved before `embedProvider` existed (or partial API
    // payloads) arrive without it. Falling back keeps the Select controlled and
    // rewrites the full shape on the next edit.
    const embedProvider = settings.embedProvider ?? "youtube"
    const embedUrl = settings.embedUrl ?? ""
    const embedTitle = settings.embedTitle ?? ""

    const emit = (patch: Partial<StatementSettingsType>) =>
        onChange({
            embedUrl,
            embedProvider,
            embedTitle,
            ...patch,
        })

    return (
        <div className="space-y-3.5">
            <p className="text-xs leading-4 text-slate-500 dark:text-zinc-400">
                Embed any link: YouTube, Loom, Vimeo, PDF etc.
            </p>

            <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-700 dark:text-zinc-300">Provider</Label>
                <Select
                    value={embedProvider}
                    onValueChange={(v) =>
                        emit({
                            embedProvider: v as StatementSettingsType["embedProvider"],
                        })
                    }
                >
                    <SelectTrigger className="transition-colors h-11 w-full rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#1a1a20] px-3 text-sm text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 hover:border-slate-300 dark:hover:border-zinc-700 focus-visible:border-[#FF5722] focus-visible:ring-1 focus-visible:ring-[#FF5722] shadow-xs flex items-center justify-between cursor-pointer [&>svg:last-child]:text-slate-400 dark:[&>svg:last-child]:text-zinc-500">
                        <div className="flex items-center gap-2.5 min-w-0">
                            {PROVIDER_ICONS[embedProvider]?.badge ?? (
                                <Shield className="h-4 w-4 text-slate-400 dark:text-zinc-400 shrink-0" />
                            )}
                            <SelectValue placeholder="Select provider" className="font-medium text-slate-800 dark:text-zinc-100" />
                        </div>
                    </SelectTrigger>
                    <SelectContent className="rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#18181c] text-slate-800 dark:text-zinc-100 shadow-xl dark:shadow-2xl p-1.5 z-50 min-w-(--anchor-width)">
                        {STATEMENT_PROVIDERS.map((p) => {
                            const item = PROVIDER_ICONS[p.value]
                            return (
                                <SelectItem
                                    key={p.value}
                                    value={p.value}
                                    className="cursor-pointer rounded-lg px-3 py-2 text-sm font-medium text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 focus:bg-slate-100 dark:focus:bg-zinc-800 focus:text-slate-900 dark:focus:text-white data-highlighted:bg-slate-100 dark:data-highlighted:bg-zinc-800 data-highlighted:text-slate-900 dark:data-highlighted:text-white transition-colors"
                                >
                                    <div className="flex items-center gap-2.5">
                                        {item?.badge}
                                        <span className="font-medium">{p.label}</span>
                                    </div>
                                </SelectItem>
                            )
                        })}
                    </SelectContent>
                </Select>
            </div>

            <TextSetting
                label="Embed URL"
                value={embedUrl}
                onChange={(embedUrl) => emit({ embedUrl })}
                placeholder="https://youtube.com/watch?v=..."
                icon={<Link2 className="h-4 w-4" />}
            />

            <TextSetting
                label="Embed title"
                value={embedTitle}
                onChange={(embedTitle) => emit({ embedTitle })}
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
                <Label className="text-sm font-medium text-slate-800 dark:text-zinc-200">Allowed file types</Label>
                <p className="text-xs leading-5 text-slate-500 dark:text-zinc-400">
                    Leave all unchecked to allow every file type.
                </p>
                <div className="space-y-3 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-900/50 p-3">
                    {UPLOAD_FILE_GROUPS.map((group) => (
                        <label
                            key={group.value}
                            className="flex cursor-pointer items-center justify-between text-sm text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white"
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

export function FieldsPerRowSetting({
    value = { desktop: 2, mobile: 1 },
    onChange,
}: {
    value?: FieldsPerRow
    onChange: (value: FieldsPerRow) => void
}) {
    const desktop = value?.desktop === 1 ? 1 : 2
    const mobile = value?.mobile === 2 ? 2 : 1

    return (
        <div className="space-y-2 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-900/50 p-3">
            <Label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                Fields per row
            </Label>
            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                    <Label className="text-xs text-slate-600 dark:text-zinc-400">Desktop</Label>
                    <div className="flex rounded-md border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#1a1a20] p-0.5">
                        <button
                            type="button"
                            onClick={() => onChange({ desktop: 1, mobile })}
                            className={cn(
                                "flex-1 py-1 rounded text-xs font-medium transition-all cursor-pointer text-center",
                                desktop === 1
                                    ? "bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-white shadow-xs"
                                    : "text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white",
                            )}
                        >
                            1
                        </button>
                        <button
                            type="button"
                            onClick={() => onChange({ desktop: 2, mobile })}
                            className={cn(
                                "flex-1 py-1 rounded text-xs font-medium transition-all cursor-pointer text-center",
                                desktop === 2
                                    ? "bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-white shadow-xs"
                                    : "text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white",
                            )}
                        >
                            2
                        </button>
                    </div>
                </div>

                <div className="space-y-1.5">
                    <Label className="text-xs text-slate-600 dark:text-zinc-400">Mobile</Label>
                    <div className="flex rounded-md border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#1a1a20] p-0.5">
                        <button
                            type="button"
                            onClick={() => onChange({ desktop, mobile: 1 })}
                            className={cn(
                                "flex-1 py-1 rounded text-xs font-medium transition-all cursor-pointer text-center",
                                mobile === 1
                                    ? "bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-white shadow-xs"
                                    : "text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white",
                            )}
                        >
                            1
                        </button>
                        <button
                            type="button"
                            onClick={() => onChange({ desktop, mobile: 2 })}
                            className={cn(
                                "flex-1 py-1 rounded text-xs font-medium transition-all cursor-pointer text-center",
                                mobile === 2
                                    ? "bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-white shadow-xs"
                                    : "text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white",
                            )}
                        >
                            2
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

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
            <FieldsPerRowSetting
                value={settings.fieldsPerRow}
                onChange={(fieldsPerRow) => onChange({ ...settings, fieldsPerRow })}
            />

            <p className="text-xs leading-5 text-slate-500 dark:text-zinc-400">
                Rename labels, set placeholders, and choose which parts are required, full/half width, or hidden.
            </p>
            {sorted.map((page) => (
                <div
                    key={page.key}
                    className="space-y-3 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-900/50 p-3 data-[hidden=true]:opacity-60"
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
                            className="rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#1a1a20] p-2 text-slate-500 dark:text-zinc-400 hover:border-slate-300 dark:hover:border-zinc-700 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
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
                                className={CONTROL_CLASS + " px-3 placeholder:opacity-60"}
                                aria-label={`${page.label} placeholder`}
                                placeholder={DEFAULT_ADDRESS_PLACEHOLDERS[page.key]}
                            />

                            <div className="flex items-center justify-between gap-3">
                                <Label className="cursor-pointer text-xs text-slate-600 dark:text-zinc-400">
                                    Width
                                </Label>
                                <div className="flex rounded-md border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#1a1a20] p-0.5 text-xs">
                                    <button
                                        type="button"
                                        onClick={() => updatePage(page.key, { width: "50%" })}
                                        className={cn(
                                            "px-2.5 py-1 rounded font-medium transition-all cursor-pointer",
                                            (page.width ?? (page.key === "zip" || page.key === "country" ? "100%" : "50%")) === "50%"
                                                ? "bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-white shadow-xs"
                                                : "text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white",
                                        )}
                                    >
                                        50%
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => updatePage(page.key, { width: "100%" })}
                                        className={cn(
                                            "px-2.5 py-1 rounded font-medium transition-all cursor-pointer",
                                            (page.width ?? (page.key === "zip" || page.key === "country" ? "100%" : "50%")) === "100%"
                                                ? "bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-white shadow-xs"
                                                : "text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white",
                                        )}
                                    >
                                        100%
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center justify-between gap-3">
                                <Label
                                    htmlFor={`address-required-${page.key}`}
                                    className="cursor-pointer text-xs text-slate-600 dark:text-zinc-400"
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
// Contact Info
// ---------------------------------------------------------------------------

export function ContactInfoSettingsWidget({
    settings,
    onChange,
}: {
    settings: ContactInfoSettingsType
    onChange: (next: ContactInfoSettingsType) => void
}) {
    const updatePage = (
        key: string,
        patch: Partial<ContactInfoSettingsType["pages"][number]>,
    ) => {
        onChange({
            ...settings,
            pages: settings.pages.map((f) => (f.key === key ? { ...f, ...patch } : f)),
        })
    }

    const sorted = [...settings.pages].sort((a, b) => a.order - b.order)

    return (
        <div className="space-y-3">
            <FieldsPerRowSetting
                value={settings.fieldsPerRow}
                onChange={(fieldsPerRow) => onChange({ ...settings, fieldsPerRow })}
            />

            <p className="text-xs leading-5 text-slate-500 dark:text-zinc-400">
                Rename labels, set placeholders, and choose which parts are required, full/half width, or hidden.
            </p>
            {sorted.map((page) => (
                <div
                    key={page.key}
                    className="space-y-3 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-900/50 p-3 data-[hidden=true]:opacity-60"
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
                            title={page.hidden ? "Show field" : "Hide field"}
                            className="rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#1a1a20] p-2 text-slate-500 dark:text-zinc-400 hover:border-slate-300 dark:hover:border-zinc-700 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
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
                                className={CONTROL_CLASS + " px-3 placeholder:opacity-60"}
                                aria-label={`${page.label} placeholder`}
                                placeholder={DEFAULT_CONTACT_INFO_PLACEHOLDERS[page.key]}
                            />

                            <div className="flex items-center justify-between gap-3">
                                <Label className="cursor-pointer text-xs text-slate-600 dark:text-zinc-400">
                                    Width
                                </Label>
                                <div className="flex rounded-md border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#1a1a20] p-0.5 text-xs">
                                    <button
                                        type="button"
                                        onClick={() => updatePage(page.key, { width: "50%" })}
                                        className={cn(
                                            "px-2.5 py-1 rounded font-medium transition-all cursor-pointer",
                                            (page.width ?? (page.key === "company" ? "100%" : "50%")) === "50%"
                                                ? "bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-white shadow-xs"
                                                : "text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white",
                                        )}
                                    >
                                        50%
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => updatePage(page.key, { width: "100%" })}
                                        className={cn(
                                            "px-2.5 py-1 rounded font-medium transition-all cursor-pointer",
                                            (page.width ?? (page.key === "company" ? "100%" : "50%")) === "100%"
                                                ? "bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-white shadow-xs"
                                                : "text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white",
                                        )}
                                    >
                                        100%
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center justify-between gap-3">
                                <Label
                                    htmlFor={`contact-info-required-${page.key}`}
                                    className="cursor-pointer text-xs text-slate-600 dark:text-zinc-400"
                                >
                                    Required
                                </Label>
                                <Switch
                                    id={`contact-info-required-${page.key}`}
                                    checked={page.required}
                                    onCheckedChange={(required) =>
                                        updatePage(page.key, { required })
                                    }
                                />
                            </div>

                            {page.key === "phone" && (
                                <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-zinc-800">
                                    <PhoneSettingsWidget
                                        settings={
                                            settings.phone ?? {
                                                phoneVerification: false,
                                                countryCodeMode: "auto",
                                                defaultCountry: null,
                                            }
                                        }
                                        onChange={(phone) =>
                                            onChange({
                                                ...settings,
                                                phone,
                                            })
                                        }
                                    />
                                </div>
                            )}
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
                <Label className="text-sm font-medium text-slate-800 dark:text-zinc-200">{title}</Label>
                <span className="text-xs text-slate-500 dark:text-zinc-500">
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
                            className="rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#1a1a20] p-2 text-slate-500 dark:text-zinc-400 hover:border-rose-500/30 hover:text-rose-500 dark:hover:text-rose-400 disabled:pointer-events-none disabled:opacity-40 transition-colors cursor-pointer"
                        >
                            <X className="h-3.5 w-3.5" />
                        </button>
                    </div>
                ))}
            <button
                type="button"
                onClick={onAdd}
                disabled={items.length >= max}
                className="flex h-10 w-full items-center justify-center gap-1.5 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#1a1a20] text-xs font-medium text-slate-700 dark:text-zinc-300 hover:bg-black/[0.04] dark:hover:bg-white/[0.06] hover:border-slate-300 dark:hover:border-zinc-700 hover:text-slate-900 dark:hover:text-zinc-100 disabled:pointer-events-none disabled:opacity-40 transition-all cursor-pointer"
            >
                <Plus className="h-4 w-4" />
                Add {title === "Rows" ? "row" : "column"}
            </button>
        </div>
    )
}
