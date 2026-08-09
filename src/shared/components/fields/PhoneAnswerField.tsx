import { useMemo } from "react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { COUNTRIES } from "@/shared/constants/countries"
import type { PhoneSettings } from "@/shared/types/common"
import { cn } from "@/lib/utils"

interface PhoneAnswerFieldProps {
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
 * Phone input with a country-code selector. The configured default is
 * pre-selected, and the respondent can still change it before submitting.
 */
export function PhoneAnswerField({
    value = "",
    onChange,
    settings,
    placeholder,
    error,
    disabled,
    color,
    fontSizeClass,
}: PhoneAnswerFieldProps) {
    const configuredDial =
        settings.countryCodeMode === "specific" && settings.defaultCountry
            ? settings.defaultCountry.dialCode
            : ""

    const parsed = useMemo(() => splitValue(value), [value])
    const dialCode = parsed.dialCode || configuredDial

    // Pick the first country matching the dial code for the select's value.
    const selectedIso =
        COUNTRIES.find((c) => c.dialCode === dialCode)?.iso2 ??
        (settings.countryCodeMode === "specific" ? settings.defaultCountry?.iso2 : undefined) ??
        ""

    const emit = (nextDial: string, nextLocal: string) => {
        const dial = nextDial.trim()
        const local = nextLocal.trim()
        if (!dial && !local) {
            onChange?.("")
            return
        }
        onChange?.(dial ? `${dial} ${local}`.trim() : local)
    }

    return (
        <div className="space-y-1">
            <div className="flex items-stretch gap-2">
                <Select
                    value={selectedIso}
                    disabled={disabled}
                    onValueChange={(iso2: string | null) => {
                        if (!iso2) return
                        const country = COUNTRIES.find((c) => c.iso2 === iso2)
                        if (country) emit(country.dialCode, parsed.local)
                    }}
                >
                    <SelectTrigger className="h-11 w-28 shrink-0">
                        <SelectValue placeholder="Code" />
                    </SelectTrigger>
                    <SelectContent>
                        {COUNTRIES.map((country) => (
                            <SelectItem key={country.iso2} value={country.iso2}>
                                <span className="flex items-center gap-2">
                                    <span className="w-14 shrink-0 text-muted-foreground">
                                        {country.dialCode}
                                    </span>
                                    {country.name}
                                </span>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <input
                    type="tel"
                    value={parsed.local}
                    disabled={disabled}
                    placeholder={placeholder || "Phone number"}
                    onChange={(e) => emit(dialCode, e.target.value)}
                    className={cn(
                        "h-11 flex-1 rounded-md border bg-background px-3 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50",
                        fontSizeClass,
                        error ? "border-destructive" : "border-input",
                    )}
                    style={color ? { color } : undefined}
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
