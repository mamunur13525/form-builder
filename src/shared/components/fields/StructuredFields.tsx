import { cn } from "@/lib/utils"
import type { AddressFieldSetting, MatrixSettings, OpinionScaleSettings } from "@/shared/types/common"

// ---------------------------------------------------------------------------
// Address
// ---------------------------------------------------------------------------

type AddressValue = Record<string, string>

interface AddressFieldProps {
    value?: AddressValue
    onChange?: (value: AddressValue) => void
    fields: AddressFieldSetting[]
    disabled?: boolean
    color?: string
    fontSizeClass?: string
}

export function AddressField({ value, onChange, fields, disabled, color, fontSizeClass }: AddressFieldProps) {
    const current = value ?? {}
    const visible = fields
        .filter((f) => !f.hidden)
        .slice()
        .sort((a, b) => a.order - b.order)

    // address1 / address2 span the full row; the rest pair up two per row.
    const isWide = (key: string) => key === "address1" || key === "address2"

    return (
        <div className="grid grid-cols-2 gap-3">
            {visible.map((field) => (
                <div
                    key={field.key}
                    className={cn("space-y-1", isWide(field.key) && "col-span-2")}
                >
                    <label className="text-sm text-muted-foreground">
                        {field.label}
                        {field.required && <span className="ml-0.5 text-destructive">*</span>}
                    </label>
                    <input
                        type="text"
                        value={current[field.key] ?? ""}
                        placeholder={field.placeholder}
                        disabled={disabled}
                        onChange={(e) =>
                            onChange?.({ ...current, [field.key]: e.target.value })
                        }
                        className={cn(
                            "h-10 w-full rounded-md border border-input bg-background px-3 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50",
                            fontSizeClass,
                        )}
                        style={color ? { color } : undefined}
                    />
                </div>
            ))}
        </div>
    )
}

// ---------------------------------------------------------------------------
// Opinion scale
// ---------------------------------------------------------------------------

interface OpinionScaleFieldProps {
    value?: number
    onChange?: (value: number) => void
    settings: OpinionScaleSettings
    disabled?: boolean
}

export function OpinionScaleField({
    value,
    onChange,
    settings,
    disabled,
}: OpinionScaleFieldProps) {
    const { min, max, leftLabel, rightLabel } = settings
    const count = Math.max(0, max - min + 1)
    const numbers = Array.from({ length: count }, (_, i) => min + i)

    return (
        <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
                {numbers.map((n) => (
                    <button
                        key={n}
                        type="button"
                        disabled={disabled}
                        onClick={() => onChange?.(n)}
                        className={cn(
                            "h-11 min-w-11 rounded-md border px-2 text-base transition-colors",
                            value === n
                                ? "border-primary bg-primary text-primary-foreground"
                                : "hover:bg-muted/50",
                            disabled && "opacity-50 pointer-events-none",
                        )}
                    >
                        {n}
                    </button>
                ))}
            </div>
            {(leftLabel || rightLabel) && (
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{leftLabel}</span>
                    <span>{rightLabel}</span>
                </div>
            )}
        </div>
    )
}

// ---------------------------------------------------------------------------
// Matrix
// ---------------------------------------------------------------------------

type MatrixValue = Record<string, string | string[]>

interface MatrixFieldProps {
    value?: MatrixValue
    onChange?: (value: MatrixValue) => void
    settings: MatrixSettings
    disabled?: boolean
}

export function MatrixField({ value, onChange, settings, disabled }: MatrixFieldProps) {
    const current = value ?? {}
    const rows = settings.rows.slice().sort((a, b) => a.order - b.order)
    const columns = settings.columns.slice().sort((a, b) => a.order - b.order)
    const multiple = settings.allowMultiplePerRow

    const isSelected = (rowKey: string, colKey: string) => {
        const cell = current[rowKey]
        if (Array.isArray(cell)) return cell.includes(colKey)
        return cell === colKey
    }

    const toggle = (rowKey: string, colKey: string) => {
        if (disabled) return
        if (multiple) {
            const cell = current[rowKey]
            const list = Array.isArray(cell) ? cell : cell ? [cell] : []
            const next = list.includes(colKey)
                ? list.filter((c) => c !== colKey)
                : [...list, colKey]
            onChange?.({ ...current, [rowKey]: next })
            return
        }
        onChange?.({ ...current, [rowKey]: colKey })
    }

    if (rows.length === 0 || columns.length === 0) {
        return (
            <p className="text-sm text-muted-foreground">
                Add rows and columns in the settings panel.
            </p>
        )
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
                <thead>
                    <tr>
                        <th className="border-b p-2 text-left font-medium" />
                        {columns.map((col) => (
                            <th
                                key={col.key}
                                className="border-b p-2 text-center text-xs font-medium text-muted-foreground"
                            >
                                {col.label}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row) => (
                        <tr key={row.key}>
                            <td className="border-b p-2 text-left">{row.label}</td>
                            {columns.map((col) => (
                                <td key={col.key} className="border-b p-2 text-center">
                                    <input
                                        type={multiple ? "checkbox" : "radio"}
                                        name={`matrix_${row.key}`}
                                        checked={isSelected(row.key, col.key)}
                                        onChange={() => toggle(row.key, col.key)}
                                        disabled={disabled}
                                        className="h-4 w-4 accent-primary"
                                    />
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
