import { useId } from "react"
import { cn } from "@/lib/utils"
import { DEFAULT_ADDRESS_PLACEHOLDERS } from "@/shared/constants/address"
import type { AddressPageSetting, MatrixSettings, OpinionScaleSettings } from "@/shared/types/common"

// ---------------------------------------------------------------------------
// Address
// ---------------------------------------------------------------------------

type AddressValue = Record<string, string>

interface AddressPageProps {
    value?: AddressValue
    onChange?: (value: AddressValue) => void
    pages: AddressPageSetting[]
    disabled?: boolean
    color?: string
    fontSizeClass?: string
}

export function AddressPage({ value, onChange, pages, disabled, color, fontSizeClass }: AddressPageProps) {
    const idPrefix = useId()
    const current = value ?? {}
    const visible = pages
        .filter((f) => !f.hidden)
        .slice()
        .sort((a, b) => a.order - b.order)

    // Address, city and state pair up; zip and country span the full row.
    const isWide = (key: string) => key === "zip" || key === "country"

    return (
        <div className="grid grid-cols-2 gap-x-6 gap-y-8">
            {visible.map((page) => {
                const id = `${idPrefix}-${page.key}`
                return (
                    <div
                        key={page.key}
                        className={cn("space-y-2", isWide(page.key) && "col-span-2")}
                    >
                        <label
                            htmlFor={id}
                            className={cn("text-base font-medium text-foreground", fontSizeClass)}
                        >
                            {page.label}
                            {page.required && <span className="ml-0.5 text-destructive">*</span>}
                        </label>
                        <input
                            id={id}
                            type="text"
                            value={current[page.key] ?? ""}
                            placeholder={page.placeholder || DEFAULT_ADDRESS_PLACEHOLDERS[page.key]}
                            disabled={disabled}
                            onChange={(e) =>
                                onChange?.({ ...current, [page.key]: e.target.value })
                            }
                            className={cn(
                                "h-9 w-full rounded-none border-0 border-b focus:border-b-2 bg-transparent px-0 text-base outline-none transition-colors duration-300 focus-visible:outline-none focus-visible:ring-0",
                                !color && "border-gray-500 focus:border-gray-200",
                                fontSizeClass,
                            )}
                            style={
                                color
                                    ? {
                                        color,
                                        borderColor: `color-mix(in oklab, ${color} 40%, transparent)`,
                                        ...({
                                            "--input-placeholder-color": `color-mix(in oklab, ${color} 40%, transparent)`,
                                        } as React.CSSProperties),
                                    }
                                    : undefined
                            }
                        />
                    </div>
                )
            })}
        </div>
    )
}

// ---------------------------------------------------------------------------
// Opinion scale
// ---------------------------------------------------------------------------

interface OpinionScalePageProps {
    value?: number
    onChange?: (value: number) => void
    settings: OpinionScaleSettings
    disabled?: boolean
    color?: string
}

export function OpinionScalePage({
    value,
    onChange,
    settings,
    disabled,
    color,
}: OpinionScalePageProps) {
    const { min, max, leftLabel, rightLabel } = settings
    const count = Math.max(0, max - min + 1)
    const numbers = Array.from({ length: count }, (_, i) => min + i)

    return (
        <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
                {numbers.map((n) => {
                    const isSelected = value === n
                    return (
                        <button
                            key={n}
                            type="button"
                            disabled={disabled}
                            onClick={() => onChange?.(n)}
                            style={
                                color
                                    ? isSelected
                                        ? {
                                            borderColor: color,
                                            backgroundColor: color,
                                            color: "#ffffff",
                                        }
                                        : {
                                            borderColor: `color-mix(in oklab, ${color} 30%, transparent)`,
                                            backgroundColor: `color-mix(in oklab, ${color} 5%, transparent)`,
                                            color,
                                        }
                                    : undefined
                            }
                            className={cn(
                                "h-11 min-w-11 rounded-lg border px-2 text-base transition-colors",
                                !color && (
                                    isSelected
                                        ? "border-primary bg-primary text-primary-foreground"
                                        : "hover:bg-muted/50"
                                ),
                                disabled && "opacity-50 pointer-events-none",
                            )}
                        >
                            {n}
                        </button>
                    )
                })}
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

interface MatrixPageProps {
    value?: MatrixValue
    onChange?: (value: MatrixValue) => void
    settings: MatrixSettings
    disabled?: boolean
}

export function MatrixPage({ value, onChange, settings, disabled }: MatrixPageProps) {
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
