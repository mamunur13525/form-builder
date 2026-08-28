import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import type { ChoiceSettings, OptionsPerRow } from "@/shared/types/common"
import { CONTROL_CLASS } from "./primitives"

/** "Other" option toggle (choice group). */
export function OtherOptionSetting({
    settings,
    onChange,
}: {
    settings: ChoiceSettings
    onChange: (next: ChoiceSettings) => void
}) {
    return (
        <div className="flex items-center justify-between gap-3">
            <Label
                htmlFor="allow-other"
                className="cursor-pointer text-base text-[var(--editorial-body)]"
            >
                "Other" option
            </Label>
            <div className="flex items-center gap-2">
                {settings.allowOther && (
                    <input
                        type="text"
                        value={settings.otherLabel}
                        onChange={(e) => onChange({ ...settings, otherLabel: e.target.value })}
                        placeholder="Other"
                        className={CONTROL_CLASS + " w-28 border px-3 outline-none"}
                    />
                )}
                <Switch
                    id="allow-other"
                    checked={settings.allowOther}
                    onCheckedChange={(allowOther) => onChange({ ...settings, allowOther })}
                />
            </div>
        </div>
    )
}

/** Horizontally align + options-per-row settings. */
export function HorizontalAlignSetting({
    settings,
    onChange,
}: {
    settings: ChoiceSettings
    onChange: (next: ChoiceSettings) => void
}) {
    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
                <Label
                    htmlFor="horiz-align"
                    className="cursor-pointer text-base text-[var(--editorial-body)]"
                >
                    Horizontally align options
                </Label>
                <Switch
                    id="horiz-align"
                    checked={settings.horizontalAlign}
                    onCheckedChange={(horizontalAlign) =>
                        onChange({ ...settings, horizontalAlign })
                    }
                />
            </div>

            {settings.horizontalAlign && (
                <div className="space-y-3 rounded-[14px] border border-[var(--editorial-border-light)] bg-[var(--editorial-canvas)] p-3">
                    <Label className="text-base text-[var(--editorial-body)]">
                        Number of options per row
                    </Label>
                    <OptionsPerRowSetting
                        value={settings.optionsPerRow}
                        onChange={(optionsPerRow) => onChange({ ...settings, optionsPerRow })}
                    />
                </div>
            )}
        </div>
    )
}

function OptionsPerRowSetting({
    value,
    onChange,
}: {
    value: OptionsPerRow
    onChange: (value: OptionsPerRow) => void
}) {
    const perRowOptions = Array.from({ length: 6 }, (_, i) => ({
        value: String(i + 1),
        label: String(i + 1),
    }))

    return (
        <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
                <Label className="text-xs text-[var(--editorial-subtle)]">Desktop</Label>
                <Select
                    value={String(value.desktop)}
                    onValueChange={(v) => onChange({ ...value, desktop: Number(v) })}
                >
                    <SelectTrigger className={CONTROL_CLASS + " w-full"}>
                        <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                        {perRowOptions.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-1.5">
                <Label className="text-xs text-[var(--editorial-subtle)]">Mobile</Label>
                <Select
                    value={String(value.mobile)}
                    onValueChange={(v) => onChange({ ...value, mobile: Number(v) })}
                >
                    <SelectTrigger className={CONTROL_CLASS + " w-full"}>
                        <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                        {perRowOptions.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
    )
}

/** Hide labels toggle. */
export function HideLabelsSetting({
    settings,
    onChange,
}: {
    settings: ChoiceSettings
    onChange: (next: ChoiceSettings) => void
}) {
    return (
        <div className="flex items-center justify-between gap-3">
            <Label
                htmlFor="hide-labels"
                className="cursor-pointer text-base text-[var(--editorial-body)]"
            >
                Hide labels
            </Label>
            <Switch
                id="hide-labels"
                checked={settings.hideLabels}
                onCheckedChange={(hideLabels) => onChange({ ...settings, hideLabels })}
            />
        </div>
    )
}

/** Selection limit (multiSelect / checkbox only). */
export function SelectionLimitSetting({
    settings,
    onChange,
    isMultiAnswer,
}: {
    settings: ChoiceSettings
    onChange: (next: ChoiceSettings) => void
    isMultiAnswer: boolean
}) {
    if (!isMultiAnswer || !settings.selectionLimit) return null

    const mode = settings.selectionLimit.mode
    const limit = settings.selectionLimit

    return (
        <div className="space-y-3">
            <Label className="text-base text-[var(--editorial-body)]">Selection limit</Label>
            <Select
                value={mode}
                onValueChange={(v: "none" | "exact" | "range" | null) => {
                    if (!v) return
                    onChange({
                        ...settings,
                        selectionLimit: { mode: v },
                    })
                }}
            >
                <SelectTrigger className={CONTROL_CLASS + " w-full"}>
                    <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="none">No limit</SelectItem>
                    <SelectItem value="exact">Exact number</SelectItem>
                    <SelectItem value="range">Range</SelectItem>
                </SelectContent>
            </Select>

            {mode === "exact" && (
                <NumberInput
                    label="Exact number of selections"
                    value={limit.exact}
                    onChange={(exact) =>
                        onChange({ ...settings, selectionLimit: { mode, exact } })
                    }
                    placeholder="e.g. 3"
                />
            )}

            {mode === "range" && (
                <div className="grid grid-cols-2 gap-3">
                    <NumberInput
                        label="Minimum"
                        value={limit.min}
                        onChange={(min) =>
                            onChange({ ...settings, selectionLimit: { mode, min, max: limit.max } })
                        }
                        placeholder="1"
                    />
                    <NumberInput
                        label="Maximum"
                        value={limit.max}
                        onChange={(max) =>
                            onChange({ ...settings, selectionLimit: { mode, min: limit.min, max } })
                        }
                        placeholder="4"
                    />
                </div>
            )}
        </div>
    )
}

function NumberInput({
    label,
    value,
    onChange,
    placeholder,
}: {
    label: string
    value: number | undefined
    onChange: (value: number | undefined) => void
    placeholder?: string
}) {
    return (
        <div className="space-y-1.5">
            <Label className="text-base text-[var(--editorial-body)]">{label}</Label>
            <input
                type="number"
                value={value ?? ""}
                onChange={(e) => {
                    if (e.target.value === "") {
                        onChange(undefined)
                        return
                    }
                    onChange(Number(e.target.value))
                }}
                placeholder={placeholder}
                className={CONTROL_CLASS + " w-full border px-4 outline-none"}
            />
        </div>
    )
}


