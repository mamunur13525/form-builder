import React, { useMemo, useRef, useState } from "react"
import {
    X,
    RotateCcw,
    RotateCw,
    FlipHorizontal2,
    FlipVertical2,
} from "lucide-react"
import { Dialog } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { RangeSetting, OVERLAY_CLASS } from "./primitives"
import {
    COVER_IMAGE_FILTERS,
    getCoverImageFilterCss,
} from "@/shared/utils/theme"
import type { CoverImage, CoverImageCrop, CoverImageEdits } from "@/shared/types/common"
import { cn } from "@/lib/utils"

type EditorTab = "crop" | "adjustments" | "filters"

interface AspectOption {
    value: string
    label: string
    ratio: number | null
}

const ASPECT_OPTIONS: readonly AspectOption[] = [
    { value: "free", label: "Free", ratio: null },
    { value: "1:1", label: "1:1 (Square)", ratio: 1 },
    { value: "4:3", label: "4:3", ratio: 4 / 3 },
    { value: "16:9", label: "16:9", ratio: 16 / 9 },
    { value: "3:2", label: "3:2", ratio: 3 / 2 },
    { value: "2:3", label: "2:3", ratio: 2 / 3 },
]

const DEFAULT_CROP: CoverImageCrop = { x: 0, y: 0, width: 100, height: 100, aspect: "free" }

interface DraftImageState {
    crop: CoverImageCrop
    angle: number
    rotate: number
    flipH: boolean
    flipV: boolean
    brightness: number
    contrast: number
    saturation: number
    filter: string
}

function buildInitialDraft(coverImage: CoverImage): DraftImageState {
    const edits = coverImage.edits
    return {
        crop: edits?.crop ? { ...DEFAULT_CROP, ...edits.crop } : { ...DEFAULT_CROP },
        angle: edits?.angle ?? 0,
        rotate: edits?.rotate ?? 0,
        flipH: edits?.flipH ?? false,
        flipV: edits?.flipV ?? false,
        brightness: coverImage.brightness ?? 0,
        contrast: edits?.contrast ?? 0,
        saturation: edits?.saturation ?? 0,
        filter: edits?.filter ?? "original",
    }
}

const DEFAULT_DRAFT: DraftImageState = {
    crop: { ...DEFAULT_CROP },
    angle: 0,
    rotate: 0,
    flipH: false,
    flipV: false,
    brightness: 0,
    contrast: 0,
    saturation: 0,
    filter: "original",
}

type DragHandle = "move" | "nw" | "ne" | "sw" | "se"

interface CropStageProps {
    url: string
    alt?: string
    draft: DraftImageState
    onChangeCrop: (crop: CoverImageCrop) => void
}

