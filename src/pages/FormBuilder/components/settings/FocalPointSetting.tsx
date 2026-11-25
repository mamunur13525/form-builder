import React, { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import type { CoverImageFocalPoint } from "@/shared/types/common"
import { cn } from "@/lib/utils"

const DEFAULT_FOCAL_POINT: CoverImageFocalPoint = { x: 50, y: 50 }

interface FocalPointSettingProps {
    url: string
    alt?: string
    value?: CoverImageFocalPoint | null
    onChange: (focalPoint: CoverImageFocalPoint) => void
}

/**
 * Interactive focal-point picker with a dimmed preview that lights up on
 * hover/drag, a draggable target ring, and a Reset button. Commits `onChange`
 * once the drag ends so the live preview animates cleanly into position.
 */
export function FocalPointSetting({ url, alt, value, onChange }: FocalPointSettingProps) {
    const stageRef = useRef<HTMLDivElement>(null)
    const isDraggingRef = useRef(false)
    const dragPointRef = useRef<CoverImageFocalPoint | null>(null)
    const [dragPoint, setDragPoint] = useState<CoverImageFocalPoint | null>(null)
    const [isDragging, setIsDragging] = useState(false)

    const point = dragPoint ?? value ?? DEFAULT_FOCAL_POINT
    const isCentered = point.x === 50 && point.y === 50

    const computePoint = (clientX: number, clientY: number): CoverImageFocalPoint => {
        const rect = stageRef.current?.getBoundingClientRect()
        if (!rect || rect.width <= 0 || rect.height <= 0) return point
        const x = Math.round(Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100)))
        const y = Math.round(Math.min(100, Math.max(0, ((clientY - rect.top) / rect.height) * 100)))
        return { x, y }
    }

    const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
        e.preventDefault()
        e.currentTarget.setPointerCapture(e.pointerId)
        e.currentTarget.focus()
        isDraggingRef.current = true
        setIsDragging(true)
        const next = computePoint(e.clientX, e.clientY)
        dragPointRef.current = next
        setDragPoint(next)
    }

    const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
        if (!isDraggingRef.current) return
        const next = computePoint(e.clientX, e.clientY)
        dragPointRef.current = next
        setDragPoint(next)
    }

    const handlePointerEnd = () => {
        if (!isDraggingRef.current) return
        isDraggingRef.current = false
        setIsDragging(false)
        const finalPoint = dragPointRef.current
        dragPointRef.current = null
        setDragPoint(null)
        if (finalPoint) {
            onChange(finalPoint)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        const delta = e.shiftKey ? 10 : 2
        let next: CoverImageFocalPoint | null = null
        if (e.key === "ArrowLeft") next = { x: Math.max(0, point.x - delta), y: point.y }
        else if (e.key === "ArrowRight") next = { x: Math.min(100, point.x + delta), y: point.y }
        else if (e.key === "ArrowUp") next = { x: point.x, y: Math.max(0, point.y - delta) }
        else if (e.key === "ArrowDown") next = { x: point.x, y: Math.min(100, point.y + delta) }
        if (next) {
            e.preventDefault()
            onChange(next)
        }
    }

    return (
        <div className="space-y-2 pt-1">
            <span className="block text-xs font-medium text-slate-600 dark:text-zinc-400">
                Focal point
            </span>
            <div className="group relative flex h-36 w-full items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-100 select-none dark:border-zinc-800 dark:bg-zinc-900/80">
                <div
                    ref={stageRef}
                    role="slider"
                    tabIndex={0}
                    aria-label="Image focal point"
                    aria-valuetext={`${point.x}% horizontal, ${point.y}% vertical`}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerEnd}
                    onPointerCancel={handlePointerEnd}
                    onKeyDown={handleKeyDown}
                    className="relative inline-flex max-h-full max-w-full cursor-crosshair touch-none items-center justify-center focus:outline-none"
                >
                    <img
                        src={url}
                        alt={alt || "Focal point preview"}
                        draggable={false}
                        className={cn(
                            "pointer-events-none block h-auto max-h-36 w-auto max-w-full object-contain transition-[filter] duration-300 ease-out",
                            isDragging
                                ? "brightness-100"
                                : "brightness-[0.55] group-hover:brightness-100"
                        )}
                    />
                    <span
                        aria-hidden
                        className="pointer-events-none absolute h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-white bg-zinc-900/90 shadow-[0_1px_6px_rgba(0,0,0,0.45)] ring-1 ring-black/20"
                        style={{ left: `${point.x}%`, top: `${point.y}%` }}
                    />
                </div>
            </div>
            <div className="flex justify-end">
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isCentered}
                    onClick={() => onChange(DEFAULT_FOCAL_POINT)}
                    className="h-8 cursor-pointer rounded-lg border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-default disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                    Reset
                </Button>
            </div>
        </div>
    )
}
