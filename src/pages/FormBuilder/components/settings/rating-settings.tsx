import { Star, Hash } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { RatingSettings as RatingSettingsType } from "@/shared/types/common"
import { CONTROL_CLASS, OVERLAY_CLASS } from "./primitives"

/** Rating settings: star vs number style + max rating (2–10). */
export function RatingSettingsWidget({
    settings,
    onChange,
}: {
    settings: RatingSettingsType
    onChange: (next: RatingSettingsType) => void
}) {
    const maxOptions = Array.from({ length: 9 }, (_, i) => String(i + 2))

    return (
        <div className="space-y-3">
            <div className="space-y-1.5">
                <Label className="text-sm font-medium text-zinc-200">Rating style</Label>
                <div className="flex items-center gap-2">
                    <StyleButton
                        active={settings.style === "star"}
                        onClick={() => onChange({ ...settings, style: "star" })}
                        icon={<Star className="h-4 w-4" />}
                        label="Star"
                    />
                    <StyleButton
                        active={settings.style === "number"}
                        onClick={() => onChange({ ...settings, style: "number" })}
                        icon={<Hash className="h-4 w-4" />}
                        label="Number"
                    />
                </div>
            </div>

            <div className="space-y-1.5">
                <Label className="text-sm font-medium text-zinc-200">Max rating</Label>
                <Select
                    value={String(settings.max)}
                    onValueChange={(v) => onChange({ ...settings, max: Number(v) })}
                >
                    <SelectTrigger className={CONTROL_CLASS + " w-full [&>svg:last-child]:text-zinc-400"}>
                        <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent className={OVERLAY_CLASS}>
                        {maxOptions.map((v) => (
                            <SelectItem
                                key={v}
                                value={v}
                                className="cursor-pointer rounded-lg px-3 py-2 text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 focus:bg-zinc-800 focus:text-white"
                            >
                                <span className="font-medium">{v}</span>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <p className="text-xs leading-5 text-zinc-400">
                    Respondents will rate from 1 to {settings.max}.
                </p>
            </div>
        </div>
    )
}

function StyleButton({
    active,
    onClick,
    icon,
    label,
}: {
    active: boolean
    onClick: () => void
    icon: React.ReactNode
    label: string
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`flex h-[40px] flex-1 items-center justify-center gap-1.5 rounded-xl border px-4 text-xs font-medium transition-all cursor-pointer ${
                active
                    ? "border-[#FF5722] bg-[#FF5722]/15 text-[#FF5722]"
                    : "border-zinc-800 bg-[#1a1a20] text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
            }`}
        >
            {icon}
            {label}
        </button>
    )
}
