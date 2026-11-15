import type { CSSProperties } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"
import { COUNTRY_PHONES, type CountryPhone } from "@/shared/constants/country-phone"
import { cn } from "@/lib/utils"

interface CountrySelectProps {
    /** Selected ISO 3166-1 alpha-2 code. */
    value: string
    onChange: (country: CountryPhone) => void
    /** `flag` is the compact phone-input trigger; `field` is a full-width select. */
    variant?: "flag" | "field"
    placeholder?: string
    disabled?: boolean
    className?: string
    style?: CSSProperties
}

/** Strip the trigger down to the flag so it can sit inside the phone input. */
const FLAG_TRIGGER_CLASS =
    "h-9 w-auto gap-1 border-0! bg-transparent! px-1! py-0! shadow-none hover:bg-muted! hover:text-inherit focus-visible:ring-0! [&_svg]:size-3.5! [&_svg]:text-current"

/**
 * Country picker shared by the phone question and its settings. It is a shadcn
 * `Select`, so the list stays keyboard-navigable and type-ahead searchable.
 */
export function CountrySelect({
    value,
    onChange,
    variant = "field",
    placeholder = "Select a country",
    disabled,
    className,
    style,
}: CountrySelectProps) {
    const selected = COUNTRY_PHONES.find((country) => country.iso2 === value)
    const label = selected ? `${selected.dialCode} ${selected.name}` : placeholder

    return (
        <Select
            value={selected?.iso2 ?? null}
            onValueChange={(iso2) => {
                const country = COUNTRY_PHONES.find((item) => item.iso2 === iso2)
                if (country) onChange(country)
            }}
        >
            <SelectTrigger
                aria-label="Country code"
                disabled={disabled}
                className={cn(variant === "flag" ? FLAG_TRIGGER_CLASS : "w-full", className)}
                style={style}
            >
                {variant === "flag" ? (
                    <span className="text-xl leading-none">{selected?.flag ?? "🌐"}</span>
                ) : (
                    <span className="flex min-w-0 items-center gap-2">
                        <span className="text-base leading-none">{selected?.flag ?? "🌐"}</span>
                        <span className={cn("truncate", !selected && "text-muted-foreground")}>
                            {label}
                        </span>
                    </span>
                )}
            </SelectTrigger>

            <SelectContent
                align={variant === "flag" ? "start" : "center"}
                alignItemWithTrigger={false}
                className="duration-0"
                style={{
                    // Skip the open/close animation: the list must feel instant.
                    animationDuration: "0ms",
                    ...(variant === "flag" ? { width: "18rem" } : null),
                }}
            >
                {COUNTRY_PHONES.map((country) => (
                    <SelectItem
                        key={country.iso2}
                        value={country.iso2}
                        // Type-ahead matches this, not the flag-first visual text.
                        label={`${country.name} ${country.dialCode}`}
                        className="gap-2.5"
                    >
                        <span className="text-base leading-none">{country.flag}</span>
                        <span className="w-14 shrink-0 text-slate-500 dark:text-zinc-500">
                            {country.dialCode}
                        </span>
                        <span className="truncate">{country.name}</span>
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    )
}