function CropStage({ url, alt, draft, onChangeCrop }: CropStageProps) {
    const stageRef = useRef<HTMLDivElement>(null)
    const dragStateRef = useRef<{
        handle: DragHandle
        startX: number
        startY: number
        startCrop: CoverImageCrop
    } | null>(null)
    const [naturalSize, setNaturalSize] = useState<{ w: number; h: number }>({ w: 1, h: 1 })

    const ratio = ASPECT_OPTIONS.find((a) => a.value === (draft.crop.aspect ?? "free"))?.ratio ?? null

    const clampCrop = (next: CoverImageCrop): CoverImageCrop => {
        const minSize = 15
        let w = Math.max(minSize, Math.min(100, next.width))
        let h = Math.max(minSize, Math.min(100, next.height))
        const x = Math.max(0, Math.min(100 - w, next.x))
        const y = Math.max(0, Math.min(100 - h, next.y))
        w = Math.min(w, 100 - x)
        h = Math.min(h, 100 - y)
        return {
            ...next,
            x: Math.round(x * 10) / 10,
            y: Math.round(y * 10) / 10,
            width: Math.round(w * 10) / 10,
            height: Math.round(h * 10) / 10,
        }
    }

    const startDrag = (handle: DragHandle, e: React.PointerEvent) => {
        e.preventDefault()
        e.stopPropagation()
        ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
        dragStateRef.current = {
            handle,
            startX: e.clientX,
            startY: e.clientY,
            startCrop: { ...draft.crop },
        }
    }

    const onPointerMove = (e: React.PointerEvent) => {
        const drag = dragStateRef.current
        const stage = stageRef.current
        if (!drag || !stage) return
        const rect = stage.getBoundingClientRect()
        if (rect.width <= 0 || rect.height <= 0) return

        const dx = ((e.clientX - drag.startX) / rect.width) * 100
        const dy = ((e.clientY - drag.startY) / rect.height) * 100
        const s = drag.startCrop

        if (drag.handle === "move") {
            onChangeCrop(clampCrop({ ...s, x: s.x + dx, y: s.y + dy }))
            return
        }

        let x = s.x
        let y = s.y
        let w = s.width
        let h = s.height

        if (drag.handle.includes("e")) w = s.width + dx
        if (drag.handle.includes("s")) h = s.height + dy
        if (drag.handle.includes("w")) {
            const maxShift = s.width - 15
            const shift = Math.min(maxShift, Math.max(-s.x, dx))
            x = s.x + shift
            w = s.width - shift
        }
        if (drag.handle.includes("n")) {
            const maxShift = s.height - 15
            const shift = Math.min(maxShift, Math.max(-s.y, dy))
            y = s.y + shift
            h = s.height - shift
        }

        if (ratio) {
            const imgAspect = naturalSize.w / Math.max(1, naturalSize.h)
            // width% / height% = ratio / imgAspect
            const pctRatio = ratio / imgAspect
            h = Math.max(15, Math.min(100 - y, w / pctRatio))
            w = Math.max(15, Math.min(100 - x, h * pctRatio))
        }

        onChangeCrop(clampCrop({ ...s, x, y, width: w, height: h }))
    }

    const onPointerUp = () => {
        dragStateRef.current = null
    }

    const filterCss = getCoverImageFilterCss(draft.brightness, {
        contrast: draft.contrast,
        saturation: draft.saturation,
        filter: draft.filter,
    })
    const totalAngle = draft.rotate + draft.angle

    return (
        <div className="relative flex h-64 w-full items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-100 select-none dark:border-zinc-800 dark:bg-zinc-900">
            <div
                ref={stageRef}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerUp}
                className="relative inline-flex max-h-60 max-w-full items-center justify-center overflow-hidden"
            >
                <img
                    src={url}
                    alt={alt || "Edit preview"}
                    draggable={false}
                    onLoad={(e) => {
                        const img = e.currentTarget
                        if (img.naturalWidth && img.naturalHeight) {
                            setNaturalSize({ w: img.naturalWidth, h: img.naturalHeight })
                        }
                    }}
                    style={{
                        filter: filterCss,
                        transform: `scale(${draft.flipH ? -1 : 1}, ${draft.flipV ? -1 : 1}) rotate(${totalAngle}deg)`,
                    }}
                    className="pointer-events-none block h-auto max-h-60 w-auto max-w-full object-contain transition-transform duration-150"
                />

                {/* Interactive Crop Box */}
                <div
                    onPointerDown={(e) => startDrag("move", e)}
                    style={{
                        left: `${draft.crop.x}%`,
                        top: `${draft.crop.y}%`,
                        width: `${draft.crop.width}%`,
                        height: `${draft.crop.height}%`,
                        boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.45)",
                    }}
                    className="absolute cursor-move border-2 border-white/95 ring-1 ring-black/40"
                >
                    {/* Corner handles */}
                    {(["nw", "ne", "sw", "se"] as const).map((corner) => (
                        <span
                            key={corner}
                            onPointerDown={(e) => startDrag(corner, e)}
                            className={cn(
                                "absolute h-3.5 w-3.5 rounded-xs border-2 border-zinc-900 bg-white shadow-sm",
                                corner === "nw" && "-top-1.5 -left-1.5 cursor-nwse-resize",
                                corner === "ne" && "-top-1.5 -right-1.5 cursor-nesw-resize",
                                corner === "sw" && "-bottom-1.5 -left-1.5 cursor-nesw-resize",
                                corner === "se" && "-bottom-1.5 -right-1.5 cursor-nwse-resize"
                            )}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}

function AngleDial({
    value,
    onChange,
}: {
    value: number
    onChange: (angle: number) => void
}) {
    const rulerRef = useRef<HTMLDivElement>(null)
    const draggingRef = useRef(false)
    const min = -30
    const max = 30

    const computeAngle = (clientX: number) => {
        const rect = rulerRef.current?.getBoundingClientRect()
        if (!rect || rect.width <= 0) return value
        const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width))
        return Math.round(min + ratio * (max - min))
    }

    const pct = ((value - min) / (max - min)) * 100
    const ticks = [-25, -20, -15, -10, -5, 0, 5, 10, 15, 20, 25]

    return (
        <div className="space-y-2 pt-2">
            <div
                ref={rulerRef}
                role="slider"
                tabIndex={0}
                aria-label="Straighten angle"
                aria-valuemin={min}
                aria-valuemax={max}
                aria-valuenow={value}
                onPointerDown={(e) => {
                    e.preventDefault()
                    e.currentTarget.setPointerCapture(e.pointerId)
                    draggingRef.current = true
                    onChange(computeAngle(e.clientX))
                }}
                onPointerMove={(e) => {
                    if (!draggingRef.current) return
                    onChange(computeAngle(e.clientX))
                }}
                onPointerUp={() => {
                    draggingRef.current = false
                }}
                onPointerCancel={() => {
                    draggingRef.current = false
                }}
                onKeyDown={(e) => {
                    if (e.key === "ArrowLeft") {
                        e.preventDefault()
                        onChange(Math.max(min, value - 1))
                    } else if (e.key === "ArrowRight") {
                        e.preventDefault()
                        onChange(Math.min(max, value + 1))
                    }
                }}
                className="relative flex h-12 cursor-ew-resize touch-none flex-col justify-between px-4 select-none focus:outline-none"
            >
                <div className="relative flex h-4 items-center justify-between">
                    {ticks.map((t) => {
                        const isMajor = t % 10 === 0
                        return (
                            <span
                                key={t}
                                className={cn(
                                    "rounded-full bg-slate-300 dark:bg-zinc-600",
                                    isMajor ? "h-2 w-2" : "h-1 w-1"
                                )}
                            />
                        )
                    })}
                    {/* Active indicator needle */}
                    <span
                        aria-hidden
                        className="pointer-events-none absolute top-1/2 h-5 w-0.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-slate-900 dark:bg-white"
                        style={{ left: `${pct}%` }}
                    />
                </div>
                <div className="flex items-center justify-between px-3 text-xs font-medium text-slate-500 tabular-nums dark:text-zinc-400">
                    <span>-20°</span>
                    <span>-10°</span>
                    <span className="font-semibold text-slate-800 dark:text-zinc-100">
                        {value}°
                    </span>
                    <span>10°</span>
                    <span>20°</span>
                </div>
            </div>
        </div>
    )
}

