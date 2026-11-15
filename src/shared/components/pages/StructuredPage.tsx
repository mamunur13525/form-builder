import { useId, useMemo, useState } from "react"
import { cn } from "@/lib/utils"
import { CountrySelect } from "@/shared/components/CountrySelect"
import {
    COUNTRY_PHONES,
    detectedCountry,
    findCountryPhone,
    formatNationalNumber,
    maxNationalDigits,
    type CountryPhone,
} from "@/shared/constants/country-phone"
import { DEFAULT_ADDRESS_PLACEHOLDERS } from "@/shared/constants/address"
import { DEFAULT_CONTACT_INFO_PLACEHOLDERS } from "@/shared/constants/contact-info"
import type {
    AddressPageSetting,
    ContactInfoPageSetting,
    FieldWidth,
    FieldsPerRow,
    MatrixSettings,
    OpinionScaleSettings,
    PhoneSettings,
} from "@/shared/types/common"

function getFieldSpanClass(
    key: string,
    width?: FieldWidth,
    defaultWideKeys: string[] = [],
    mobileCols: number = 1,
    desktopCols: number = 2,
    isMobileView?: boolean,
): string {
    const isFull = width ? width === "100%" : defaultWideKeys.includes(key)
    if (isMobileView) {
        return mobileCols === 2 && isFull ? "col-span-2" : "col-span-1"
    }
    const mobileSpan = mobileCols === 2 && isFull ? "col-span-2" : "col-span-1"
    const desktopSpan = desktopCols === 2 && isFull ? "md:col-span-2" : "md:col-span-1"
    return `${mobileSpan} ${desktopSpan}`
}

// ---------------------------------------------------------------------------
// Address
// ---------------------------------------------------------------------------

type AddressValue = Record<string, string>

interface AddressPageProps {
    value?: AddressValue
    onChange?: (value: AddressValue) => void
    pages: AddressPageSetting[]
    fieldsPerRow?: FieldsPerRow
    isMobileView?: boolean
    disabled?: boolean
    color?: string
    fontSizeClass?: string
}

