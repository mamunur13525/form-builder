import { Star, Hash } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { RatingSettings as RatingSettingsType } from "@/shared/types/common"

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
            <div className="space-y-2">
                <Label className="text-base">Rating style</Label>
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

            <div className="space-y-1">
                <Label className="text-base text-muted-foreground">Max rating</Label>
                <Select
                    value={String(settings.max)}
                    onValueChange={(v) => onChange({ ...settings, max: Number(v) })}
                >
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                        {maxOptions.map((v) => (
                            <SelectItem key={v} value={v}>
                                {v}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
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
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-md border px-3 py-2 text-sm transition-colors ${
                active
                    ? "border-primary bg-primary/10 font-medium text-primary"
                    : "hover:bg-accent"
            }`}
        >
            {icon}
            {label}
        </button>
    )
}
