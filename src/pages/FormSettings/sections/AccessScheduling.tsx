import { useMemo } from "react"
import { useParams } from "react-router-dom"
import { Input } from "../../../components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../../../components/ui/select"
import {
    SettingsSection,
    SettingRow,
    ToggleRow,
    NestedPanel,
    FieldLabel,
} from "../components/primitives"
import { SaveBar } from "../components/SaveBar"
import { useSectionState } from "../hooks/useSectionState"
import { useFormContext } from "@/features/forms/hooks/useFormContext"
import {
    useFormSettings,
    useUpdateAccessSettings,
} from "@/features/forms/hooks/useFormSettings"
import type {
    AccessSettingsValues,
    DetectionMethod,
    ResponseLimitPeriod,
    ResponseLimitType,
} from "@/entities/form/model/types"

const DETECTION_METHODS: { value: DetectionMethod; label: string }[] = [
    { value: "cookie", label: "Browser cookie" },
    { value: "ip", label: "IP address" },
    { value: "cookie_ip", label: "Cookie + IP address" },
]

const LIMIT_PERIODS: { value: ResponseLimitPeriod; label: string }[] = [
    { value: "day", label: "Per day" },
    { value: "month", label: "Per month" },
    { value: "year", label: "Per year" },
    { value: "lifetime", label: "Lifetime" },
]

const ACCESS_DEFAULTS: AccessSettingsValues = {
    close_form: false,
    close_form_by_date: { isActive: false, date: null },
    close_form_by_submissions: { isActive: false, submissions: 100 },
    auto_refresh_inactivity: { isActive: false, minutes: 10 },
    preventDuplicateSubmissions: false,
    detectionMethod: "cookie",
    responseLimit: { type: "single", count: 1, period: "day" },
}

/** `<input type="date">` needs a bare YYYY-MM-DD; the API may send full ISO. */
const toDateInput = (iso: string | null) => (iso ? iso.slice(0, 10) : "")
const toNum = (v: string) => (v === "" ? 0 : Number.isNaN(Number(v)) ? 0 : Number(v))

/**
 * Access & scheduling — when the form closes, whether duplicate submissions are
 * blocked, and how many responses each respondent may send. Loads from and
 * saves to PATCH /forms/:formId/settings/access.
 */
