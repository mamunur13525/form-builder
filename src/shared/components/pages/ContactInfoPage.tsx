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
import { DEFAULT_CONTACT_INFO_PLACEHOLDERS } from "@/shared/constants/contact-info"
import type {
    ContactInfoPageSetting,
    FieldsPerRow,
    PhoneSettings,
} from "@/shared/types/common"
import { getFieldSpanClass } from "./fieldSpan"

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
