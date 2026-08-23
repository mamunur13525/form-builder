import { useMemo } from "react"
import { useParams } from "react-router-dom"
import { Input } from "../../../components/ui/input"
import { SettingsSection, ToggleRow, FieldLabel } from "../components/primitives"
import { SaveBar } from "../components/SaveBar"
import { useSectionState } from "../hooks/useSectionState"
import { useFormContext } from "@/features/forms/hooks/useFormContext"
import {
    useFormSettings,
    useUpdateGeneralSettings,
} from "@/features/forms/hooks/useFormSettings"
import type { GeneralSettingsValues } from "@/entities/form/model/types"

const GENERAL_DEFAULTS: GeneralSettingsValues = {
    show_progress_bar: true,
    initial_loader: false,
    navigation_arrows: true,
    refill_link: { isActive: false, link: "" },
    show_powered_by_company_name: true,
    anonymous_survey: false,
}

/**
 * General form behaviour — progress bar, loader, navigation, refill link,
 * branding and anonymity. Loads from and saves to
 * PATCH /forms/:formId/settings/general.
 */
export function GeneralSettings() {
    const { formId } = useParams<{ formId: string }>()
    const { data, isLoading } = useFormSettings(formId ?? "")
    const { showSaveStatus, setHasUnpublishedChanges, saveStatus } =
        useFormContext()
    const mutation = useUpdateGeneralSettings()

    const loaded = useMemo<GeneralSettingsValues | undefined>(
        () =>
            data
                ? { ...GENERAL_DEFAULTS, ...(data.settings.general ?? {}) }
                : undefined,
        [data],
    )
    const { values, setValues, dirty, commit } = useSectionState(
        loaded,
        GENERAL_DEFAULTS,
    )

    const set = <K extends keyof GeneralSettingsValues>(
        key: K,
        value: GeneralSettingsValues[K],
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
                        res?.settings?.general
                            ? { ...GENERAL_DEFAULTS, ...res.settings.general }
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
            <SettingsSection
                title="General"
                description="Control how the form behaves and appears to respondents."
            >
                <ToggleRow
                    label="Show progress bar"
                    description="Display a progress indicator as respondents move through the form."
                    checked={values.show_progress_bar}
                    onCheckedChange={(v) => set("show_progress_bar", v)}
                />

                <ToggleRow
                    label="Initial loader"
                    description="Show a brief loading animation before the form appears."
                    checked={values.initial_loader}
                    onCheckedChange={(v) => set("initial_loader", v)}
                />

                <ToggleRow
                    label="Navigation arrows"
                    description="Let respondents move between questions using on-screen arrows."
                    checked={values.navigation_arrows}
                    onCheckedChange={(v) => set("navigation_arrows", v)}
                />

                <ToggleRow
                    label="Refill link"
                    description="Offer a link that lets respondents start a fresh submission."
                    checked={values.refill_link.isActive}
                    onCheckedChange={(v) =>
                        set("refill_link", { ...values.refill_link, isActive: v })
                    }
                >
                    <FieldLabel htmlFor="refill-link">Link URL</FieldLabel>
                    <Input
                        id="refill-link"
                        type="url"
                        inputMode="url"
                        placeholder="https://example.com/form"
                        value={values.refill_link.link}
                        onChange={(e) =>
                            set("refill_link", {
                                ...values.refill_link,
                                link: e.target.value,
                            })
                        }
                        className="h-9 bg-[var(--card)]"
                    />
                </ToggleRow>

                <ToggleRow
                    label="Show “Powered by” branding"
                    description="Display the company name in the form footer."
                    checked={values.show_powered_by_company_name}
                    onCheckedChange={(v) =>
                        set("show_powered_by_company_name", v)
                    }
                />

                <ToggleRow
                    label="Anonymous survey"
                    description="Don’t associate responses with any identifying metadata."
                    checked={values.anonymous_survey}
                    onCheckedChange={(v) => set("anonymous_survey", v)}
                />
            </SettingsSection>

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