export function AccessScheduling() {
    const { formId } = useParams<{ formId: string }>()
    const { data, isLoading } = useFormSettings(formId ?? "")
    const { showSaveStatus, setHasUnpublishedChanges, saveStatus } =
        useFormContext()
    const mutation = useUpdateAccessSettings()

    const loaded = useMemo<AccessSettingsValues | undefined>(
        () =>
            data
                ? { ...ACCESS_DEFAULTS, ...(data.settings.access ?? {}) }
                : undefined,
        [data],
    )
    const { values, setValues, dirty, commit } = useSectionState(
        loaded,
        ACCESS_DEFAULTS,
    )

    const set = <K extends keyof AccessSettingsValues>(
        key: K,
        value: AccessSettingsValues[K],
    ) => setValues((prev) => ({ ...prev, [key]: value }))

    const isNew = !formId || formId === "new"

    const handleSave = () => {
        if (isNew) return
        showSaveStatus("saving")
        mutation.mutate(
            { formId: formId!, data: values },
            {
                onSuccess: (res) => {
                    commit(
                        res?.settings?.access
                            ? { ...ACCESS_DEFAULTS, ...res.settings.access }
                            : values,
                    )
                    setHasUnpublishedChanges(true)
                    showSaveStatus("saved")
                },
                onError: () => showSaveStatus("error"),
            },
        )
    }

    const status = mutation.isPending ? "saving" : saveStatus

    return (
        <>
            <div className="flex flex-col gap-6">
                <SettingsSection
                    title="Access & scheduling"
                    description="Control when the form accepts responses."
                >
                    <ToggleRow
                        label="Close form"
                        htmlFor="toggle-close-form"
                        description="Stop accepting new responses immediately."
                        checked={values.close_form}
                        onCheckedChange={(v) => set("close_form", v)}
                    />

                    <ToggleRow
                        label="Close on a specific date"
                        htmlFor="toggle-close-date"
                        description="Automatically stop accepting responses after this date."
                        checked={values.close_form_by_date.isActive}
                        onCheckedChange={(v) =>
                            set("close_form_by_date", {
                                ...values.close_form_by_date,
                                isActive: v,
                            })
                        }
                    >
                        <FieldLabel htmlFor="close-date">Close date</FieldLabel>
                        <Input
                            id="close-date"
                            type="date"
                            value={toDateInput(values.close_form_by_date.date)}
                            onChange={(e) =>
                                set("close_form_by_date", {
                                    ...values.close_form_by_date,
                                    date: e.target.value || null,
                                })
                            }
                            className="h-9 w-full max-w-xs bg-[var(--card)]"
                        />
                    </ToggleRow>

                    <ToggleRow
                        label="Close after a number of submissions"
                        description="Stop accepting responses once this many are received."
                        checked={values.close_form_by_submissions.isActive}
                        onCheckedChange={(v) =>
                            set("close_form_by_submissions", {
                                ...values.close_form_by_submissions,
                                isActive: v,
                            })
                        }
                        htmlFor="toggle-max-submissions"
                    >
                        <FieldLabel htmlFor="max-submissions">
                            Maximum submissions
                        </FieldLabel>
                        <Input
                            id="max-submissions"
                            type="number"
                            min={1}
                            value={String(
                                values.close_form_by_submissions.submissions,
                            )}
                            onChange={(e) =>
                                set("close_form_by_submissions", {
                                    ...values.close_form_by_submissions,
                                    submissions: toNum(e.target.value),
                                })
                            }
                            className="h-9 w-full max-w-[10rem] bg-[var(--card)]"
                        />
                    </ToggleRow>

                    <ToggleRow
                        label="Auto-refresh on inactivity"
                        description="Reload the form after a period of respondent inactivity."
                        checked={values.auto_refresh_inactivity.isActive}
                        onCheckedChange={(v) =>
                            set("auto_refresh_inactivity", {
                                ...values.auto_refresh_inactivity,
                                isActive: v,
                            })
                        }
                        htmlFor="toggle-refresh-minutes"
                    >
                        <FieldLabel htmlFor="refresh-minutes">
                            Inactivity timeout (minutes)
                        </FieldLabel>
                        <Input
                            id="refresh-minutes"
                            type="number"
                            min={1}
                            value={String(
                                values.auto_refresh_inactivity.minutes,
                            )}
                            onChange={(e) =>
                                set("auto_refresh_inactivity", {
                                    ...values.auto_refresh_inactivity,
                                    minutes: toNum(e.target.value),
                                })
                            }
                            className="h-9 w-full max-w-[10rem] bg-[var(--card)]"
                        />
                    </ToggleRow>
                </SettingsSection>

                <SettingsSection
                    title="Response limits"
                    description="Prevent repeat submissions and cap how many responses each respondent can send."
                >
                    <ToggleRow
                        label="Prevent duplicate submissions"
                        description="Stop the same respondent from submitting more than once."
                        checked={values.preventDuplicateSubmissions}
                        onCheckedChange={(v) =>
                            set("preventDuplicateSubmissions", v)
                        }
                        htmlFor="toggle-detection-method"
                    >
                        <FieldLabel>Detection method</FieldLabel>
                        <Select
                            value={values.detectionMethod}
                            onValueChange={(v) =>
                                v && set("detectionMethod", v as DetectionMethod)
                            }
                        >
                            <SelectTrigger className="w-full max-w-xs bg-[var(--card)]">
                                <SelectValue placeholder="Select a method" />
                            </SelectTrigger>
                            <SelectContent>
                                {DETECTION_METHODS.map((m) => (
                                    <SelectItem key={m.value} value={m.value}>
                                        {m.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </ToggleRow>

                    <SettingRow
                        label="Response limit"
                        description="How many times each respondent may submit."
                    >
                        <NestedPanel>
                            <div className="flex flex-col gap-4">
                                <div>
                                    <FieldLabel>Limit type</FieldLabel>
                                    <Select
                                        value={values.responseLimit.type}
                                        onValueChange={(v) =>
                                            v &&
                                            set("responseLimit", {
                                                ...values.responseLimit,
                                                type: v as ResponseLimitType,
                                            })
                                        }
                                    >
                                        <SelectTrigger className="w-full max-w-xs bg-[var(--card)]">
                                            <SelectValue placeholder="Select a limit type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="single">
                                                Single response
                                            </SelectItem>
                                            <SelectItem value="multiple">
                                                Multiple responses
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {values.responseLimit.type === "multiple" && (
                                    <div className="flex flex-wrap items-end gap-3">
                                        <div>
                                            <FieldLabel htmlFor="limit-count">
                                                Count
                                            </FieldLabel>
                                            <Input
                                                id="limit-count"
                                                type="number"
                                                min={1}
                                                value={String(
                                                    values.responseLimit.count,
                                                )}
                                                onChange={(e) =>
                                                    set("responseLimit", {
                                                        ...values.responseLimit,
                                                        count: toNum(
                                                            e.target.value,
                                                        ),
                                                    })
                                                }
                                                className="h-9 w-24 bg-[var(--card)]"
                                            />
                                        </div>
                                        <div className="min-w-[10rem]">
                                            <FieldLabel>Period</FieldLabel>
                                            <Select
                                                value={
                                                    values.responseLimit.period
                                                }
                                                onValueChange={(v) =>
                                                    v &&
                                                    set("responseLimit", {
                                                        ...values.responseLimit,
                                                        period: v as ResponseLimitPeriod,
                                                    })
                                                }
                                            >
                                                <SelectTrigger className="w-full bg-[var(--card)]">
                                                    <SelectValue placeholder="Select a period" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {LIMIT_PERIODS.map((p) => (
                                                        <SelectItem
                                                            key={p.value}
                                                            value={p.value}
                                                        >
                                                            {p.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </NestedPanel>
                    </SettingRow>
                </SettingsSection>
            </div>

            <SaveBar
                status={status}
                dirty={dirty}
                onSave={handleSave}
                disabled={isLoading || isNew}
                errorMessage={
                    mutation.error instanceof Error
                        ? mutation.error.message
                        : undefined
                }
            />
        </>
    )
}
