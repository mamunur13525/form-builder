import { useRef, useState, useEffect, useCallback } from "react"
import { Eraser } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SignatureFieldProps {
    value?: string
    onChange?: (value: string) => void
    disabled?: boolean
}

/**
 * A blank white board the respondent signs on. Emits a PNG data URL.
 * Supports mouse and touch input, and can be cleared and re-signed.
 */
export function SignatureField({ value, onChange, disabled }: SignatureFieldProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [isDrawing, setIsDrawing] = useState(false)
    const [hasInk, setHasInk] = useState(Boolean(value))

    // Size the canvas to its container and restore any existing signature.
    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ratio = window.devicePixelRatio || 1
        const rect = canvas.getBoundingClientRect()
        canvas.width = rect.width * ratio
        canvas.height = rect.height * ratio

        const ctx = canvas.getContext("2d")
        if (!ctx) return
        ctx.scale(ratio, ratio)
        ctx.lineWidth = 2
        ctx.lineCap = "round"
        ctx.lineJoin = "round"
        ctx.strokeStyle = "#111827"

        if (value) {
            const img = new Image()
            img.onload = () => ctx.drawImage(img, 0, 0, rect.width, rect.height)
            img.src = value
        }
        // Only run on mount — redrawing on every value change would fight the pen.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const pointFromEvent = (e: React.MouseEvent | React.TouchEvent) => {
        const canvas = canvasRef.current
        if (!canvas) return { x: 0, y: 0 }
        const rect = canvas.getBoundingClientRect()
        if ("touches" in e) {
            const touch = e.touches[0] ?? e.changedTouches[0]
            return { x: touch.clientX - rect.left, y: touch.clientY - rect.top }
        }
        return { x: e.clientX - rect.left, y: e.clientY - rect.top }
    }

    const start = (e: React.MouseEvent | React.TouchEvent) => {
        if (disabled) return
        const ctx = canvasRef.current?.getContext("2d")
        if (!ctx) return
        const { x, y } = pointFromEvent(e)
        ctx.beginPath()
        ctx.moveTo(x, y)
        setIsDrawing(true)
    }

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing || disabled) return
        e.preventDefault()
        const ctx = canvasRef.current?.getContext("2d")
        if (!ctx) return
        const { x, y } = pointFromEvent(e)
        ctx.lineTo(x, y)
        ctx.stroke()
        setHasInk(true)
    }

    const end = useCallback(() => {
        if (!isDrawing) return
        setIsDrawing(false)
        const canvas = canvasRef.current
        if (!canvas) return
        onChange?.(canvas.toDataURL("image/png"))
    }, [isDrawing, onChange])

    const clear = () => {
        const canvas = canvasRef.current
        const ctx = canvas?.getContext("2d")
        if (!canvas || !ctx) return
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        setHasInk(false)
        onChange?.("")
    }

    return (
        <div className="space-y-2">
            <canvas
                ref={canvasRef}
                onMouseDown={start}
                onMouseMove={draw}
                onMouseUp={end}
                onMouseLeave={end}
                onTouchStart={start}
                onTouchMove={draw}
                onTouchEnd={end}
                aria-label="Signature area"
                className={`h-40 w-full touch-none rounded-md border bg-white ${
                    disabled ? "opacity-50" : "cursor-crosshair"
                }`}
            />
            <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                    {hasInk ? "Signed" : "Sign above using your mouse or finger."}
                </p>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={clear}
                    disabled={disabled || !hasInk}
                    className="gap-1.5 text-xs"
                >
                    <Eraser className="h-3.5 w-3.5" />
                    Clear
                </Button>
            </div>
        </div>
    )
}
