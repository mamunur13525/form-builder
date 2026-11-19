import { useState } from "react"
import {
    AlertCircle,
    Link2,
    Plus,
    Sparkles,
    Trash2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import type {
    MeetingPrefillMapping,
    MeetingSettings,
} from "@/shared/types/common"
import {
    MEETING_PROVIDERS,
    meetingProviderMeta,
} from "@/shared/constants/meeting"
import { CONTROL_CLASS, OVERLAY_CLASS } from "./primitives"
import { cn } from "@/lib/utils"

/** An earlier question that can feed a booking-page prefill param. */
export interface MeetingSourceField {
    key: string
    label: string
    /** Page type, so payment receipts can offer only email questions. */
    type?: string
}

interface MeetingSettingsWidgetProps {
    settings: MeetingSettings
    onChange: (next: MeetingSettings) => void
    /** Questions (and pages) that come before this scheduler in the form. */
    earlierFields: MeetingSourceField[]
}

const newMappingId = () =>
    `map_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`

const PROVIDER_ITEMS = MEETING_PROVIDERS.map(({ value, label }) => ({
    value,
    label,
}))

/**
 * Editor for a meeting/scheduler question: provider, booking link, button
 * text and the mappings that pass earlier answers into the booking page.
 */
export function MeetingSettingsWidget({
    settings,
    onChange,
    earlierFields,
}: MeetingSettingsWidgetProps) {
    const [showHelp, setShowHelp] = useState(false)

    const provider = meetingProviderMeta(settings.provider)
    const mappings = settings.prefillMappings ?? []

    const emit = (patch: Partial<MeetingSettings>) =>
        onChange({ ...settings, ...patch })

    const setMapping = (id: string, patch: Partial<MeetingPrefillMapping>) =>
        emit({
            prefillMappings: mappings.map((mapping) =>
                mapping.id === id ? { ...mapping, ...patch } : mapping,
            ),
        })

    const addMapping = () => {
        if (earlierFields.length === 0) return
        emit({
            prefillMappings: [
                ...mappings,
                {
                    id: newMappingId(),
                    sourceKey: earlierFields[0].key,
                    targetKey: "name",
                },
            ],
        })
    }

    const removeMapping = (id: string) =>
        emit({
            prefillMappings: mappings.filter((mapping) => mapping.id !== id),
        })

    return (
        <div className="space-y-4">
            {/* Provider */}
            <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-700 dark:text-zinc-300">
                    Schedule with
                </Label>
                <Select
                    items={PROVIDER_ITEMS}
                    value={settings.provider}
                    onValueChange={(value) => {
                        if (!value) return
                        emit({
                            provider: value as MeetingSettings["provider"],
                        })
                    }}
                >
                    <SelectTrigger className={cn(CONTROL_CLASS, "w-full px-3.5")}>
                        <SelectValue placeholder="Select a provider" />
                    </SelectTrigger>
                    <SelectContent className={OVERLAY_CLASS}>
                        {MEETING_PROVIDERS.map((item) => (
                            <SelectItem key={item.value} value={item.value}>
                                {item.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Booking link */}
            <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                    <Label
                        htmlFor="meeting-link"
                        className="text-xs font-medium text-slate-700 dark:text-zinc-300"
                    >
                        {provider.linkLabel}
                    </Label>
                    <button
                        type="button"
                        onClick={() => setShowHelp((current) => !current)}
                        className="text-xs font-semibold text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                        What&apos;s this?
                    </button>
                </div>
                {showHelp && (
                    <p className="text-xs leading-4 text-slate-500 dark:text-zinc-400">
                        {provider.helpText}
                    </p>
                )}
                <div className="relative flex items-center">
                    <div className="pointer-events-none absolute left-3 flex items-center text-slate-400 dark:text-zinc-500">
                        <Link2 className="h-4 w-4" />
                    </div>
                    <Input
                        id="meeting-link"
                        value={settings.link}
                        onChange={(event) => emit({ link: event.target.value })}
                        placeholder={provider.placeholder}
                        className={cn(CONTROL_CLASS, "pl-9")}
                        inputMode="url"
                    />
                </div>
            </div>

            {/* Button text */}
            <div className="space-y-1.5">
                <Label
                    htmlFor="meeting-opener"
                    className="text-xs font-medium text-slate-700 dark:text-zinc-300"
                >
                    Calendar Opener Text
                </Label>
                <Input
                    id="meeting-opener"
                    value={settings.openerText}
                    onChange={(event) =>
                        emit({ openerText: event.target.value })
                    }
                    placeholder="Select the slot."
                    className={cn(CONTROL_CLASS, "px-3.5")}
                />
            </div>

            {/* Prefill mapping */}
            <div className="space-y-2">
                <Label className="text-xs font-medium text-slate-700 dark:text-zinc-300">
                    Prefill mapping
                </Label>
                <p className="text-xs leading-4 text-slate-500 dark:text-zinc-400">
                    Pass answers from earlier fields into {provider.label}.
                </p>

                {earlierFields.length === 0 ? (
                    <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs leading-5 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/25 dark:text-amber-400">
                        <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                        <span>
                            Add at least one field before this scheduler to
                            create mappings.
                        </span>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {mappings.map((mapping) => (
                            <div
                                key={mapping.id}
                                className="flex items-start gap-2"
                            >
                                <Select
                                    items={earlierFields.map((field) => ({
                                        value: field.key,
                                        label: field.label,
                                    }))}
                                    value={mapping.sourceKey}
                                    onValueChange={(value) =>
                                        setMapping(mapping.id, {
                                            sourceKey: value ?? "",
                                        })
                                    }
                                >
                                    <SelectTrigger
                                        className={cn(
                                            CONTROL_CLASS,
                                            "min-w-0 flex-1 px-3",
                                        )}
                                    >
                                        <SelectValue placeholder="Earlier field" />
                                    </SelectTrigger>
                                    <SelectContent className={OVERLAY_CLASS}>
                                        {earlierFields.map((field) => (
                                            <SelectItem
                                                key={field.key}
                                                value={field.key}
                                            >
                                                {field.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Input
                                    value={mapping.targetKey}
                                    onChange={(event) =>
                                        setMapping(mapping.id, {
                                            targetKey: event.target.value,
                                        })
                                    }
                                    placeholder="e.g. name"
                                    aria-label={`${provider.label} field name`}
                                    className={cn(
                                        CONTROL_CLASS,
                                        "w-28 shrink-0 px-3",
                                    )}
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    aria-label="Remove mapping"
                                    onClick={() => removeMapping(mapping.id)}
                                    className="h-10 w-9 shrink-0 text-slate-400 hover:text-red-500"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}

                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={addMapping}
                            className="h-9 w-full gap-1.5 border-dashed text-xs font-medium"
                        >
                            <Plus className="h-3.5 w-3.5" />
                            Add mapping
                        </Button>

                        <p className="flex items-center gap-1.5 text-[11px] leading-4 text-slate-400 dark:text-zinc-500">
                            <Sparkles className="h-3 w-3 shrink-0" />
                            Use the provider&apos;s query param names, usually
                            name, email or phone.
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}
