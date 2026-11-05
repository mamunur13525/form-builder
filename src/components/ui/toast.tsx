import * as React from "react"
import { Toast as ToastPrimitive } from "@base-ui/react/toast"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { BellIcon, CheckIcon, Loader2Icon, TriangleAlertIcon, XIcon } from "lucide-react"

const toast = ToastPrimitive.createToastManager()

/* -------------------------------------------------------------------------
 * Status accents
 *
 * Toasts are status communication, so — unlike the rest of the editorial
 * chrome, which is deliberately monochrome — they use their own fixed status
 * hues (green / blue / amber / red / neutral grey) matching the reference
 * design. Each accent re-points two custom properties. Everything downstream
 * (icon disc, hairline border, progress meter) reads from them, so a new
 * status only needs one entry here. Card tint and border mix each hue with
 * the theme-aware `--card`, so the design holds in light and dark themes.
 * ---------------------------------------------------------------------- */

type ToastAccent = {
  /** Saturated line colour: icon disc + progress meter + border mix. */
  accent: string
}

const TOAST_ACCENTS: Record<string, ToastAccent> = {
  success: { accent: "#22c55e" },
  info: { accent: "#3b82f6" },
  warning: { accent: "#f59e0b" },
  error: { accent: "#ef4444" },
  loading: { accent: "var(--primary)" },
}

const NEUTRAL_ACCENT: ToastAccent = {
  accent: "#9ca3af",
}

function getAccent(type: string | undefined): ToastAccent {
  return (type && TOAST_ACCENTS[type]) || NEUTRAL_ACCENT
}

function accentStyle(accent: ToastAccent): React.CSSProperties {
  return {
    "--toast-accent": accent.accent,
    "--toast-accent-border": `color-mix(in oklab, ${accent.accent} 45%, transparent)`,
  } as React.CSSProperties
}

/**
 * Keyframes for the auto-dismiss meter. Kept next to the component instead of
 * in `index.css` so the toast ships as one self-contained unit.
 */
const TOAST_STYLES = `
@keyframes editorial-toast-meter { from { transform: scaleX(1); } to { transform: scaleX(0); } }
@media (prefers-reduced-motion: reduce) {
  [data-slot="toast-meter-fill"] { animation: none !important; transform: scaleX(1); }
}
`

/* ---------------------------------------------------------------------- */

function ToastProvider({ ...props }: ToastPrimitive.Provider.Props) {
  return <ToastPrimitive.Provider {...props} />
}

function ToastPortal({ ...props }: ToastPrimitive.Portal.Props) {
  return <ToastPrimitive.Portal data-slot="toast-portal" {...props} />
}

function ToastViewport({ className, ...props }: ToastPrimitive.Viewport.Props) {
  return (
    <ToastPrimitive.Viewport
      data-slot="toast-viewport"
      className={cn(
        // Toasts are portalled out of the app subtree, so they opt into the
        // editorial palette here, exactly like dialogs and popovers do.
        // One layer above every portalled overlay (sheets, dialogs and drawers
        // share `z-50`): with equal z-indexes, DOM order would let a sheet's
        // portal paint over these toasts.
        // Top-middle: centred below the top edge at every breakpoint.
        "editorial pointer-events-none fixed top-4 left-1/2 z-[60] w-[calc(100vw-2rem)] max-w-[420px] -translate-x-1/2 outline-none sm:top-6",
        className
      )}
      {...props}
    />
  )
}

