import React from "react"
import { THEME_PRESETS, type ThemePreset } from "../theme-presets"
import type {
    IFormTheme,
    IThemeBackgroundImage,
    IThemeFont,
} from "@/shared/types/common"
import { resolveFormTheme, loadThemeFont, type ResolvedFormTheme } from "@/shared/utils/theme"
import { playNudgeFeedback } from "@/shared/utils/nudge-feedback"
import { showError, showSuccess } from "@/shared/hooks/useToast"
import { OVERLAY_SELECTORS, type SidebarTab } from "./designOptions"

interface UseDesignDrawerDraftOptions {
    open: boolean
    theme?: IFormTheme | null
    onSaveTheme: (theme: IFormTheme) => Promise<void>
    onCancel: () => void
    hasChangesRef: React.MutableRefObject<boolean>
}

export function useDesignDrawerDraft({
    open,
    theme,
    onSaveTheme,
    onCancel,
    hasChangesRef,
}: UseDesignDrawerDraftOptions) {
    const [isSaving, setIsSaving] = React.useState(false)
    const [sidebarTab, setSidebarTab] = React.useState<SidebarTab>("settings")
    const [vibratingButton, setVibratingButton] = React.useState<"cancel" | "save" | null>(null)
    const [cancelPopoverOpen, setCancelPopoverOpen] = React.useState(false)
    const [savePopoverOpen, setSavePopoverOpen] = React.useState(false)
    const containerRef = React.useRef<HTMLDivElement>(null)
    const nudgeTimers = React.useRef<number[]>([])

    const baseTheme = React.useMemo(() => resolveFormTheme(theme), [theme])
    const baseSignature = React.useMemo(() => JSON.stringify(baseTheme), [baseTheme])

    /**
     * The draft is stamped with the editing session it belongs to, so reopening
     * the drawer or receiving a new theme discards stale edits without an
     * effect that copies props into state.
     */
    const sessionKey = `${open}:${baseSignature}`
    const [draft, setDraft] = React.useState<{ key: string; theme: ResolvedFormTheme } | null>(null)
    const draftTheme = draft?.key === sessionKey ? draft.theme : baseTheme

    const updateDraft = React.useCallback(
        (updater: (prev: ResolvedFormTheme) => ResolvedFormTheme) => {
            setDraft((prev) => ({
                key: sessionKey,
                theme: updater(prev?.key === sessionKey ? prev.theme : baseTheme),
            }))
        },
        [sessionKey, baseTheme]
    )

    // Load font in document head for live preview
    React.useEffect(() => {
        loadThemeFont(draftTheme.font)
    }, [draftTheme.font])

    // Publish unsaved-change state so the parent Sheet can block outside dismissal
    React.useEffect(() => {
        hasChangesRef.current = open && JSON.stringify(draftTheme) !== baseSignature
    }, [draftTheme, baseSignature, open, hasChangesRef])

    const clearNudgeTimers = React.useCallback(() => {
        nudgeTimers.current.forEach(window.clearTimeout)
        nudgeTimers.current = []
    }, [])

    React.useEffect(() => clearNudgeTimers, [clearNudgeTimers])

    const nudgeFooterButtons = React.useCallback(() => {
        clearNudgeTimers()
        setVibratingButton("cancel")
        playNudgeFeedback()
        nudgeTimers.current.push(
            window.setTimeout(() => setVibratingButton(null), 300),
            window.setTimeout(() => setVibratingButton("save"), 300),
            window.setTimeout(() => setVibratingButton(null), 600)
        )
    }, [clearNudgeTimers])

    // Outside clicks close the drawer, unless there are unsaved changes to resolve.
    React.useEffect(() => {
        if (!open) return

        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target
            if (!containerRef.current || !(target instanceof Node)) return
            if (containerRef.current.contains(target)) return
            if (target instanceof Element && target.closest(OVERLAY_SELECTORS)) return

            if (hasChangesRef.current) {
                nudgeFooterButtons()
            } else {
                onCancel()
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [open, hasChangesRef, onCancel, nudgeFooterButtons])

    const activePresetId = React.useMemo(() => {
        const current = JSON.stringify(draftTheme)
        const match = THEME_PRESETS.find(
            (preset) => JSON.stringify(resolveFormTheme(preset.theme)) === current
        )
        return match?.id ?? null
    }, [draftTheme])

    const applyPreset = React.useCallback(
        (preset: ThemePreset) => {
            updateDraft(() => resolveFormTheme(preset.theme))
        },
        [updateDraft]
    )

    const patchTheme = React.useCallback(
        (patch: Partial<ResolvedFormTheme>) => {
            updateDraft((prev) => ({ ...prev, ...patch }))
        },
        [updateDraft]
    )

    const patchFont = React.useCallback(
        (patch: Partial<IThemeFont>) => {
            updateDraft((prev) => ({ ...prev, font: { ...prev.font, ...patch } }))
        },
        [updateDraft]
    )

    const patchBackgroundImage = React.useCallback(
        (patch: Partial<IThemeBackgroundImage>) => {
            updateDraft((prev) => ({
                ...prev,
                backgroundImage: prev.backgroundImage
                    ? { ...prev.backgroundImage, ...patch }
                    : null,
            }))
        },
        [updateDraft]
    )

    const setBackgroundImageUrl = React.useCallback(
        (url: string) => {
            updateDraft((prev) => ({
                ...prev,
                backgroundImage: url
                    ? {
                        brightness: 0,
                        tile: false,
                        ...prev.backgroundImage,
                        url,
                    }
                    : null,
            }))
        },
        [updateDraft]
    )

    const handleSaveClick = async () => {
        setIsSaving(true)
        try {
            await onSaveTheme(draftTheme)
            hasChangesRef.current = false
            setSavePopoverOpen(false)
            showSuccess("Design saved", "Your theme changes have been applied.")
            onCancel()
        } catch (error) {
            console.error("Failed to save theme:", error)
            showError("Could not save design", error)
        } finally {
            setIsSaving(false)
        }
    }

    const handleCancelClick = () => {
        hasChangesRef.current = false
        setCancelPopoverOpen(false)
        onCancel()
    }

    const handleCancelPopoverOpenChange = React.useCallback(
        (nextOpen: boolean) => {
            if (nextOpen && !hasChangesRef.current) {
                onCancel()
                return
            }
            setCancelPopoverOpen(nextOpen)
        },
        [hasChangesRef, onCancel]
    )

    return {
        containerRef,
        draftTheme,
        sidebarTab,
        setSidebarTab,
        activePresetId,
        applyPreset,
        patchTheme,
        patchFont,
        patchBackgroundImage,
        setBackgroundImageUrl,
        handleSaveClick,
        handleCancelClick,
        handleCancelPopoverOpenChange,
        cancelPopoverOpen,
        savePopoverOpen,
        setSavePopoverOpen,
        isSaving,
        vibratingButton,
    }
}
