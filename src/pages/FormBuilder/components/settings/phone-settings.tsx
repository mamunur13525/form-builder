import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { CountrySelect } from "@/shared/components/CountrySelect"
import type { CountryCodeMode, PhoneSettings as PhoneSettingsType } from "@/shared/types/common"
import { COUNTRY_PHONES } from "@/shared/constants/country-phone"
import { ToggleRow, CONTROL_CLASS, TAB_LIST_CLASS, TAB_TRIGGER_CLASS } from "./primitives"

const DEFAULT_COUNTRY = COUNTRY_PHONES.find((country) => country.iso2 === "BD") ?? COUNTRY_PHONES[0]

/** Phone settings: verification + country code mode + specific country picker. */
export function PhoneSettingsWidget({
    settings,
    onChange,
}: {
    settings: PhoneSettingsType
    onChange: (next: PhoneSettingsType) => void
}) {
    const setMode = (mode: CountryCodeMode) => {
        onChange({
            ...settings,
            countryCodeMode: mode,
            defaultCountry:
                mode === "specific"
                    ? (settings.defaultCountry ?? {
                          iso2: DEFAULT_COUNTRY.iso2,
                          name: DEFAULT_COUNTRY.name,
                          dialCode: DEFAULT_COUNTRY.dialCode,
                      })
                    : settings.defaultCountry,
        })
    }

    return (
        <div className="space-y-4">
            <ToggleRow
                id="phone-verification"
                label="Phone verification"
                description="Sends an SMS code to verify the respondent's phone number."
                checked={settings.phoneVerification}
                onCheckedChange={(checked) => onChange({ ...settings, phoneVerification: checked })}
            />

            <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-800 dark:text-zinc-100">
                    Default country code
                </Label>

                <Tabs
                    value={settings.countryCodeMode}
                    onValueChange={(value) => setMode(value === "specific" ? "specific" : "auto")}
                >
                    <TabsList className={TAB_LIST_CLASS}>
                        <TabsTrigger value="auto" className={TAB_TRIGGER_CLASS}>
                            Auto detect
                        </TabsTrigger>
                        <TabsTrigger value="specific" className={TAB_TRIGGER_CLASS}>
                            Specific
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent
                        value="auto"
                        className="text-xs leading-5 text-slate-500 dark:text-zinc-500"
                    >
                        We'll auto-select the country code from the respondent's country. They can
                        still change it before submitting.
                    </TabsContent>

                    <TabsContent value="specific" className="space-y-2">
                        <CountrySelect
                            value={settings.defaultCountry?.iso2 ?? ""}
                            className={CONTROL_CLASS + " w-full [&>svg:last-child]:text-slate-400"}
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
                        <p className="text-xs leading-5 text-slate-500 dark:text-zinc-500">
                            Respondents will see this country code by default. They can still
                            change it before submitting.
                        </p>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}
