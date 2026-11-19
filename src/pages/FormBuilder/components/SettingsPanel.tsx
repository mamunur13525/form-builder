import React from "react"
import { Layers } from "lucide-react"

import type {
    PageSettings,
    FormPage,
    FormQuestion,
    Validation,
} from "../../../shared/types/common"
import {
    defaultOptionsForType,
    defaultSettingsForType,
    CHOICE_TYPES,
    MULTI_ANSWER_TYPES,
} from "@/features/forms/model/page-defaults"
import { RequiredToggle } from "./settings/primitives"
import { QuestionSwitcher } from "./settings/QuestionSwitcher"
import { QuestionTypeSetting } from "./settings/QuestionTypeSetting"
import { TypeSpecificSettings } from "./settings/TypeSpecificSettings"
import type { MeetingSourceField } from "./settings/meeting-settings"
import { CoverImageSetting } from "./settings/CoverImageSetting"
import {
    PageButtonSetting,
    ValidationMessageSetting,
} from "./settings/PageSettingsSections"
import { ConfirmDialog } from "@/features/workspaces/components/ConfirmDialog"

interface SettingsPanelProps {
    page: FormPage
    pageIndex: number
    onUpdate: (index: number, updates: Partial<FormPage>) => void
    selectedQuestionId?: string | null
    onSelectQuestion?: (questionId: string | null) => void
    /** Fields on pages that come before this page, for meeting prefill. */
    previousFields?: MeetingSourceField[]
}

