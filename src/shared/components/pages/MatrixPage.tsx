import type { MatrixSettings } from "@/shared/types/common"

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