export function AddressPage({
    value,
    onChange,
    pages,
    fieldsPerRow,
    isMobileView,
    disabled,
    color,
    fontSizeClass,
}: AddressPageProps) {
    const idPrefix = useId()
    const current = value ?? {}
    const visible = pages
        .filter((f) => !f.hidden)
        .slice()
        .sort((a, b) => a.order - b.order)

    const mobileCols = fieldsPerRow?.mobile === 2 ? 2 : 1
    const desktopCols = fieldsPerRow?.desktop === 1 ? 1 : 2
    const defaultWideKeys = ["zip", "country"]

    return (
        <div
            className={cn(
                "grid gap-x-6 gap-y-6",
                isMobileView
                    ? mobileCols === 2 ? "grid-cols-2" : "grid-cols-1"
                    : [
                        "md:gap-y-8",
                        mobileCols === 2 ? "grid-cols-2" : "grid-cols-1",
                        desktopCols === 1 ? "md:grid-cols-1" : "md:grid-cols-2",
                    ],
            )}
        >
            {visible.map((page) => {
                const id = `${idPrefix}-${page.key}`
                const spanClass = getFieldSpanClass(
                    page.key,
                    page.width,
                    defaultWideKeys,
                    mobileCols,
                    desktopCols,
                    isMobileView,
                )
                return (
                    <div
                        key={page.key}
                        className={cn("space-y-2", spanClass)}
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
// Contact Info
// ---------------------------------------------------------------------------

type ContactInfoValue = Record<string, string>

interface ContactInfoPageProps {
    value?: ContactInfoValue
    onChange?: (value: ContactInfoValue) => void
    pages: ContactInfoPageSetting[]
    phoneSettings?: PhoneSettings
    fieldsPerRow?: FieldsPerRow
    isMobileView?: boolean
    disabled?: boolean
    color?: string
    fontSizeClass?: string
}

function splitPhoneValue(value: string): { dialCode: string; local: string } {
    const trimmed = value?.trim() ?? ""
    if (!trimmed.startsWith("+")) return { dialCode: "", local: trimmed }
    const spaceIdx = trimmed.indexOf(" ")
    if (spaceIdx === -1) return { dialCode: trimmed, local: "" }
    return {
        dialCode: trimmed.slice(0, spaceIdx),
        local: trimmed.slice(spaceIdx + 1),
    }
}

function ContactInfoPhoneField({
    id,
    value = "",
    onChange,
    settings,
    placeholder,
    disabled,
    color,
    fontSizeClass,
}: {
    id: string
    value?: string
    onChange?: (value: string) => void
    settings?: PhoneSettings
    placeholder?: string
    disabled?: boolean
    color?: string
    fontSizeClass?: string
}) {
    const phoneSettings: PhoneSettings = settings ?? {
        phoneVerification: false,
        countryCodeMode: "auto",
        defaultCountry: null,
    }

    const fallback =
        phoneSettings.countryCodeMode === "specific"
            ? phoneSettings.defaultCountry
                ? findCountryPhone(phoneSettings.defaultCountry.iso2)
                : undefined
            : detectedCountry()

    const [pickedIso, setPickedIso] = useState<string | null>(null)
    const picked = pickedIso ? COUNTRY_PHONES.find((item) => item.iso2 === pickedIso) : undefined

    const parsed = useMemo(() => splitPhoneValue(value), [value])
    const parsedMatch = parsed.dialCode
        ? COUNTRY_PHONES.find((item) => item.dialCode === parsed.dialCode)
        : undefined
    const country =
        picked ??
        (fallback && parsed.dialCode === fallback.dialCode ? fallback : (parsedMatch ?? fallback))
    const dialCode = parsed.dialCode || country?.dialCode || ""

    const mask = country?.format ?? "############"
    const maxDigits = maxNationalDigits(mask)
    const localDigits = parsed.local.replace(/\D/g, "").slice(0, maxDigits)
    const local = formatNationalNumber(localDigits, mask)

    const emit = (nextDial: string, nextLocal: string) => {
        const dial = nextDial.trim()
        const localPart = nextLocal.trim()
        if (!dial && !localPart) {
            onChange?.("")
            return
        }
        onChange?.(dial ? `${dial} ${localPart}`.trim() : localPart)
    }

    const chooseCountry = (next: CountryPhone) => {
        setPickedIso(next.iso2)
        const digits = localDigits.slice(0, maxNationalDigits(next.format))
        emit(next.dialCode, formatNationalNumber(digits, next.format))
    }

    return (
        <div className="space-y-1">
            <div
                className={cn(
                    "flex h-9 items-center gap-1.5 border-b focus-within:border-b-2 transition-colors duration-300",
                    !color && "border-gray-500 focus-within:border-gray-200",
                    disabled && "opacity-50",
                )}
                style={
                    color
                        ? {
                            borderColor: `color-mix(in oklab, ${color} 40%, transparent)`,
                        }
                        : undefined
                }
            >
                <CountrySelect
                    variant="flag"
                    value={country?.iso2 ?? ""}
                    onChange={chooseCountry}
                    disabled={disabled}
                    style={color ? { color } : undefined}
                />

                <input
                    id={id}
                    type="tel"
                    value={local}
                    disabled={disabled}
                    placeholder={placeholder || country?.example || "(201) 555-0123"}
                    onChange={(e) => {
                        const digits = e.target.value.replace(/\D/g, "").slice(0, maxDigits)
                        emit(dialCode, formatNationalNumber(digits, mask))
                    }}
                    className={cn(
                        "h-full min-w-0 flex-1 border-0 bg-transparent p-0 text-base outline-none focus:outline-none focus:ring-0",
                        fontSizeClass,
                    )}
                    style={
                        color
                            ? {
                                color,
                                ...({
                                    "--input-placeholder-color": `color-mix(in oklab, ${color} 40%, transparent)`,
                                } as React.CSSProperties),
                            }
                            : undefined
                    }
                />
            </div>
            {phoneSettings.phoneVerification && (
                <p className="text-xs text-muted-foreground">
                    We'll send an SMS code to verify this number.
                </p>
            )}
        </div>
    )
}

export function ContactInfoPage({
    value,
    onChange,
    pages,
    phoneSettings,
    fieldsPerRow,
    isMobileView,
    disabled,
    color,
    fontSizeClass,
}: ContactInfoPageProps) {
    const idPrefix = useId()
    const current = value ?? {}
    const visible = pages
        .filter((f) => !f.hidden)
        .slice()
        .sort((a, b) => a.order - b.order)

    const mobileCols = fieldsPerRow?.mobile === 2 ? 2 : 1
    const desktopCols = fieldsPerRow?.desktop === 1 ? 1 : 2
    const defaultWideKeys = ["company"]

    return (
        <div
            className={cn(
                "grid gap-x-6 gap-y-6",
                isMobileView
                    ? mobileCols === 2 ? "grid-cols-2" : "grid-cols-1"
                    : [
                        "md:gap-y-8",
                        mobileCols === 2 ? "grid-cols-2" : "grid-cols-1",
                        desktopCols === 1 ? "md:grid-cols-1" : "md:grid-cols-2",
                    ],
            )}
        >
            {visible.map((page) => {
                const id = `${idPrefix}-${page.key}`
                const spanClass = getFieldSpanClass(
                    page.key,
                    page.width,
                    defaultWideKeys,
                    mobileCols,
                    desktopCols,
                    isMobileView,
                )
                return (
                    <div
                        key={page.key}
                        className={cn("space-y-2", spanClass)}
                    >
                        <label
                            htmlFor={id}
                            className={cn("text-base font-medium text-foreground", fontSizeClass)}
                        >
                            {page.label}
                            {page.required && <span className="ml-0.5 text-destructive">*</span>}
                        </label>
                        {page.key === "phone" ? (
                            <ContactInfoPhoneField
                                id={id}
                                value={current[page.key] ?? ""}
                                onChange={(v) =>
                                    onChange?.({ ...current, [page.key]: v })
                                }
                                settings={phoneSettings}
                                placeholder={page.placeholder}
                                disabled={disabled}
                                color={color}
                                fontSizeClass={fontSizeClass}
                            />
                        ) : (
                            <input
                                id={id}
                                type={page.key === "email" ? "email" : "text"}
                                value={current[page.key] ?? ""}
                                placeholder={page.placeholder || DEFAULT_CONTACT_INFO_PLACEHOLDERS[page.key]}
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
                        )}
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
            <div
                className="grid gap-2"
                style={{ gridTemplateColumns: `repeat(${count}, minmax(0, 1fr))` }}
            >
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
                                "h-11 w-full rounded-lg border px-1 text-base transition-colors",
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