function SettingsPanelComponent({
    page,
    pageIndex,
    onUpdate,
    selectedQuestionId,
    onSelectQuestion,
    previousFields,
}: SettingsPanelProps) {
    const [activeQuestionIndex, setActiveQuestionIndex] = React.useState(0)

    const questions: FormQuestion[] = React.useMemo(() => {
        if (page.questions && page.questions.length > 0) return page.questions
        if (page.blocks && page.blocks.length > 0) return page.blocks
        return [
            {
                _id: page._id,
                id: page._id,
                questionKey: page.pageKey,
                blockKey: page.pageKey,
                type: page.type || "shortText",
                title: page.title !== undefined ? page.title : (page.label || ""),
                description: page.description !== undefined ? page.description : (page.helperText || ""),
                label: page.label || page.title || "",
                helperText: page.helperText || page.description || "",
                placeholder: page.placeholder || "",
                required: page.required ?? false,
                order: 1,
                options: page.options || [],
                validation: page.validation,
                settings: page.settings,
                appearance: page.appearance || { width: "full", icon: "" },
                coverImage: page.coverImage,
                isActive: page.isActive ?? true,
            },
        ]
    }, [page])

    const safeQuestionIndex = Math.min(activeQuestionIndex, Math.max(0, questions.length - 1))
    const currentQuestion = questions[safeQuestionIndex] || questions[0]
    const settings = currentQuestion.settings ?? {}

    React.useEffect(() => {
        if (!selectedQuestionId) return
        const foundIdx = questions.findIndex(
            (q) => (q.questionKey || q.blockKey) === selectedQuestionId
        )
        if (foundIdx !== -1) {
            setActiveQuestionIndex(foundIdx)
        }
    }, [selectedQuestionId, questions])

    const updateCurrentQuestion = (updates: Partial<FormQuestion>) => {
        const updatedQuestions = [...questions]
        const target = updatedQuestions[safeQuestionIndex]
        if (!target) return

        updatedQuestions[safeQuestionIndex] = {
            ...target,
            ...updates,
        }

        const pageUpdates: Partial<FormPage> = {
            questions: updatedQuestions,
            blocks: updatedQuestions,
        }
        if (safeQuestionIndex === 0) {
            if (updates.type) pageUpdates.type = updates.type
            if (updates.placeholder !== undefined) pageUpdates.placeholder = updates.placeholder
            if (updates.options !== undefined) pageUpdates.options = updates.options
            if (updates.settings !== undefined) pageUpdates.settings = updates.settings
            if (updates.required !== undefined) pageUpdates.required = updates.required
        }
        onUpdate(pageIndex, pageUpdates)
    }

    /** Merge a single settings group into the active question. */
    const patchSettings = (group: Partial<PageSettings>) => {
        updateCurrentQuestion({ settings: { ...settings, ...group } })
    }

    const patchValidation = (patch: Partial<Validation>) => {
        updateCurrentQuestion({ validation: { ...(currentQuestion.validation || {}), ...patch } })
    }

    const [pendingPaymentConvert, setPendingPaymentConvert] = React.useState(false)

    const applyTypeChange = (nextType: FormPage["type"]) => {
        const isOptionType = defaultOptionsForType(nextType).length > 0
        updateCurrentQuestion({
            type: nextType,
            settings: defaultSettingsForType(nextType),
            ...(nextType === "payment" || nextType === "statement" || nextType === "meeting"
                ? { required: false, options: [] }
                : isOptionType && (!currentQuestion.options || currentQuestion.options.length === 0)
                ? { options: defaultOptionsForType(nextType) }
                : {}),
        })
    }

    const confirmPaymentConversion = () => {
        const question: FormQuestion = {
            ...currentQuestion,
            type: "payment",
            settings: defaultSettingsForType("payment"),
            options: [],
            required: false,
        }
        onUpdate(pageIndex, {
            type: "payment",
            questions: [question],
            blocks: [question],
            settings: question.settings,
            label: question.label || page.label,
            title: question.title || page.title,
            required: false,
        })
        setActiveQuestionIndex(0)
        onSelectQuestion?.(question.questionKey || question.blockKey || null)
        setPendingPaymentConvert(false)
    }

    /**
     * Changing the question type resets settings to the new type's defaults.
     */
    const handleTypeChange = (value: FormPage["type"] | null) => {
        if (!value) return
        const nextType = value

        // Payment must be the only question on its page.
        if (nextType === "payment" && questions.length > 1) {
            setPendingPaymentConvert(true)
            return
        }

        applyTypeChange(nextType)
    }

    const isChoiceType = CHOICE_TYPES.includes(currentQuestion.type)
    const isMultiAnswer = MULTI_ANSWER_TYPES.includes(currentQuestion.type)
    const isStatement = currentQuestion.type === "statement"
    const isMeeting = currentQuestion.type === "meeting"
    const isPayment = currentQuestion.type === "payment"

    // Earlier fields for meeting prefill: every question on previous pages,
    // then the questions above the scheduler on this page.
    const earlierFields = React.useMemo(() => {
        const fields: MeetingSourceField[] = [...(previousFields ?? [])]
        questions.slice(0, safeQuestionIndex).forEach((question) => {
            if (question.type === "statement" || question.type === "meeting") return
            const key = question.questionKey || question.blockKey
            if (!key) return
            fields.push({
                key,
                label:
                    question.title ||
                    question.label ||
                    `Question ${fields.length + 1}`,
                type: question.type,
            })
        })
        return fields
    }, [previousFields, questions, safeQuestionIndex])

    return (
        <div data-settings-panel="true" className="flex h-full w-full flex-col overflow-hidden bg-white dark:bg-[#141418] border-l border-slate-200/90 dark:border-zinc-800/90 text-slate-800 dark:text-zinc-100">
            {/* Header: Page settings */}
            <div className="flex items-center gap-2 px-6 pt-5 pb-2">
                <Layers className="h-5 w-5 text-slate-900 dark:text-white" />
                <h3 className="text-base font-semibold text-slate-900 dark:text-white tracking-tight">Page settings</h3>
            </div>

            <div className="flex flex-1 min-h-0 flex-col overflow-y-auto">
                <div className="space-y-6 px-6 py-4">
                    <QuestionSwitcher
                        questions={questions}
                        activeIndex={safeQuestionIndex}
                        onSelect={(idx, q) => {
                            setActiveQuestionIndex(idx)
                            onSelectQuestion?.(q.questionKey || q.blockKey || null)
                        }}
                    />

                    <QuestionTypeSetting
                        type={currentQuestion.type}
                        index={safeQuestionIndex}
                        total={questions.length}
                        onChange={handleTypeChange}
                    />

                    {/* Required — every type except display-only ones */}
                    {!isStatement && !isMeeting && !isPayment && (
                        <RequiredToggle
                            checked={currentQuestion.required ?? false}
                            onCheckedChange={(required) => updateCurrentQuestion({ required })}
                        />
                    )}

                    <TypeSpecificSettings
                        question={currentQuestion}
                        settings={settings}
                        isChoiceType={isChoiceType}
                        isMultiAnswer={isMultiAnswer}
                        isStatement={isStatement}
                        onPatchSettings={patchSettings}
                        onPatchValidation={patchValidation}
                        earlierFields={earlierFields}
                    />

                    {!isPayment && (
                        <ValidationMessageSetting
                            validation={currentQuestion.validation}
                            onPatch={patchValidation}
                        />
                    )}

                    <CoverImageSetting
                        page={page}
                        pageIndex={pageIndex}
                        onUpdate={onUpdate}
                    />

                    <PageButtonSetting
                        page={page}
                        pageIndex={pageIndex}
                        isStatement={isStatement}
                        onUpdate={onUpdate}
                    />
                </div>
            </div>

            <ConfirmDialog
                open={pendingPaymentConvert}
                onOpenChange={setPendingPaymentConvert}
                title="Convert to payment page?"
                description={`Payment must be the only question on its page. Converting will keep this question and remove the other ${questions.length - 1} question${questions.length > 2 ? "s" : ""} from this page.`}
                confirmLabel="Convert to payment"
                onConfirm={confirmPaymentConversion}
            />
        </div>
    )
}

export const SettingsPanel = React.memo(SettingsPanelComponent)