interface ImageEditorInnerProps {
    coverImage: CoverImage
    onClose: () => void
    onSave: (updates: { brightness: number; edits: CoverImageEdits }) => void
}

function ImageEditorInner({ coverImage, onClose, onSave }: ImageEditorInnerProps) {
    const initial = useMemo(() => buildInitialDraft(coverImage), [coverImage])
    const [tab, setTab] = useState<EditorTab>("crop")
    const [draft, setDraft] = useState<DraftImageState>(initial)

    const isDefault = JSON.stringify(draft) === JSON.stringify(DEFAULT_DRAFT)
    const isDirty = JSON.stringify(draft) !== JSON.stringify(initial)

    const handleAspectChange = (aspectValue: string | null) => {
        if (!aspectValue) return
        const opt = ASPECT_OPTIONS.find((a) => a.value === aspectValue)
        if (!opt || opt.ratio === null) {
            setDraft((prev) => ({
                ...prev,
                crop: { ...prev.crop, aspect: aspectValue },
            }))
            return
        }
        // Center a sensible crop box matching the chosen ratio.
        const r = opt.ratio
        const w = r >= 1 ? 80 : Math.round(80 * r)
        const h = r >= 1 ? Math.round(80 / r) : 80
        setDraft((prev) => ({
            ...prev,
            crop: {
                x: Math.round((100 - w) / 2),
                y: Math.round((100 - h) / 2),
                width: Math.min(100, Math.max(15, w)),
                height: Math.min(100, Math.max(15, h)),
                aspect: aspectValue,
            },
        }))
    }

    const handleSave = () => {
        onSave({
            brightness: draft.brightness,
            edits: {
                crop: draft.crop,
                angle: draft.angle,
                rotate: draft.rotate,
                flipH: draft.flipH,
                flipV: draft.flipV,
                contrast: draft.contrast,
                saturation: draft.saturation,
                filter: draft.filter,
            },
        })
        onClose()
    }

    const previewFilterCss = getCoverImageFilterCss(draft.brightness, {
        contrast: draft.contrast,
        saturation: draft.saturation,
        filter: draft.filter,
    })

    return (
        <div className="flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                    <h2 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                        Image editor
                    </h2>
                </div>
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close image editor"
                    className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1 border-b border-slate-100 px-5 pt-2 dark:border-zinc-800">
                {(
                    [
                        { id: "crop", label: "Crop" },
                        { id: "adjustments", label: "Adjustments" },
                        { id: "filters", label: "Filters" },
                    ] as const
                ).map((item) => {
                    const active = tab === item.id
                    return (
                        <button
                            key={item.id}
                            type="button"
                            onClick={() => setTab(item.id)}
                            className={cn(
                                "relative cursor-pointer rounded-t-lg px-3.5 py-2 text-xs font-medium transition-colors",
                                active
                                    ? "bg-slate-100/80 font-semibold text-slate-900 after:absolute after:inset-x-2 after:bottom-0 after:h-0.5 after:rounded-full after:bg-slate-900 dark:bg-zinc-800/70 dark:text-white dark:after:bg-white"
                                    : "text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200"
                            )}
                        >
                            {item.label}
                        </button>
                    )
                })}
            </div>

            {/* Body */}
            <div className="max-h-[65vh] overflow-y-auto px-5 py-4">
                {tab === "crop" && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between gap-3">
                            <span className="text-xs font-medium text-slate-600 dark:text-zinc-400">
                                Aspect ratio
                            </span>
                            <Select
                                value={draft.crop.aspect ?? "free"}
                                onValueChange={handleAspectChange}
                            >
                                <SelectTrigger className="h-8 w-36 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-800 dark:border-zinc-800 dark:bg-[#1a1a20] dark:text-zinc-100">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className={OVERLAY_CLASS}>
                                    {ASPECT_OPTIONS.map((opt) => (
                                        <SelectItem key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <CropStage
                            url={coverImage.url}
                            alt={coverImage.alt}
                            draft={draft}
                            onChangeCrop={(crop) => setDraft((prev) => ({ ...prev, crop }))}
                        />

                        <AngleDial
                            value={draft.angle}
                            onChange={(angle) => setDraft((prev) => ({ ...prev, angle }))}
                        />
                    </div>
                )}

                {tab === "adjustments" && (
                    <div className="space-y-5">
                        <div className="space-y-3">
                            <p className="text-xs font-semibold text-slate-800 dark:text-zinc-200">
                                Transform
                            </p>
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-medium text-slate-600 dark:text-zinc-400">
                                    Rotate
                                </span>
                                <div className="flex items-center gap-1.5">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        aria-label="Rotate left 90 degrees"
                                        onClick={() =>
                                            setDraft((prev) => ({
                                                ...prev,
                                                rotate: (prev.rotate - 90 + 360) % 360,
                                            }))
                                        }
                                        className="h-8 w-8 cursor-pointer rounded-lg text-slate-600 hover:bg-slate-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                                    >
                                        <RotateCcw className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        aria-label="Rotate right 90 degrees"
                                        onClick={() =>
                                            setDraft((prev) => ({
                                                ...prev,
                                                rotate: (prev.rotate + 90) % 360,
                                            }))
                                        }
                                        className="h-8 w-8 cursor-pointer rounded-lg text-slate-600 hover:bg-slate-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                                    >
                                        <RotateCw className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-medium text-slate-600 dark:text-zinc-400">
                                    Flip
                                </span>
                                <div className="flex items-center gap-1.5">
                                    <Button
                                        type="button"
                                        variant={draft.flipH ? "secondary" : "ghost"}
                                        size="icon"
                                        aria-label="Flip horizontal"
                                        onClick={() =>
                                            setDraft((prev) => ({ ...prev, flipH: !prev.flipH }))
                                        }
                                        className="h-8 w-8 cursor-pointer rounded-lg text-slate-600 hover:bg-slate-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                                    >
                                        <FlipHorizontal2 className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        type="button"
                                        variant={draft.flipV ? "secondary" : "ghost"}
                                        size="icon"
                                        aria-label="Flip vertical"
                                        onClick={() =>
                                            setDraft((prev) => ({ ...prev, flipV: !prev.flipV }))
                                        }
                                        className="h-8 w-8 cursor-pointer rounded-lg text-slate-600 hover:bg-slate-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                                    >
                                        <FlipVertical2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <hr className="border-0 border-t border-slate-200/80 dark:border-zinc-800/80" />

                        <div className="space-y-4">
                            <p className="text-xs font-semibold text-slate-800 dark:text-zinc-200">
                                Color
                            </p>
                            <RangeSetting
                                label="Brightness"
                                min={-100}
                                max={100}
                                value={draft.brightness}
                                onChange={(brightness) =>
                                    setDraft((prev) => ({ ...prev, brightness }))
                                }
                            />
                            <RangeSetting
                                label="Contrast"
                                min={-100}
                                max={100}
                                value={draft.contrast}
                                onChange={(contrast) =>
                                    setDraft((prev) => ({ ...prev, contrast }))
                                }
                            />
                            <RangeSetting
                                label="Saturation"
                                min={-100}
                                max={100}
                                value={draft.saturation}
                                onChange={(saturation) =>
                                    setDraft((prev) => ({ ...prev, saturation }))
                                }
                            />
                        </div>

                        {/* Live compact preview */}
                        <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-100 dark:border-zinc-800 dark:bg-zinc-900">
                            <img
                                src={coverImage.url}
                                alt={coverImage.alt || "Adjustment preview"}
                                style={{
                                    filter: previewFilterCss,
                                    transform: `scale(${draft.flipH ? -1 : 1}, ${draft.flipV ? -1 : 1}) rotate(${draft.rotate + draft.angle}deg)`,
                                }}
                                className="mx-auto h-32 w-full object-contain transition-transform duration-150"
                            />
                        </div>
                    </div>
                )}

                {tab === "filters" && (
                    <div className="grid grid-cols-3 gap-2.5">
                        {COVER_IMAGE_FILTERS.map((preset) => {
                            const selected = draft.filter === preset.id
                            const cardFilter = getCoverImageFilterCss(draft.brightness, {
                                contrast: draft.contrast,
                                saturation: draft.saturation,
                                filter: preset.id,
                            })
                            return (
                                <button
                                    key={preset.id}
                                    type="button"
                                    onClick={() =>
                                        setDraft((prev) => ({ ...prev, filter: preset.id }))
                                    }
                                    className={cn(
                                        "group cursor-pointer overflow-hidden rounded-xl border text-center transition-all",
                                        selected
                                            ? "border-2 border-slate-900 shadow-xs dark:border-white"
                                            : "border-slate-200 hover:border-slate-300 dark:border-zinc-800 dark:hover:border-zinc-700"
                                    )}
                                >
                                    <div className="h-20 w-full overflow-hidden bg-slate-100 dark:bg-zinc-900">
                                        <img
                                            src={coverImage.url}
                                            alt={preset.label}
                                            style={{ filter: cardFilter }}
                                            className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                                        />
                                    </div>
                                    <div className="bg-white py-1.5 text-xs font-medium text-slate-700 dark:bg-[#18181c] dark:text-zinc-200">
                                        {preset.label}
                                    </div>
                                </button>
                            )
                        })}
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-2 border-t border-slate-100 px-5 py-3 dark:border-zinc-800">
                <Button
                    type="button"
                    variant="ghost"
                    disabled={isDefault}
                    onClick={() => setDraft({ ...DEFAULT_DRAFT, crop: { ...DEFAULT_CROP } })}
                    className="h-8 cursor-pointer rounded-lg px-3 text-xs font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-40 dark:text-zinc-400 dark:hover:bg-zinc-800"
                >
                    Reset
                </Button>
                <Button
                    type="button"
                    disabled={!isDirty}
                    onClick={handleSave}
                    className="h-8 cursor-pointer rounded-lg bg-[#FF5722] px-4 text-xs font-semibold text-white hover:bg-[#F4511E] disabled:opacity-45"
                >
                    Save
                </Button>
            </div>
        </div>
    )
}

interface ImageEditorDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    coverImage: CoverImage
    onSave: (updates: { brightness: number; edits: CoverImageEdits }) => void
}

export function ImageEditorDialog({
    open,
    onOpenChange,
    coverImage,
    onSave,
}: ImageEditorDialogProps) {
    return (
        <Dialog
            open={open}
            onOpenChange={onOpenChange}
            className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white p-0 text-slate-900 shadow-2xl dark:border-zinc-800 dark:bg-[#141418] dark:text-zinc-100"
        >
            {open && (
                <ImageEditorInner
                    key={coverImage.url}
                    coverImage={coverImage}
                    onClose={() => onOpenChange(false)}
                    onSave={onSave}
                />
            )}
        </Dialog>
    )
}
