import React from "react"
import { Layers, Palette, Settings as SettingsIcon } from "lucide-react"
import { Tabs, TabsContent } from "../../../components/ui/tabs"

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
import { CoverImageSetting } from "./settings/CoverImageSetting"
import {
    PageButtonSetting,
    ValidationMessageSetting,
} from "./settings/PageSettingsSections"

interface SettingsPanelProps {
    page: FormPage
    pageIndex: number
    onUpdate: (index: number, updates: Partial<FormPage>) => void
    onOpenDesignDrawer: () => void
    selectedQuestionId?: string | null
    onSelectQuestion?: (questionId: string | null) => void
}

function SettingsPanelComponent({
    page,
    pageIndex,
    onUpdate,
    onOpenDesignDrawer,
    selectedQuestionId,
    onSelectQuestion,
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

    /**
     * Changing the question type resets settings to the new type's defaults.
     */
    const handleTypeChange = (value: FormPage["type"] | null) => {
        if (!value) return
        const nextType = value
        const isOptionType = defaultOptionsForType(nextType).length > 0
        updateCurrentQuestion({
            type: nextType,
            settings: defaultSettingsForType(nextType),
            ...(isOptionType && (!currentQuestion.options || currentQuestion.options.length === 0)
                ? { options: defaultOptionsForType(nextType) }
                : {}),
        })
    }

    const isChoiceType = CHOICE_TYPES.includes(currentQuestion.type)
    const isMultiAnswer = MULTI_ANSWER_TYPES.includes(currentQuestion.type)
    const isStatement = currentQuestion.type === "statement"

    return (
        <div data-settings-panel="true" className="flex h-full w-full flex-col overflow-hidden bg-white dark:bg-[#141418] border-l border-slate-200/90 dark:border-zinc-800/90 text-slate-800 dark:text-zinc-100">
            {/* Header: Page settings */}
            <div className="flex items-center gap-2 px-6 pt-5 pb-2">
                <Layers className="h-5 w-5 text-slate-900 dark:text-white" />
                <h3 className="text-base font-semibold text-slate-900 dark:text-white tracking-tight">Page settings</h3>
            </div>

            <div className="flex flex-1 min-h-0 flex-col">
                <Tabs defaultValue="settings" className="flex flex-1 min-h-0 flex-col">
                    {/* Pill tabs: Settings (active) | Design */}
                    <div className="px-6 py-2">
                        <div className="flex h-10 rounded-lg bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-1">
                            <div className="flex h-8 flex-1 items-center justify-center gap-2 rounded-lg bg-white dark:bg-[#1e1e24] text-sm font-medium text-slate-900 dark:text-white shadow-xs border border-slate-200 dark:border-zinc-700/60">
                                <SettingsIcon className="h-4 w-4 text-[#FF5722]" />
                                Settings
                            </div>
                            <button
                                type="button"
                                onClick={onOpenDesignDrawer}
                                className="flex h-8 flex-1 items-center justify-center gap-2 rounded-lg text-sm font-medium text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                            >
                                <Palette className="h-4 w-4 text-slate-400 dark:text-zinc-400" />
                                Design
                            </button>
                        </div>
                    </div>

                    <TabsContent value="settings" className="flex-1 min-h-0 overflow-y-auto">
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

                            {/* Required — every type except statement */}
                            {!isStatement && (
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
                            />

                            <ValidationMessageSetting
                                validation={currentQuestion.validation}
                                onPatch={patchValidation}
                            />

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
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}

export const SettingsPanel = React.memo(SettingsPanelComponent)
