import * as React from "react"
import { Toast as ToastPrimitive } from "@base-ui/react/toast"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { XIcon, CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

const toast = ToastPrimitive.createToastManager()

/* -------------------------------------------------------------------------
 * Editorial status accents
 *
 * Every toast type re-points four custom properties. Everything downstream
 * (icon chip, eyebrow, rail, progress bar) reads from them, so a new status
 * only needs one entry here. Colours are mixed from the palette in
 * `index.css` so the toast never introduces an off-theme hue.
 * ---------------------------------------------------------------------- */

type ToastAccent = {
  /** Saturated line colour: rail + progress bar. */
  accent: string
  /** Darkened variant that stays legible on the warm canvas. */
  ink: string
  /** Tint used behind the icon and as the top of the card wash. */
  soft: string
  /** Small uppercase label above the title. */
  eyebrow: string
}

const TOAST_ACCENTS: Record<string, ToastAccent> = {
  success: {
    accent: "var(--editorial-success)",
    ink: "color-mix(in oklab, var(--editorial-success) 58%, var(--foreground))",
    soft: "color-mix(in oklab, var(--editorial-success) 20%, var(--card))",
    eyebrow: "Success",
  },
  error: {
    accent: "var(--destructive)",
    ink: "var(--destructive)",
    soft: "color-mix(in oklab, var(--destructive) 12%, var(--card))",
    eyebrow: "Something went wrong",
  },
  warning: {
    accent: "color-mix(in oklab, var(--editorial-note) 45%, #6b6b6b)",
    ink: "color-mix(in oklab, #6b6b6b 68%, var(--foreground))",
    soft: "color-mix(in oklab, var(--editorial-note) 55%, var(--card))",
    eyebrow: "Heads up",
  },
  info: {
    accent: "var(--editorial-blue)",
    ink: "color-mix(in oklab, var(--editorial-blue) 58%, var(--foreground))",
    soft: "color-mix(in oklab, var(--editorial-blue) 16%, var(--card))",
    eyebrow: "Note",
  },
  loading: {
    accent: "var(--primary)",
    ink: "var(--primary)",
    soft: "var(--editorial-primary-light)",
    eyebrow: "Working",
  },
}

const NEUTRAL_ACCENT: ToastAccent = {
  accent: "var(--editorial-disabled)",
  ink: "var(--editorial-body)",
  soft: "var(--secondary)",
  eyebrow: "",
}

function getAccent(type: string | undefined): ToastAccent {
  return (type && TOAST_ACCENTS[type]) || NEUTRAL_ACCENT
}

function accentStyle(accent: ToastAccent): React.CSSProperties {
  return {
    "--toast-accent": accent.accent,
    "--toast-accent-ink": accent.ink,
    "--toast-accent-soft": accent.soft,
  } as React.CSSProperties
}

/**
 * Keyframes for the auto-dismiss meter. Kept next to the component instead of
 * in `index.css` so the toast ships as one self-contained unit.
 */
const TOAST_STYLES = `
@keyframes editorial-toast-meter { from { transform: scaleX(1); } to { transform: scaleX(0); } }
@media (prefers-reduced-motion: reduce) {
  [data-slot="toast-meter"] { animation: none !important; transform: scaleX(1); }
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
        "editorial pointer-events-none fixed inset-x-4 bottom-4 z-50 mx-auto w-auto max-w-[400px] outline-none sm:right-6 sm:bottom-6 sm:left-auto sm:mx-0 sm:w-full",
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
        "group/toast pointer-events-auto absolute right-0 bottom-0 z-[calc(1000-var(--toast-index))] w-full origin-bottom will-change-transform outline-none select-none",
        // Surface: warm card, generous radius, soft light-source shadow. The
        // wash carries a whisper of the status colour into the top edge.
        "rounded-[26px] border border-[var(--border)] bg-[var(--card)] bg-[linear-gradient(175deg,var(--toast-accent-soft)_0%,var(--card)_62%)] text-[var(--foreground)] shadow-[0_24px_70px_rgba(110,80,60,0.14),0_2px_8px_rgba(110,80,60,0.05)]",
        "focus-visible:border-[var(--primary)] focus-visible:ring-[3px] focus-visible:ring-[var(--editorial-primary-ring)]/45",
        // Accent fallbacks; `ToastList` overrides these per toast type.
        "[--toast-accent:var(--editorial-disabled)] [--toast-accent-ink:var(--editorial-body)] [--toast-accent-soft:var(--secondary)]",
        // Stacking + swipe mechanics (unchanged Base UI choreography).
        "[--gap:0.75rem] [--height:var(--toast-frontmost-height,var(--toast-height))] [--offset-y:calc(var(--toast-offset-y)*-1+calc(var(--toast-index)*var(--gap)*-1)+var(--toast-swipe-movement-y))] [--peek:0.75rem] [--scale:calc(max(0,1-(var(--toast-index)*0.1)))] [--shrink:calc(1-var(--scale))]",
        "h-(--height) [transform:translateX(var(--toast-swipe-movement-x))_translateY(calc(var(--toast-swipe-movement-y)-(var(--toast-index)*var(--peek))-(var(--shrink)*var(--height))))_scale(var(--scale))] [transition:transform_500ms_cubic-bezier(0.22,1,0.36,1),opacity_500ms,height_150ms]",
        "after:absolute after:top-full after:left-0 after:h-[calc(var(--gap)+1px)] after:w-full after:content-['']",
        "data-expanded:h-(--toast-height) data-expanded:[transform:translateX(var(--toast-swipe-movement-x))_translateY(var(--offset-y))]",
        "data-limited:opacity-0 data-starting-style:[transform:translateY(150%)]",
        "[&[data-ending-style]:not([data-limited]):not([data-swipe-direction])]:[transform:translateY(150%)]",
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
        "relative flex h-full items-start gap-4 overflow-hidden rounded-[inherit] py-5 pr-12 pl-5 transition-opacity duration-250 ease-[cubic-bezier(0.22,1,0.36,1)] data-behind:opacity-0 data-expanded:opacity-100",
        className
      )}
      {...props}
    />
  )
}

function ToastEyebrow({
  children,
  className,
  ...props
}: React.ComponentProps<"span">) {
  if (!children) {
    return null
  }

  return (
    <span
      data-slot="toast-eyebrow"
      className={cn("editorial-eyebrow text-(--toast-accent-ink)", className)}
      {...props}
    >
      {children}
    </span>
  )
}

function ToastTitle({ className, ...props }: ToastPrimitive.Title.Props) {
  return (
    <ToastPrimitive.Title
      data-slot="toast-title"
      className={cn(
        "text-[15px] leading-6 font-medium tracking-[-0.01em] text-[var(--foreground)]",
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
      className={cn("text-[13px] leading-5 text-[var(--editorial-body)]", className)}
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
        "editorial-transition absolute top-3.5 right-3.5 size-8 rounded-full text-[var(--editorial-subtle)] opacity-0 hover:bg-[var(--secondary)] hover:text-[var(--foreground)] focus-visible:opacity-100 active:scale-[.98] group-hover/toast:opacity-100 group-data-expanded/toast:opacity-100 [&_svg:not([class*='size-'])]:size-3.5",
        className
      )}
      {...props}
    >
      {children ?? <XIcon aria-hidden="true" />}
    </ToastPrimitive.Close>
  )
}

function ToastIcon({ type }: { type: string | undefined }) {
  let icon: React.ReactNode = null

  if (type === "success") {
    icon = <CircleCheckIcon aria-hidden="true" />
  }

  if (type === "info") {
    icon = <InfoIcon aria-hidden="true" />
  }

  if (type === "warning") {
    icon = <TriangleAlertIcon aria-hidden="true" />
  }

  if (type === "error") {
    icon = <OctagonXIcon aria-hidden="true" />
  }

  if (type === "loading") {
    icon = <Loader2Icon className="animate-spin" aria-hidden="true" />
  }

  if (!icon) {
    return null
  }

  return (
    <span
      data-slot="toast-icon"
      className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-full bg-(--toast-accent-soft) text-(--toast-accent-ink) shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--toast-accent)_35%,transparent)] [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-[18px]"
    >
      {icon}
    </span>
  )
}

/** Auto-dismiss meter. Pauses while the stack is hovered, like the timer does. */
function ToastMeter({ timeout }: { timeout: number | undefined }) {
  const duration = timeout ?? 5000

  if (!duration) {
    return null
  }

  return (
    <span
      aria-hidden="true"
      data-slot="toast-meter"
      className="pointer-events-none absolute inset-x-0 bottom-0 h-[3px] origin-left bg-(--toast-accent) opacity-60 [animation:editorial-toast-meter_var(--toast-duration)_linear_forwards] group-hover/toast:[animation-play-state:paused] group-data-expanded/toast:[animation-play-state:paused]"
      style={{ "--toast-duration": `${duration}ms` } as React.CSSProperties}
    />
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

          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <ToastEyebrow>{accent.eyebrow}</ToastEyebrow>
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
  ToastEyebrow,
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
