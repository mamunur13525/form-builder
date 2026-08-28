import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { COUNTRIES, type Country } from "@/shared/constants/countries"
import type { PhoneSettings as PhoneSettingsType } from "@/shared/types/common"
import { ToggleRow, CONTROL_CLASS } from "./primitives"

/** Phone settings: verification + country code mode + specific country picker. */
export function PhoneSettingsWidget({
    settings,
    onChange,
}: {
    settings: PhoneSettingsType
    onChange: (next: PhoneSettingsType) => void
}) {
    return (
        <div className="space-y-3">
            <ToggleRow
                id="phone-verification"
                label="Phone verification"
                description="Sends an SMS code to verify the respondent's phone number."
                checked={settings.phoneVerification}
                onCheckedChange={(checked) => onChange({ ...settings, phoneVerification: checked })}
            />

            <div className="space-y-1.5">
                <Label className="text-base text-[var(--editorial-body)]">Default country code</Label>
                <p className="text-xs leading-5 text-[var(--editorial-subtle)]">
                    We'll auto-select the country code from the respondent's country. They can
                    still change it before submitting.
                </p>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => onChange({ ...settings, countryCodeMode: "auto" })}
                        className={`editorial-transition flex h-[44px] flex-1 items-center justify-center rounded-[12px] border px-4 text-sm ${
                            settings.countryCodeMode === "auto"
                                ? "border-[var(--editorial-primary-ring)] bg-[var(--editorial-primary-light)] font-medium text-[var(--foreground)]"
                                : "border-[var(--border)] bg-[var(--secondary)] text-[var(--editorial-body)] hover:border-[var(--editorial-primary-ring)] hover:bg-[var(--editorial-primary-light)]"
                        }`}
                    >
                        Auto-detect
                    </button>
                    <button
                        type="button"
                        onClick={() =>
                            onChange({
                                ...settings,
                                countryCodeMode: "specific",
                                defaultCountry: settings.defaultCountry ?? {
                                    iso2: "BD",
                                    name: "Bangladesh",
                                    dialCode: "+880",
                                },
                            })
                        }
                        className={`editorial-transition flex h-[44px] flex-1 items-center justify-center rounded-[12px] border px-4 text-sm ${
                            settings.countryCodeMode === "specific"
                                ? "border-[var(--editorial-primary-ring)] bg-[var(--editorial-primary-light)] font-medium text-[var(--foreground)]"
                                : "border-[var(--border)] bg-[var(--secondary)] text-[var(--editorial-body)] hover:border-[var(--editorial-primary-ring)] hover:bg-[var(--editorial-primary-light)]"
                        }`}
                    >
                        Specific
                    </button>
                </div>

                {settings.countryCodeMode === "specific" && (
                    <CountrySelect
                        value={settings.defaultCountry?.iso2 ?? ""}
                        onChange={(country) =>
                            onChange({
                                ...settings,
                                defaultCountry: {
                                    iso2: country.iso2,
                                    name: country.name,
                                    dialCode: country.dialCode,
                                },
                            })
                        }
                    />
                )}
            </div>
        </div>
    )
}

/** A searchable-ish select of all countries (iso2 → Country). */
function CountrySelect({
    value,
    onChange,
}: {
    value: string
    onChange: (country: Country) => void
}) {
    return (
        <Select
            value={value}
            onValueChange={(iso2) => {
                const country = COUNTRIES.find((c) => c.iso2 === iso2)
                if (country) onChange(country)
            }}
        >
            <SelectTrigger className={CONTROL_CLASS + " w-full"}>
                <SelectValue placeholder="Select a country" />
            </SelectTrigger>
            <SelectContent>
                {COUNTRIES.map((country) => (
                    <SelectItem key={country.iso2} value={country.iso2}>
                        <span className="flex items-center gap-2">
                            <span className="w-16 shrink-0 text-[var(--editorial-subtle)]">
                                {country.dialCode}
                            </span>
                            {country.name}
                        </span>
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    )
}
