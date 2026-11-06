import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { COUNTRIES, type Country } from "@/shared/constants/countries"
import type { PhoneSettings as PhoneSettingsType } from "@/shared/types/common"
import { ToggleRow, CONTROL_CLASS, OVERLAY_CLASS } from "./primitives"

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
                <Label className="text-sm font-medium text-zinc-200">Default country code</Label>
                <p className="text-xs leading-5 text-zinc-400">
                    We'll auto-select the country code from the respondent's country. They can
                    still change it before submitting.
                </p>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => onChange({ ...settings, countryCodeMode: "auto" })}
                        className={`flex h-[40px] flex-1 items-center justify-center rounded-xl border px-4 text-xs font-medium transition-all cursor-pointer ${
                            settings.countryCodeMode === "auto"
                                ? "border-[#FF5722] bg-[#FF5722]/15 text-[#FF5722]"
                                : "border-zinc-800 bg-[#1a1a20] text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
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
                        className={`flex h-[40px] flex-1 items-center justify-center rounded-xl border px-4 text-xs font-medium transition-all cursor-pointer ${
                            settings.countryCodeMode === "specific"
                                ? "border-[#FF5722] bg-[#FF5722]/15 text-[#FF5722]"
                                : "border-zinc-800 bg-[#1a1a20] text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
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
            <SelectTrigger className={CONTROL_CLASS + " w-full [&>svg:last-child]:text-zinc-400"}>
                <SelectValue placeholder="Select a country" />
            </SelectTrigger>
            <SelectContent className={OVERLAY_CLASS}>
                {COUNTRIES.map((country) => (
                    <SelectItem
                        key={country.iso2}
                        value={country.iso2}
                        className="cursor-pointer rounded-lg px-3 py-2 text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 focus:bg-zinc-800 focus:text-white"
                    >
                        <span className="flex items-center gap-2">
                            <span className="w-16 shrink-0 text-zinc-500 font-normal">
                                {country.dialCode}
                            </span>
                            <span className="text-zinc-200 font-medium">{country.name}</span>
                        </span>
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    )
}
