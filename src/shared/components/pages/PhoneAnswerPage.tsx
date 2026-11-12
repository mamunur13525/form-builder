import { useMemo, useState } from "react"
import { CountrySelect } from "@/shared/components/CountrySelect"
import {
    COUNTRY_PHONES,
    detectedCountry,
    findCountryPhone,
    formatNationalNumber,
    maxNationalDigits,
    type CountryPhone,
} from "@/shared/constants/country-phone"
import type { PhoneSettings } from "@/shared/types/common"
import { cn } from "@/lib/utils"

interface PhoneAnswerPageProps {
    value?: string
    onChange?: (value: string) => void
    settings: PhoneSettings
    placeholder?: string
    error?: string | null
    disabled?: boolean
    color?: string
    fontSizeClass?: string
}

/** Split a stored "+880 1712..." answer into its dial code and local part. */
function splitValue(value: string): { dialCode: string; local: string } {
    const trimmed = value?.trim() ?? ""
    if (!trimmed.startsWith("+")) return { dialCode: "", local: trimmed }
    const spaceIdx = trimmed.indexOf(" ")
    if (spaceIdx === -1) return { dialCode: trimmed, local: "" }
    return {
        dialCode: trimmed.slice(0, spaceIdx),
        local: trimmed.slice(spaceIdx + 1),
    }
}

/**
 * Phone input with a searchable country picker. The selected country decides
 * the dial code and the national number mask used for the placeholder and
 * as-you-type formatting.
 */
export function PhoneAnswerPage({
    value = "",
    onChange,
    settings,
    placeholder,
    error,
    disabled,
    color,
    fontSizeClass,
}: PhoneAnswerPageProps) {
    const fallback =
        settings.countryCodeMode === "specific"
            ? settings.defaultCountry
                ? findCountryPhone(settings.defaultCountry.iso2)
                : undefined
            : detectedCountry()

    // The picker's choice must win over the dial code: countries such as the US
    // and Canada share +1, so the value alone cannot tell them apart.
    const [pickedIso, setPickedIso] = useState<string | null>(null)
    const picked = pickedIso ? COUNTRY_PHONES.find((item) => item.iso2 === pickedIso) : undefined

    const parsed = useMemo(() => splitValue(value), [value])
    const parsedMatch = parsed.dialCode
        ? COUNTRY_PHONES.find((item) => item.dialCode === parsed.dialCode)
        : undefined
    // Prefer the configured/locale country when it shares the stored dial code.
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
                    "flex items-center gap-2 border-b pb-1 transition-colors duration-300",
                    error ? "border-destructive!" : !color && "border-gray-500 focus-within:border-gray-200",
                    disabled && "opacity-50",
                )}
                style={
                    color && !error
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
                    type="tel"
                    value={local}
                    disabled={disabled}
                    placeholder={country?.example ?? placeholder ?? "(201) 555-0123"}
                    onChange={(e) => {
                        const digits = e.target.value.replace(/\D/g, "").slice(0, maxDigits)
                        emit(dialCode, formatNationalNumber(digits, mask))
                    }}
                    className={cn(
                        "h-9 min-w-0 flex-1 border-0 bg-transparent p-0 text-2xl outline-none focus:outline-none focus:ring-0",
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
            {settings.phoneVerification && (
                <p className="text-xs text-muted-foreground">
                    We'll send an SMS code to verify this number.
                </p>
            )}
        </div>
    )
}
