import { Label } from "../../../../components/ui/label"
import { Input } from "../../../../components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../../../../components/ui/select"
import { SettingsSection } from "./primitives"
import type { FormField } from "../../../../shared/types/common"

interface DesignDrawerProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    page: FormField
    pageIndex: number
    onUpdate: (index: number, updates: Partial<FormField>) => void
}

export function DesignDrawer({ open, onOpenChange, page, pageIndex, onUpdate }: DesignDrawerProps) {
    return (
        <div className="space-y-8">
            {/* Appearance — button text/color (shared with all types) */}
            <SettingsSection title="Appearance">
                <div className="space-y-1.5">
                    <Label className="text-base text-[var(--editorial-body)]">Width</Label>
                    <Select
                        value={page.appearance.width}
                        onValueChange={(v: "full" | "half" | null) => {
                            if (!v) return
                            onUpdate(pageIndex, {
                                appearance: { ...page.appearance, width: v },
                            })
                        }}
                    >
                        <SelectTrigger className="h-[52px] w-full rounded-2xl border-[var(--input)] bg-[var(--secondary)] text-base">
                            <SelectValue className={'rounded'} placeholder="Select width" />
                        </SelectTrigger>
                        <SelectContent className="editorial rounded-[18px] border-[var(--border)] bg-[var(--popover)]">
                            <SelectItem value="full" className="rounded-[12px]">
                                Full Width
                            </SelectItem>
                            <SelectItem value="half" className="rounded-[12px]">
                                Half Width
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-1.5">
                    <Label className="text-base text-[var(--editorial-body)]">Button Color</Label>
                    <div className="flex items-center gap-3">
                        <input
                            type="color"
                            aria-label="Button color"
                            value={page.appearance.submitButtonColor ?? "#000000"}
                            onChange={(e) =>
                                onUpdate(pageIndex, {
                                    appearance: {
                                        ...page.appearance,
                                        submitButtonColor: e.target.value,
                                    },
                                })
                            }
                            className="h-[52px] w-[52px] cursor-pointer rounded-lg border border-[var(--input)] bg-[var(--secondary)] p-1"
                        />
                        <Input
                            type="text"
                            value={page.appearance.submitButtonColor ?? ""}
                            onChange={(e) =>
                                onUpdate(pageIndex, {
                                    appearance: {
                                        ...page.appearance,
                                        submitButtonColor: e.target.value,
                                    },
                                })
                            }
                            placeholder="#000000"
                            className="h-[52px] rounded-2xl border-[var(--input)] bg-[var(--secondary)] px-5 text-base"
                        />
                    </div>
                </div>
            </SettingsSection>
        </div>
    )
}