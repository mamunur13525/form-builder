/**
 * Non-visual confirmation for blocked interactions, e.g. clicking outside the
 * design drawer while it still holds unsaved changes.
 *
 * Mirrors the two-stage visual nudge (Cancel, then Save): the second chirp and
 * the second half of the buzz land ~300ms after the first. Every step is
 * best-effort and fails silently — unsupported browsers and devices simply
 * skip it, so UX never depends on this feedback firing.
 */

/** Lazily created and reused: browsers cap the number of live contexts. */
let audioContext: AudioContext | null = null

function getAudioContext(): AudioContext | null {
    try {
        if (!audioContext) {
            const AudioCtor =
                window.AudioContext ??
                (window as unknown as { webkitAudioContext?: typeof AudioContext })
                    .webkitAudioContext
            if (!AudioCtor) return null
            audioContext = new AudioCtor()
        }
        // An outside click counts as a user gesture, so resume is granted.
        if (audioContext.state === "suspended") void audioContext.resume()
        return audioContext
    } catch {
        return null
    }
}

/** One short downward chirp, starting `delayMs` from now. */
function playChirp(delayMs = 0) {
    const ctx = getAudioContext()
    if (!ctx) return

    try {
        const startAt = ctx.currentTime + delayMs / 1000
        const oscillator = ctx.createOscillator()
        const gain = ctx.createGain()

        oscillator.type = "sine"
        oscillator.frequency.setValueAtTime(340, startAt)
        oscillator.frequency.exponentialRampToValueAtTime(180, startAt + 0.16)

        gain.gain.setValueAtTime(0.0001, startAt)
        gain.gain.exponentialRampToValueAtTime(0.07, startAt + 0.02)
        gain.gain.exponentialRampToValueAtTime(0.0001, startAt + 0.18)

        oscillator.connect(gain)
        gain.connect(ctx.destination)
        oscillator.start(startAt)
        oscillator.stop(startAt + 0.2)
    } catch {
        // Sound is a nice-to-have, not a requirement.
    }
}

/** Haptic buzz, where the platform supports Vibration API. */
function vibrateDevice(pattern: number[]) {
    try {
        if (typeof navigator.vibrate === "function") {
            navigator.vibrate(pattern)
        }
    } catch {
        // Haptics exist only on supporting devices.
    }
}

/** Beep + device vibration accompanying an ignored interaction attempt. */
export function playNudgeFeedback() {
    playChirp()
    window.setTimeout(() => playChirp(), 300)
    vibrateDevice([90, 210, 90])
}