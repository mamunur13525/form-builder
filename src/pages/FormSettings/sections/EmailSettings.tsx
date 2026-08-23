import { useMemo } from "react"
import { useParams } from "react-router-dom"
import { Plus, X } from "lucide-react"
import { Input } from "../../../components/ui/input"
import { Textarea } from "../../../components/ui/textarea"
import {
    RadioGroup,
    RadioGroupItem,
} from "../../../components/ui/radio-group"
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
    useUpdateEmailSettings,
} from "@/features/forms/hooks/useFormSettings"
import type { EmailSettingsValues } from "@/entities/form/model/types"

/**
 * The API models reply-to as two mutually-exclusive modes: automatically use
 * the form's first email field, or a fixed custom address.
 */
type ReplyToMode = "first_field" | "custom"

const EMAIL_DEFAULTS: EmailSettingsValues = {
    receive_email_notification: true,
    multiple_recipients: { isActive: false, emails: [] },
    reply_to: {
        automatic_first_email_field: true,
        custom_email: { isActive: false, address: "" },
    },
    email_subject: "",
    email_body: "",
}

/**
 * Notification email configuration — recipients, reply-to behaviour, and the
 * subject/body of the message sent when a form is submitted. Loads from and
 * saves to PATCH /forms/:formId/settings/email.
 */