function Toast({ className, ...props }: ToastPrimitive.Root.Props) {
  return (
    <ToastPrimitive.Root
      data-slot="toast"
      className={cn(
        "group/toast pointer-events-auto absolute left-0 top-0 z-[calc(1000-var(--toast-index))] w-full origin-top will-change-transform outline-none select-none",
        // Surface: status-tinted card — a wash of the accent colour over the
        // card, edged with a hairline of the same hue, matching the reference
        // design (green/blue/amber/red/neutral cards).
        "rounded-2xl border border-[var(--toast-accent-border)] bg-[linear-gradient(180deg,color-mix(in_oklab,var(--toast-accent)_16%,var(--card))_0%,color-mix(in_oklab,var(--toast-accent)_7%,var(--card))_100%)] text-[var(--foreground)] shadow-[0_24px_70px_rgba(110,80,60,0.14),0_2px_8px_rgba(110,80,60,0.05)]",
        "focus-visible:border-[var(--primary)] focus-visible:ring-[3px] focus-visible:ring-[var(--editorial-primary-ring)]/45",
        // Accent fallbacks; `ToastList` overrides these per toast type.
        "[--toast-accent:var(--editorial-disabled)] [--toast-accent-border:color-mix(in_oklab,var(--editorial-disabled)_45%,transparent)]",
        // Stacking + swipe mechanics. Top-anchored mirror of the Base UI
        // choreography: collapsed toasts peek *downward* behind the frontmost,
        // the expanded stack grows downward, entry/exit slide vertically
        // through the top edge.
        "[--gap:0.75rem] [--height:var(--toast-frontmost-height,var(--toast-height))] [--offset-y:calc(var(--toast-offset-y)+calc(var(--toast-index)*var(--gap))+var(--toast-swipe-movement-y))] [--peek:0.75rem] [--scale:calc(max(0,1-(var(--toast-index)*0.1)))] [--shrink:calc(1-var(--scale))]",
        "h-(--height) [transform:translateX(var(--toast-swipe-movement-x))_translateY(calc(var(--toast-swipe-movement-y)+(var(--toast-index)*var(--peek))+(var(--shrink)*var(--height))))_scale(var(--scale))] [transition:transform_500ms_cubic-bezier(0.22,1,0.36,1),opacity_500ms,height_150ms]",
        "after:absolute after:bottom-full after:left-0 after:h-[calc(var(--gap)+1px)] after:w-full after:content-['']",
        "data-expanded:h-(--toast-height) data-expanded:[transform:translateX(var(--toast-swipe-movement-x))_translateY(var(--offset-y))]",
        "data-limited:opacity-0 data-starting-style:[transform:translateY(-150%)]",
        "[&[data-ending-style]:not([data-limited]):not([data-swipe-direction])]:[transform:translateY(-150%)]",
        "data-ending-style:data-[swipe-direction=down]:[transform:translateY(calc(var(--toast-swipe-movement-y)+150%))]",
        "data-ending-style:data-[swipe-direction=left]:[transform:translateX(calc(var(--toast-swipe-movement-x)-150%))_translateY(var(--offset-y))]",
        "data-ending-style:data-[swipe-direction=right]:[transform:translateX(calc(var(--toast-swipe-movement-x)+150%))_translateY(var(--offset-y))]",
        "data-ending-style:data-[swipe-direction=up]:[transform:translateY(calc(var(--toast-swipe-movement-y)-150%))]",
        "data-expanded:data-ending-style:data-[swipe-direction=down]:[transform:translateY(calc(var(--toast-swipe-movement-y)+150%))]",
        "data-expanded:data-ending-style:data-[swipe-direction=left]:[transform:translateX(calc(var(--toast-swipe-movement-x)-150%))_translateY(var(--offset-y))]",
        "data-expanded:data-ending-style:data-[swipe-direction=right]:[transform:translateX(calc(var(--toast-swipe-movement-x)+150%))_translateY(var(--offset-y))]",
        "data-expanded:data-ending-style:data-[swipe-direction=up]:[transform:translateY(calc(var(--toast-swipe-movement-y)-150%))]",
        className
      )}
      {...props}
    />
  )
}

function ToastContent({ className, ...props }: ToastPrimitive.Content.Props) {
  return (
    <ToastPrimitive.Content
      data-slot="toast-content"
      className={cn(
        "relative flex h-full items-start gap-4 overflow-hidden rounded-[inherit] py-4 pl-4 pr-12 transition-opacity duration-250 ease-[cubic-bezier(0.22,1,0.36,1)] data-behind:opacity-0 data-expanded:opacity-100",
        className
      )}
      {...props}
    />
  )
}

function ToastTitle({ className, ...props }: ToastPrimitive.Title.Props) {
  return (
    <ToastPrimitive.Title
      data-slot="toast-title"
      className={cn(
        "text-base leading-6 font-bold tracking-[-0.01em] text-[var(--foreground)]",
        className
      )}
      {...props}
    />
  )
}

function ToastDescription({
  className,
  ...props
}: ToastPrimitive.Description.Props) {
  return (
    <ToastPrimitive.Description
      data-slot="toast-description"
      className={cn(
        "text-[13px] leading-5 text-[color-mix(in_oklab,var(--foreground)_72%,transparent)]",
        className
      )}
      {...props}
    />
  )
}

function ToastAction({
  className,
  render = <Button variant="outline" size="sm" />,
  ...props
}: ToastPrimitive.Action.Props) {
  return (
    <ToastPrimitive.Action
      data-slot="toast-action"
      render={render}
      className={cn(
        "editorial-transition mt-1 h-10 w-fit rounded-[14px] border-[var(--border)] bg-[var(--card)] px-4 text-[13px] font-medium text-[var(--foreground)] hover:-translate-y-0.5 hover:border-[var(--editorial-primary-ring)] hover:bg-[var(--editorial-primary-light)] hover:text-[var(--foreground)] active:translate-y-0 active:scale-[.98]",
        className
      )}
      {...props}
    />
  )
}

