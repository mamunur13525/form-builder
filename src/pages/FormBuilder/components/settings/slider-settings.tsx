import type { SliderSeparator, SliderSettings as SliderSettingsType } from "@/shared/types/common"
import { NumberSetting, SelectSetting, TextSetting, ToggleRow } from "./primitives"

const SEPARATOR_OPTIONS: { value: SliderSeparator; label: string }[] = [
    { value: "comma", label: "Comma (1,000)" },
    { value: "period", label: "Period (1.000)" },
    { value: "space", label: "Space (1 000)" },
    { value: "none", label: "None (1000)" },
]

/** Slider settings: range, defaults, decoration and number formatting. */
export function SliderSettingsWidget({
    settings,
    onChange,
}: {
    settings: SliderSettingsType
    onChange: (next: SliderSettingsType) => void
}) {
    const min = settings.min ?? 0
    const max = settings.max ?? 100
    const rangeMode = settings.rangeMode ?? false

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
                <NumberSetting
                    label="Min"
                    value={settings.min}
                    onChange={(min) => onChange({ ...settings, min: min ?? 0 })}
                    placeholder="0"
                />
                <NumberSetting
                    label="Max"
                    value={settings.max}
                    onChange={(max) => onChange({ ...settings, max: max ?? 100 })}
                    placeholder="100"
                />
                <NumberSetting
                    label="Step size"
                    value={settings.step}
                    onChange={(step) => onChange({ ...settings, step: step ?? 1 })}
                    placeholder="1"
                    min={0}
                />
            </div>

            <ToggleRow
                id="slider-range-mode"
                label="Range mode (two handles)"
                checked={rangeMode}
                onCheckedChange={(rangeMode) => onChange({ ...settings, rangeMode })}
            />

            <div className={rangeMode ? "grid grid-cols-2 gap-3" : "grid grid-cols-1 gap-3"}>
                <NumberSetting
                    label={rangeMode ? "Default (low)" : "Default"}
                    description={
                        rangeMode
                            ? undefined
                            : "Starting value before the respondent moves the handle."
                    }
                    value={settings.defaultLow ?? min}
                    onChange={(defaultLow) => onChange({ ...settings, defaultLow })}
                    placeholder={String(min)}
                />
                {rangeMode && (
                    <NumberSetting
                        label="Default (high)"
                        value={settings.defaultHigh ?? max}
                        onChange={(defaultHigh) => onChange({ ...settings, defaultHigh })}
                        placeholder={String(max)}
                    />
                )}
            </div>

            <div className="grid grid-cols-2 gap-3">
                <TextSetting
                    label="Prefix"
                    value={settings.prefix ?? ""}
                    onChange={(prefix) => onChange({ ...settings, prefix })}
                    placeholder="$"
                />
                <TextSetting
                    label="Suffix"
                    value={settings.suffix ?? ""}
                    onChange={(suffix) => onChange({ ...settings, suffix })}
                    placeholder="kg"
                />
            </div>

            <SelectSetting
                label="Thousand separator"
                value={settings.thousandSeparator ?? "comma"}
                options={SEPARATOR_OPTIONS}
                onChange={(thousandSeparator) => onChange({ ...settings, thousandSeparator })}
            />
        </div>
    )
}