export function EmailSettings() {
    const { formId } = useParams<{ formId: string }>()
    const { data, isLoading } = useFormSettings(formId ?? "")
    const { showSaveStatus, setHasUnpublishedChanges, saveStatus } =
        useFormContext()
    const mutation = useUpdateEmailSettings()

    const loaded = useMemo<EmailSettingsValues | undefined>(
        () =>
            data
                ? { ...EMAIL_DEFAULTS, ...(data.settings.emailSettings ?? {}) }
                : undefined,
        [data],
    )
    const { values, setValues, dirty, commit } = useSectionState(
        loaded,
        EMAIL_DEFAULTS,
    )

    const set = <K extends keyof EmailSettingsValues>(
        key: K,
        value: EmailSettingsValues[K],
    ) => setValues((prev) => ({ ...prev, [key]: value }))

    const recipients = values.multiple_recipients.emails
    const setRecipients = (emails: string[]) =>
        set("multiple_recipients", { ...values.multiple_recipients, emails })

    const toggleMultiple = (isActive: boolean) =>
        set("multiple_recipients", {
            isActive,
            // Give the user an empty row to type into when first enabling.
            emails: isActive && recipients.length === 0 ? [""] : recipients,
        })

    const replyMode: ReplyToMode = values.reply_to.custom_email.isActive
        ? "custom"
        : "first_field"
    const setReplyMode = (mode: ReplyToMode) =>
        set("reply_to", {
            automatic_first_email_field: mode === "first_field",
            custom_email: {
                isActive: mode === "custom",
                address: values.reply_to.custom_email.address,
            },
        })
    const setCustomReply = (address: string) =>
        set("reply_to", {
            ...values.reply_to,
            custom_email: { ...values.reply_to.custom_email, address },
        })

    const isNew = !formId || formId === "new"

    const handleSave = () => {
        if (isNew) return
        // Drop blank recipient rows before persisting.
        const cleanedEmails = recipients.map((e) => e.trim()).filter(Boolean)
        const payload: EmailSettingsValues = {
            ...values,
            multiple_recipients: {
                ...values.multiple_recipients,
                emails: cleanedEmails,
            },
        }
        showSaveStatus("saving")
        mutation.mutate(
            { formId: formId!, data: payload },
            {
                onSuccess: (res) => {
                    commit(
                        res?.settings?.emailSettings
                            ? {
                                  ...EMAIL_DEFAULTS,
                                  ...res.settings.emailSettings,
                              }
                            : payload,
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
                title="Email settings"
                description="Decide who gets notified and what the notification email says."
            >
                <ToggleRow
                    label="Receive email notifications"
                    htmlFor="toggle-email-notifications"
                    description="Receive email notifications when someone submits your form."
                    checked={values.receive_email_notification}
                    onCheckedChange={(v) => set("receive_email_notification", v)}
                />

                <ToggleRow
                    label="Multiple recipients"
                    htmlFor="toggle-multiple-recipients"
                    description="Send the notification to more than one email address."
                    checked={values.multiple_recipients.isActive}
                    onCheckedChange={toggleMultiple}
                >
                    <FieldLabel>Recipient emails</FieldLabel>
                    <div className="flex flex-col gap-2">
                        {recipients.length === 0 && (
                            <p className="text-[13px] text-[var(--muted-foreground)]">
                                No recipients yet.
                            </p>
                        )}
                        {recipients.map((email, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <Input
                                    type="email"
                                    inputMode="email"
                                    placeholder="name@company.com"
                                    value={email}
                                    onChange={(e) =>
                                        setRecipients(
                                            recipients.map((r, i) =>
                                                i === index ? e.target.value : r,
                                            ),
                                        )
                                    }
                                    className="h-9 bg-[var(--card)]"
                                />
                                <button
                                    type="button"
                                    aria-label="Remove recipient"
                                    onClick={() =>
                                        setRecipients(
                                            recipients.filter(
                                                (_, i) => i !== index,
                                            ),
                                        )
                                    }
                                    className="editorial-transition flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--editorial-subtle)] hover:border-[var(--destructive)]/40 hover:text-[var(--destructive)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={() => setRecipients([...recipients, ""])}
                            className="editorial-transition mt-0.5 inline-flex w-fit items-center gap-1.5 rounded-lg border border-dashed border-[var(--border)] px-3 py-1.5 text-[13px] font-medium text-[var(--editorial-body)] hover:border-[var(--editorial-primary-ring)] hover:text-[var(--foreground)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
                        >
                            <Plus className="h-4 w-4" />
                            Add recipient
                        </button>
                    </div>
                </ToggleRow>

                <SettingRow
                    label="Reply to"
                    description="Choose the first email field from your form or enter a custom email address, and we will set it as Reply To on the notification email."
                >
                    <RadioGroup
                        value={replyMode}
                        onValueChange={(v) => setReplyMode(v as ReplyToMode)}
                        className="gap-3"
                    >
                        <label className="flex items-start gap-3">
                            <RadioGroupItem value="first_field" className="mt-0.5" />
                            <span className="text-sm text-[var(--foreground)]">
                                Automatically use the first email field
                                <span className="mt-0.5 block text-[13px] leading-snug text-[var(--muted-foreground)]">
                                    We’ll pick the first email question in your
                                    form.
                                </span>
                            </span>
                        </label>

                        <label className="flex items-start gap-3">
                            <RadioGroupItem value="custom" className="mt-0.5" />
                            <span className="flex-1 text-sm text-[var(--foreground)]">
                                Custom email address
                                {replyMode === "custom" && (
                                    <span className="mt-2 block">
                                        <Input
                                            type="email"
                                            inputMode="email"
                                            placeholder="reply@company.com"
                                            value={
                                                values.reply_to.custom_email
                                                    .address
                                            }
                                            onChange={(e) =>
                                                setCustomReply(e.target.value)
                                            }
                                            className="h-9 bg-[var(--card)]"
                                        />
                                    </span>
                                )}
                            </span>
                        </label>
                    </RadioGroup>
                </SettingRow>

                <SettingRow
                    label="Notification email"
                    description="The message sent for each new submission."
                >
                    <NestedPanel>
                        <div className="flex flex-col gap-4">
                            <div>
                                <FieldLabel htmlFor="email-subject">
                                    Subject
                                </FieldLabel>
                                <Input
                                    id="email-subject"
                                    placeholder="New response to {{form_name}}"
                                    value={values.email_subject}
                                    onChange={(e) =>
                                        set("email_subject", e.target.value)
                                    }
                                    className="h-9 bg-[var(--card)]"
                                />
                            </div>
                            <div>
                                <FieldLabel htmlFor="email-body">Body</FieldLabel>
                                <Textarea
                                    id="email-body"
                                    rows={5}
                                    placeholder="Write the body of the notification email…"
                                    value={values.email_body}
                                    onChange={(e) =>
                                        set("email_body", e.target.value)
                                    }
                                    className="bg-[var(--card)]"
                                />
                            </div>
                        </div>
                    </NestedPanel>
                </SettingRow>
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