function ToastClose({
  className,
  children,
  render = <Button variant="ghost" size="icon-sm" />,
  ...props
}: ToastPrimitive.Close.Props) {
  return (
    <ToastPrimitive.Close
      data-slot="toast-close"
      aria-label="Close toast"
      render={render}
      className={cn(
        "editorial-transition absolute top-2.5 right-2.5 flex size-8 items-center justify-center rounded-full text-[color-mix(in_oklab,var(--foreground)_55%,transparent)] hover:bg-[color-mix(in_oklab,var(--foreground)_10%,transparent)] hover:text-[var(--foreground)] focus-visible:text-[var(--foreground)] active:scale-[.98] [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      {children ?? <XIcon aria-hidden="true" />}
    </ToastPrimitive.Close>
  )
}

/**
 * Bare "i" glyph: lucide's `Info` draws its own circle, which would ring
 * inside the filled status disc, so the dot and stem are drawn directly.
 */
function InfoGlyph() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="size-5"
    >
      <path d="M12 8h.01" />
      <path d="M12 16v-4.5" />
    </svg>
  )
}

/**
 * Solid status disc with a white glyph, matching the reference design:
 * check / i / alert triangle / x / bell on a filled circle of the accent
 * colour.
 */
function ToastIcon({ type }: { type: string | undefined }) {
  let icon: React.ReactNode

  if (type === "success") {
    icon = <CheckIcon aria-hidden="true" />
  } else if (type === "info") {
    icon = <InfoGlyph />
  } else if (type === "warning") {
    icon = <TriangleAlertIcon aria-hidden="true" />
  } else if (type === "error") {
    icon = <XIcon aria-hidden="true" />
  } else if (type === "loading") {
    icon = <Loader2Icon className="animate-spin" aria-hidden="true" />
  } else {
    // Neutral "update"-style toast.
    icon = <BellIcon aria-hidden="true" />
  }

  return (
    <span
      data-slot="toast-icon"
      className="mt-0.5 flex size-11 shrink-0 items-center justify-center rounded-full bg-(--toast-accent) text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.28)] [&_svg:not([class*='size-'])]:size-5"
    >
      {icon}
    </span>
  )
}

/**
 * Auto-dismiss meter: the accent bar drains right-to-left over a faded
 * full-width track. Pauses while the stack is hovered, like the timer does.
 */
function ToastMeter({ timeout }: { timeout: number | undefined }) {
  const duration = timeout ?? 5000

  if (!duration) {
    return null
  }

  return (
    <span
      aria-hidden="true"
      data-slot="toast-meter"
      className="pointer-events-none absolute inset-x-0 top-0 h-[5px] bg-[color-mix(in_oklab,var(--toast-accent)_24%,transparent)]"
    >
      <span
        data-slot="toast-meter-fill"
        className="block h-full origin-left bg-(--toast-accent) [animation:editorial-toast-meter_var(--toast-duration)_linear_forwards] group-hover/toast:[animation-play-state:paused] group-data-expanded/toast:[animation-play-state:paused]"
        style={{ "--toast-duration": `${duration}ms` } as React.CSSProperties}
      />
    </span>
  )
}

function ToastList() {
  const { toasts } = ToastPrimitive.useToastManager()

  return toasts.map((toastItem) => {
    const accent = getAccent(toastItem.type)

    return (
      <Toast key={toastItem.id} toast={toastItem} style={accentStyle(accent)}>
        <ToastContent>
          <ToastIcon type={toastItem.type} />

          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <ToastTitle />
            <ToastDescription />
            <ToastAction />
          </div>

          <ToastClose />
          <ToastMeter timeout={toastItem.timeout} />
        </ToastContent>
      </Toast>
    )
  })
}

function Toaster({
  children,
  toastManager = toast,
  ...props
}: ToastPrimitive.Provider.Props) {
  return (
    <ToastProvider toastManager={toastManager} {...props}>
      {children}
      <ToastPortal>
        <style>{TOAST_STYLES}</style>
        <ToastViewport>
          <ToastList />
        </ToastViewport>
      </ToastPortal>
    </ToastProvider>
  )
}

const createToastManager = ToastPrimitive.createToastManager
const useToastManager = ToastPrimitive.useToastManager

export {
  Toaster,
  Toast,
  ToastAction,
  ToastClose,
  ToastContent,
  ToastDescription,
  ToastIcon,
  ToastMeter,
  ToastPortal,
  ToastProvider,
  ToastTitle,
  ToastViewport,
  createToastManager,
  toast,
  useToastManager,
}
