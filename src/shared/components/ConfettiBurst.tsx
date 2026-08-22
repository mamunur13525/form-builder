import { useMemo } from "react"
import { motion } from "framer-motion"

interface ConfettiBurstProps {
    /** Number of confetti pieces. */
    count?: number
    /** Palette to pick from; falls back to a festive default set. */
    colors?: string[]
    /**
     * Where the burst originates, as CSS positions within the layer.
     * Defaults to the centre.
     */
    originX?: string
    originY?: string
}

const DEFAULT_COLORS = [
    "#22c55e",
    "#3b82f6",
    "#f59e0b",
    "#ef4444",
    "#a855f7",
    "#ec4899",
    "#14b8a6",
]

/**
 * A dependency-free confetti *explosion* built on framer-motion. Pieces erupt
 * from a single point in every direction, then arc downward under a little
 * gravity and fade out — once, on mount. Purely decorative and
 * non-interactive (`pointer-events-none`).
 */
export function ConfettiBurst({
    count = 120,
    colors = DEFAULT_COLORS,
    originX = "50%",
    originY = "50%",
}: ConfettiBurstProps) {
    // Randomize each piece once so re-renders don't reshuffle the animation.
    const pieces = useMemo(
        () =>
            Array.from({ length: count }, (_, i) => {
                // A random direction on the full circle, with a random speed —
                // together these scatter the pieces outward from the origin.
                const angle = Math.random() * Math.PI * 2
                const distance = 90 + Math.random() * 320
                const size = 7 + Math.random() * 8
                const burstY = Math.sin(angle) * distance
                return {
                    id: i,
                    size,
                    color: colors[i % colors.length],
                    burstX: Math.cos(angle) * distance,
                    // Damp upward travel so a top-origin burst keeps most of its
                    // spread in view rather than flying off the top edge.
                    burstY: burstY < 0 ? burstY * 0.45 : burstY,
                    // How far the piece keeps falling after the outward burst.
                    gravity: 160 + Math.random() * 260,
                    delay: Math.random() * 0.08,
                    duration: 1.5 + Math.random() * 1.1,
                    rotate: (Math.random() - 0.5) * 900,
                    rounded: Math.random() > 0.5,
                }
            }),
        [count, colors],
    )

    return (
        <div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-30 overflow-hidden"
        >
            {pieces.map((p) => (
                <motion.span
                    key={p.id}
                    initial={{ x: 0, y: 0, opacity: 1, scale: 0.2, rotate: 0 }}
                    animate={{
                        // Erupt outward by ~45% of the timeline, then let
                        // gravity carry the piece down as it fades.
                        x: [0, p.burstX, p.burstX * 1.08],
                        y: [0, p.burstY, p.burstY + p.gravity],
                        opacity: [1, 1, 0],
                        scale: [0.2, 1, 0.85],
                        rotate: [0, p.rotate * 0.5, p.rotate],
                    }}
                    transition={{
                        duration: p.duration,
                        delay: p.delay,
                        ease: "easeOut",
                        times: [0, 0.45, 1],
                    }}
                    style={{
                        position: "absolute",
                        top: originY,
                        left: originX,
                        width: p.size,
                        height: p.size * 0.6,
                        // Centre each piece on the origin point.
                        marginLeft: -p.size / 2,
                        marginTop: -p.size * 0.3,
                        backgroundColor: p.color,
                        borderRadius: p.rounded ? "9999px" : "2px",
                    }}
                />
            ))}
        </div>
    )
}
