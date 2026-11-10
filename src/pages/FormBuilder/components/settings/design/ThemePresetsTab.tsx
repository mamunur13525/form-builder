import { ThemePresetGrid } from "../ThemePresetGrid"
import { THEME_PRESETS, type ThemePreset } from "../theme-presets"

interface ThemePresetsTabProps {
    activePresetId: string | null
    onSelect: (preset: ThemePreset) => void
}

/** "Themes" tab: preset picker. */
export function ThemePresetsTab({ activePresetId, onSelect }: ThemePresetsTabProps) {
    return (
        <>
            <div className="space-y-1">
                <p className="text-sm font-medium text-slate-700 dark:text-zinc-200">
                    Pick a starting point
                </p>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                    Applying a theme updates the live preview only — nothing is saved until you click Save Design.
                </p>
                {activePresetId === null && (
                    <p className="text-xs text-[#FF5722] font-medium">
                        • Custom theme active
                    </p>
                )}
            </div>

            <ThemePresetGrid
                presets={THEME_PRESETS}
                selectedId={activePresetId}
                onSelect={onSelect}
            />
        </>
    )
}
