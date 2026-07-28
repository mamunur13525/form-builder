import { Settings2, Plus } from "lucide-react"
import { Label } from "../../../components/ui/label"
import { Input } from "../../../components/ui/input"
import { Button } from "../../../components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../../../components/ui/select"
import { FIELD_TYPE_LABELS } from "../../../shared/constants/form-types"
import type { FormField } from "../../../shared/types/common"

const PAGE_TYPES = Object.entries(FIELD_TYPE_LABELS).map(([type, label]) => ({
    type,
    label,
}))

interface SettingsPanelProps {
    page: FormField
    pageIndex: number
    onUpdate: (index: number, updates: Partial<FormField>) => void
}

export function SettingsPanel({ page, pageIndex, onUpdate }: SettingsPanelProps) {
    return (
        <div className="w-full h-full flex flex-col bg-background border rounded-xl shadow-sm overflow-hidden">
            <div className="p-3 border-b">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <Settings2 className="h-4 w-4" />
                    Settings
                </h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-5">
                {/* Field Type */}
                <div className="space-y-2">
                    <Label className="text-xs">Field Type</Label>
                    <Select
                        value={page.type}
                        onValueChange={(value) => onUpdate(pageIndex, { type: value as FormField["type"] })}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select field type" />
                        </SelectTrigger>
                        <SelectContent>
                            {PAGE_TYPES.map((pt) => (
                                <SelectItem key={pt.type} value={pt.type}>
                                    {pt.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Required Toggle */}
                <div className="flex items-center justify-between">
                    <Label className="text-xs cursor-pointer">Required</Label>
                    <input
                        type="checkbox"
                        checked={page.required}
                        onChange={(e) => onUpdate(pageIndex, { required: e.target.checked })}
                        className="h-4 w-4"
                    />
                </div>

                {/* Validation */}
                <div className="space-y-3">
                    <Label className="text-xs font-semibold">Validation</Label>
                    {(page.type === "shortText" || page.type === "longText") && (
                        <>
                            <div className="space-y-1">
                                <Label className="text-[11px] text-muted-foreground">Min Length</Label>
                                <Input
                                    type="number"
                                    value={page.validation?.minLength ?? ""}
                                    onChange={(e) =>
                                        onUpdate(pageIndex, {
                                            validation: { ...page.validation, minLength: Number(e.target.value) || undefined },
                                        })
                                    }
                                    placeholder="0"
                                    className="h-8 text-sm"
                                />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-[11px] text-muted-foreground">Max Length</Label>
                                <Input
                                    type="number"
                                    value={page.validation?.maxLength ?? ""}
                                    onChange={(e) =>
                                        onUpdate(pageIndex, {
                                            validation: { ...page.validation, maxLength: Number(e.target.value) || undefined },
                                        })
                                    }
                                    placeholder="1000"
                                    className="h-8 text-sm"
                                />
                            </div>
                        </>
                    )}
                    {page.type === "number" && (
                        <>
                            <div className="space-y-1">
                                <Label className="text-[11px] text-muted-foreground">Min Value</Label>
                                <Input
                                    type="number"
                                    value={page.validation?.min ?? ""}
                                    onChange={(e) =>
                                        onUpdate(pageIndex, {
                                            validation: { ...page.validation, min: Number(e.target.value) || undefined },
                                        })
                                    }
                                    placeholder="0"
                                    className="h-8 text-sm"
                                />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-[11px] text-muted-foreground">Max Value</Label>
                                <Input
                                    type="number"
                                    value={page.validation?.max ?? ""}
                                    onChange={(e) =>
                                        onUpdate(pageIndex, {
                                            validation: { ...page.validation, max: Number(e.target.value) || undefined },
                                        })
                                    }
                                    placeholder="100"
                                    className="h-8 text-sm"
                                />
                            </div>
                        </>
                    )}
                    <div className="space-y-1">
                        <Label className="text-[11px] text-muted-foreground">Custom Error Message</Label>
                        <Input
                            value={page.validation?.message ?? ""}
                            onChange={(e) =>
                                onUpdate(pageIndex, {
                                    validation: { ...page.validation, message: e.target.value },
                                })
                            }
                            placeholder="This field is required"
                            className="h-8 text-sm"
                        />
                    </div>
                </div>

                {/* Logic */}
                <div className="space-y-3">
                    <Label className="text-xs font-semibold">Logic</Label>
                    {page.logic.length === 0 ? (
                        <p className="text-xs text-muted-foreground">No logic rules configured</p>
                    ) : (
                        page.logic.map((rule, ruleIndex) => (
                            <div key={ruleIndex} className="p-2 rounded border bg-muted/30 space-y-1">
                                <p className="text-xs">
                                    When <strong>{rule.whenFieldKey}</strong> {rule.operator} "{String(rule.value)}"
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    → {rule.action} {rule.targetFieldKey}
                                </p>
                            </div>
                        ))
                    )}
                    <Button variant="outline" size="sm" className="w-full text-xs">
                        <Plus className="mr-1 h-3 w-3" />
                        Add Logic
                    </Button>
                </div>

                {/* Appearance */}
                <div className="space-y-2">
                    <Label className="text-xs font-semibold">Appearance</Label>
                    <div className="space-y-1">
                        <Label className="text-[11px] text-muted-foreground">Width</Label>
                        <Select
                            value={page.appearance.width}
                            onValueChange={(value) =>
                                onUpdate(pageIndex, {
                                    appearance: { ...page.appearance, width: value as "full" | "half" },
                                })
                            }
                        >
                            <SelectTrigger className="w-full h-8 text-xs">
                                <SelectValue placeholder="Select width" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="full">Full Width</SelectItem>
                                <SelectItem value="half">Half Width</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>
        </div>
    )
}