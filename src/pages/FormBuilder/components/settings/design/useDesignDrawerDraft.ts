import React from "react"
import { THEME_PRESETS, type ThemePreset } from "../theme-presets"
import type {
    CoverImage,
    EndPage,
    FormPage,
    IFormTheme,
    IThemeFont,
} from "@/shared/types/common"
import { resolveFormTheme, loadThemeFont, type ResolvedFormTheme } from "@/shared/utils/theme"
import { playNudgeFeedback } from "@/shared/utils/nudge-feedback"
import { showError, showSuccess } from "@/shared/hooks/useToast"
import { OVERLAY_SELECTORS, type SidebarTab } from "./designOptions"

interface UseDesignDrawerDraftOptions {
    open: boolean
    theme?: IFormTheme | null
    page?: FormPage
    pageIndex?: number
    onUpdatePage?: (index: number, updates: Partial<FormPage>) => void
    endPage?: EndPage
    endPageIndex?: number
    onUpdateEndPage?: (index: number, updates: Partial<EndPage>) => void
    onSaveTheme: (theme: IFormTheme) => Promise<void>
    onCancel: () => void
    hasChangesRef: React.MutableRefObject<boolean>
}

export function useDesignDrawerDraft({
    open,
    theme,
    page,
    pageIndex = 0,
    onUpdatePage,
    endPage,
    endPageIndex = 0,
    onUpdateEndPage,
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

    const baseCoverImage = React.useMemo<CoverImage | null>(
        () => (endPage ? endPage.coverImage : page?.coverImage) ?? null,
        [endPage, page]
    )
    const baseCoverSignature = React.useMemo(() => JSON.stringify(baseCoverImage), [baseCoverImage])

    /**
     * The draft is stamped with the editing session it belongs to, so reopening
     * the drawer or receiving a new theme/page discards stale edits without an
     * effect that copies props into state.
     */
    const sessionKey = `${open}:${baseSignature}:${baseCoverSignature}`
    const [draft, setDraft] = React.useState<{
        key: string
        theme: ResolvedFormTheme
        coverImage: CoverImage | null
    } | null>(null)
    const draftTheme = draft?.key === sessionKey ? draft.theme : baseTheme
    const draftCoverImage = draft?.key === sessionKey ? draft.coverImage : baseCoverImage

    const updateDraft = React.useCallback(
        (
            updater: (prev: {
                theme: ResolvedFormTheme
                coverImage: CoverImage | null
            }) => { theme: ResolvedFormTheme; coverImage: CoverImage | null }
        ) => {
            setDraft((prev) => ({
                key: sessionKey,
                ...updater(
                    prev?.key === sessionKey
                        ? { theme: prev.theme, coverImage: prev.coverImage }
                        : { theme: baseTheme, coverImage: baseCoverImage }
                ),
            }))
        },
        [sessionKey, baseTheme, baseCoverImage]
    )

    // Load font in document head for live preview
    React.useEffect(() => {
        loadThemeFont(draftTheme.font)
    }, [draftTheme.font])

    // Publish unsaved-change state so the parent Sheet can block outside dismissal
    React.useEffect(() => {
        hasChangesRef.current =
            open &&
            (JSON.stringify(draftTheme) !== baseSignature ||
                JSON.stringify(draftCoverImage) !== baseCoverSignature)
    }, [draftTheme, draftCoverImage, baseSignature, baseCoverSignature, open, hasChangesRef])

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
        const currentTheme = JSON.stringify(draftTheme)
        const match = THEME_PRESETS.find((preset) => {
            if (JSON.stringify(resolveFormTheme(preset.theme)) !== currentTheme) {
                return false
            }
            if (preset.coverImage) {
                return (
                    draftCoverImage?.layout === "wallpaper" &&
                    draftCoverImage.url === preset.coverImage.url &&
                    (draftCoverImage.brightness ?? 0) === (preset.coverImage.brightness ?? 0)
                )
            }
            return draftCoverImage?.layout !== "wallpaper"
        })
        return match?.id ?? null
    }, [draftTheme, draftCoverImage])

    const applyPreset = React.useCallback(
        (preset: ThemePreset) => {
            updateDraft((prev) => ({
                theme: resolveFormTheme(preset.theme),
                coverImage: preset.coverImage
                    ? { ...preset.coverImage, layout: "wallpaper", mobileLayout: "wallpaper" }
                    : prev.coverImage?.layout === "wallpaper"
                        ? null
                        : prev.coverImage,
            }))
        },
        [updateDraft]
    )

    const patchTheme = React.useCallback(
        (patch: Partial<ResolvedFormTheme>) => {
            updateDraft((prev) => ({ ...prev, theme: { ...prev.theme, ...patch } }))
        },
        [updateDraft]
    )

    const patchFont = React.useCallback(
        (patch: Partial<IThemeFont>) => {
            updateDraft((prev) => ({
                ...prev,
                theme: { ...prev.theme, font: { ...prev.theme.font, ...patch } },
            }))
        },
        [updateDraft]
    )

    const patchWallpaperImage = React.useCallback(
        (patch: Partial<CoverImage>) => {
            updateDraft((prev) => ({
                ...prev,
                coverImage:
                    prev.coverImage?.layout === "wallpaper"
                        ? { ...prev.coverImage, ...patch, layout: "wallpaper" }
                        : prev.coverImage,
            }))
        },
        [updateDraft]
    )

    const setWallpaperImage = React.useCallback(
        (image: CoverImage | null) => {
            updateDraft((prev) => ({
                ...prev,
                coverImage: image?.url
                    ? {
                        ...(prev.coverImage?.layout === "wallpaper" ? prev.coverImage : {}),
                        ...image,
                        layout: "wallpaper",
                        mobileLayout: "wallpaper",
                    }
                    : prev.coverImage?.layout === "wallpaper"
                        ? null
                        : prev.coverImage,
            }))
        },
        [updateDraft]
    )

    const setWallpaperImageUrl = React.useCallback(
        (url: string) => {
            setWallpaperImage(url ? { url } : null)
        },
        [setWallpaperImage]
    )

    const handleSaveClick = async () => {
        setIsSaving(true)
        try {
            if (JSON.stringify(draftTheme) !== baseSignature) {
                await onSaveTheme(draftTheme)
            }
            if (JSON.stringify(draftCoverImage) !== baseCoverSignature) {
                if (endPage && onUpdateEndPage) {
                    onUpdateEndPage(endPageIndex, { coverImage: draftCoverImage })
                } else if (page && onUpdatePage) {
                    onUpdatePage(pageIndex, { coverImage: draftCoverImage })
                }
            }
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
        draftCoverImage,
        sidebarTab,
        setSidebarTab,
        activePresetId,
        applyPreset,
        patchTheme,
        patchFont,
        patchWallpaperImage,
        setWallpaperImage,
        setWallpaperImageUrl,
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
