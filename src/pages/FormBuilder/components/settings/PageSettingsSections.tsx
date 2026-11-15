import { MousePointer, ShieldCheck } from "lucide-react"
import { Input } from "../../../../components/ui/input"
import type { FormPage, Validation } from "../../../../shared/types/common"
import { cn } from "@/lib/utils"
import { CONTROL_CLASS, SettingsSection, TextSetting } from "./primitives"

interface ValidationMessageSettingProps {
    validation: Validation | undefined
    onPatch: (patch: Partial<Validation>) => void
}

export function ValidationMessageSetting({ validation, onPatch }: ValidationMessageSettingProps) {
    return (
        <SettingsSection
            title="Validation message"
            icon={<ShieldCheck className="h-4 w-4 text-zinc-400" />}
            description="Shown to respondents when this question fails validation."
        >
            <div className="relative">
                <Input
                    value={validation?.message ?? ""}
                    onChange={(e) => onPatch({ message: e.target.value })}
                    placeholder="This field is required"
                    className={cn(CONTROL_CLASS, "pr-8")}
                />
            </div>
        </SettingsSection>
    )
}

interface PageButtonSettingProps {
    page: FormPage
    pageIndex: number
    isStatement: boolean
    onUpdate: (index: number, updates: Partial<FormPage>) => void
}

export function PageButtonSetting({ page, pageIndex, isStatement, onUpdate }: PageButtonSettingProps) {
    return (
        <SettingsSection
            title="Page Button"
            icon={<MousePointer className="h-4 w-4 text-zinc-400" />}
        >
            <TextSetting
                label="Submit / Continue Text"
                value={page.appearance?.submitButtonText ?? ""}
                onChange={(submitButtonText) =>
                    onUpdate(pageIndex, {
                        appearance: {
                            ...(page.appearance || { width: "full", icon: "" }),
                            submitButtonText,
                        },
                    })
                }
                placeholder={isStatement ? "Continue" : "Submit"}
            />
        </SettingsSection>
    )
}
