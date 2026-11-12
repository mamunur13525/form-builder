import { COUNTRIES, countryFromLocale, findCountryByIso2, flagEmoji, type Country } from "./countries.ts"
import { TIMEZONE_COUNTRY } from "./timezones.ts"

/**
 * Country data needed by the phone input: identity, dial code, flag, and the
 * national number mask used for the placeholder and as-you-type formatting.
 */
export interface CountryPhone extends Country {
    /** Regional-indicator emoji, precomputed so the picker does not rebuild it. */
    flag: string
    /** National mask: `#` is a digit, every other character is a separator. */
    format: string
    /** Example national number shown while the field is empty. */
    example: string
}

const GENERIC_MASK = { format: "############", example: "123 456 7890" }

/** National number masks for the countries we format; the rest use the generic mask. */
const PHONE_MASKS: Record<string, { format: string; example: string }> = {
    US: { format: "(###) ###-####", example: "(201) 555-0123" },
    CA: { format: "(###) ###-####", example: "(506) 234-5678" },
    GB: { format: "##### ######", example: "07123 456789" },
    BD: { format: "#####-######", example: "01712-345678" },
    IN: { format: "##### #####", example: "98765 43210" },
    PK: { format: "### #######", example: "0300 1234567" },
    AU: { format: "### ### ###", example: "041 234 567" },
    NZ: { format: "## ### ####", example: "021 123 4567" },
    DE: { format: "#### #######", example: "0151 23456789" },
    FR: { format: "# ## ## ## ##", example: "6 12 34 56 78" },
    ES: { format: "### ## ## ##", example: "612 34 56 78" },
    IT: { format: "### ### ####", example: "312 345 6789" },
    NL: { format: "## ### ####", example: "06 1234 5678" },
    BE: { format: "### ## ## ##", example: "047 12 34 56" },
    CH: { format: "## ### ## ##", example: "079 123 45 67" },
    AT: { format: "### ######", example: "066 1234567" },
    SE: { format: "##-### ## ##", example: "070-123 45 67" },
    NO: { format: "### ## ###", example: "406 12 345" },
    DK: { format: "## ## ## ##", example: "20 12 34 56" },
    FI: { format: "## ### ####", example: "040 123 4567" },
    IE: { format: "## ### ####", example: "085 123 4567" },
    PT: { format: "### ### ###", example: "912 345 678" },
    PL: { format: "### ### ###", example: "512 345 678" },
    BR: { format: "(##) #####-####", example: "(11) 91234-5678" },
    MX: { format: "## #### ####", example: "55 1234 5678" },
    AR: { format: "## ####-####", example: "11 2345-6789" },
    ZA: { format: "## ### ####", example: "082 123 4567" },
    NG: { format: "### ### ####", example: "080 1234 5678" },
    KE: { format: "### ######", example: "071 2345678" },
    EG: { format: "## #### ####", example: "10 1234 5678" },
    SA: { format: "## ### ####", example: "05 1234 5678" },
    AE: { format: "## ### ####", example: "05 1234 5678" },
    TR: { format: "### ### ## ##", example: "053 123 45 67" },
    RU: { format: "### ###-##-##", example: "912 345-67-89" },
    UA: { format: "## ### ####", example: "50 123 4567" },
    CN: { format: "### #### ####", example: "131 2345 6789" },
    JP: { format: "##-####-####", example: "90-1234-5678" },
    KR: { format: "##-####-####", example: "10-1234-5678" },
    SG: { format: "#### ####", example: "8123 4567" },
    MY: { format: "##-### ####", example: "12-345 6789" },
    TH: { format: "##-###-####", example: "81-234-5678" },
    VN: { format: "### ### ####", example: "091 234 5678" },
    PH: { format: "### ### ####", example: "091 234 5678" },
    ID: { format: "###-###-####", example: "081-234-5678" },
    HK: { format: "#### ####", example: "9123 4567" },
    TW: { format: "### ### ###", example: "091 234 5678" },
}

/**
 * Countries sharing a dial code also share its national format, so a country
 * without its own mask (e.g. Guernsey on +44) still shows a usable example.
 */
const dialCodeByIso2 = new Map(COUNTRIES.map((country) => [country.iso2, country.dialCode]))
const maskByDialCode: Record<string, { format: string; example: string }> = {}
for (const [iso2, mask] of Object.entries(PHONE_MASKS)) {
    const dialCode = dialCodeByIso2.get(iso2)
    if (dialCode && !maskByDialCode[dialCode]) maskByDialCode[dialCode] = mask
}

/** Every country with its flag and phone mask, built once at module load. */
export const COUNTRY_PHONES: CountryPhone[] = COUNTRIES.map((country) => ({
    ...country,
    flag: flagEmoji(country.iso2),
    ...(PHONE_MASKS[country.iso2] ?? maskByDialCode[country.dialCode] ?? GENERIC_MASK),
}))

export function findCountryPhone(iso2: string): CountryPhone | undefined {
    const country = findCountryByIso2(iso2)
    return country ? COUNTRY_PHONES.find((item) => item.iso2 === country.iso2) : undefined
}

/** Country guessed from a BCP-47 locale, with its phone mask. */
export function countryPhoneFromLocale(locale: string): CountryPhone | undefined {
    const country = countryFromLocale(locale)
    return country ? findCountryPhone(country.iso2) : undefined
}

/** Country guessed from an IANA timezone such as `Asia/Dhaka`. */
export function countryPhoneFromTimezone(timezone: string): CountryPhone | undefined {
    const iso2 = TIMEZONE_COUNTRY[timezone]
    return iso2 ? findCountryPhone(iso2) : undefined
}

/**
 * Best-effort country for the current browser: the timezone is the strongest
 * signal, with the UI language as a fallback for `Etc/UTC` and unknown zones.
 */
export function detectedCountry(): CountryPhone | undefined {
    if (typeof navigator === "undefined") return undefined
    let timezone = ""
    try {
        timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
    } catch {
        // No Intl: fall through to the locale.
    }
    return countryPhoneFromTimezone(timezone) ?? countryPhoneFromLocale(navigator.language || "")
}

/** How many national digits the mask accepts. */
export function maxNationalDigits(mask: string): number {
    return mask.split("#").length - 1
}

/**
 * Apply a national mask to raw digits. Separators are only added when more
 * digits follow, and extra digits past the mask are appended unchanged.
 */
export function formatNationalNumber(digits: string, mask: string): string {
    const clean = digits.replace(/\D/g, "")
    let formatted = ""
    let cursor = 0

    for (const char of mask) {
        if (cursor >= clean.length) break
        if (char === "#") {
            formatted += clean[cursor]
            cursor++
        } else {
            formatted += char
        }
    }

    return cursor < clean.length ? formatted + clean.slice(cursor) : formatted
}
