import * as React from "react"
import { Toast as ToastPrimitive } from "@base-ui/react/toast"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  BellIcon,
  CheckIcon,
  InfoIcon,
  Loader2Icon,
  TriangleAlertIcon,
  XIcon,
} from "lucide-react"

const toast = ToastPrimitive.createToastManager()

/* -------------------------------------------------------------------------
 * Status accents
 *
 * Toasts stay visually quiet — a neutral card with one accent colour used
 * for the small icon bubble and a low-opacity border in the same hue. Each
 * status only needs one entry here, so adding a new one is a one-liner.
 * Card, text and type all come from the theme tokens, so light and dark
 * keep working automatically.
 * ---------------------------------------------------------------------- */

const TOAST_ACCENTS: Record<string, string> = {
  success: "#10b981",
  info: "#3b82f6",
  warning: "#f59e0b",
  error: "#ef4444",
  loading: "#FF5722",
}

const NEUTRAL_ACCENT = "#64748b"

function getAccent(type: string | undefined): string {
  return (type && TOAST_ACCENTS[type]) || NEUTRAL_ACCENT
}

function accentStyle(accent: string): React.CSSProperties {
  return {
    "--toast-accent": accent,
    "--toast-accent-border": `color-mix(in oklab, ${accent} 35%, transparent)`,
  } as React.CSSProperties
}

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
        // Bottom-right: the stack grows upward from the corner.
        "editorial pointer-events-none fixed right-4 bottom-4 z-[60] w-[calc(100vw-2rem)] max-w-[380px] outline-none sm:right-6 sm:bottom-6",
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
        // Surface: a clean card — neutral background, soft status-tinted
        // border, gentle lift. No gradient or background wash.
        "rounded-xl border border-[color:var(--toast-accent-border)] bg-popover text-popover-foreground shadow-[0_10px_30px_-6px_rgba(15,23,42,0.12),0_2px_8px_-2px_rgba(15,23,42,0.06)]",
        "focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30",
        // Accent fallback; `ToastList` overrides it per toast type.
        "[--toast-accent:#64748b] [--toast-accent-border:color-mix(in_oklab,#64748b_35%,transparent)]",
        // Stacking + swipe mechanics, anchored bottom-right. Collapsed toasts
        // peek *upward* behind the frontmost; the expanded stack grows upward;
        // entry/exit slide vertically through the bottom edge.
        "[--gap:0.75rem] [--height:var(--toast-frontmost-height,var(--toast-height))] [--offset-y:calc(var(--toast-offset-y)*-1+calc(var(--toast-index)*var(--gap)*-1)+var(--toast-swipe-movement-y))] [--peek:0.75rem] [--scale:calc(max(0,1-(var(--toast-index)*0.1)))] [--shrink:calc(1-var(--scale))]",
        "h-(--height) [transform:translateX(var(--toast-swipe-movement-x))_translateY(calc(var(--toast-swipe-movement-y)-(var(--toast-index)*var(--peek))-(var(--shrink)*var(--height))))_scale(var(--scale))] [transition:transform_400ms_cubic-bezier(0.22,1,0.36,1),opacity_400ms,height_150ms]",
        "after:absolute after:top-full after:left-0 after:h-[calc(var(--gap)+1px)] after:w-full after:content-['']",
        "data-expanded:h-(--toast-height) data-expanded:[transform:translateX(var(--toast-swipe-movement-x))_translateY(calc(var(--offset-y)))]",
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
        "relative flex items-start gap-3 overflow-hidden rounded-[inherit] py-3.5 pr-11 pl-4 transition-opacity duration-250 ease-[cubic-bezier(0.22,1,0.36,1)] data-behind:opacity-0 data-expanded:opacity-100",
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
        "text-sm leading-5 font-semibold tracking-[-0.01em] text-popover-foreground",
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
        "text-[13px] leading-5 text-muted-foreground",
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
        "editorial-transition mt-2 h-8 w-fit rounded-md px-3 text-xs font-medium",
        className
      )}
      {...props}
    />
  )
}

function ToastClose({
  className,
  children,
  ...props
}: ToastPrimitive.Close.Props) {
  return (
    <ToastPrimitive.Close
      data-slot="toast-close"
      aria-label="Close toast"
      className={cn(
        "absolute top-2 right-2 flex size-7 cursor-pointer items-center justify-center rounded-md text-muted-foreground/70 transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:outline-none active:scale-[.98] [&_svg]:size-3.5",
        className
      )}
      {...props}
    >
      {children ?? <XIcon aria-hidden="true" />}
    </ToastPrimitive.Close>
  )
}

function ToastIcon({ type }: { type: string | undefined }) {
  let icon: React.ReactNode

  if (type === "success") {
    icon = <CheckIcon aria-hidden="true" />
  } else if (type === "info") {
    icon = <InfoIcon aria-hidden="true" />
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
      className="mt-px flex size-8 shrink-0 items-center justify-center rounded-full bg-[color-mix(in_oklab,var(--toast-accent)_12%,transparent)] text-[var(--toast-accent)] dark:bg-[color-mix(in_oklab,var(--toast-accent)_20%,transparent)] [&_svg]:size-4"
    >
      {icon}
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

          <div className="flex min-w-0 flex-1 flex-col">
            <ToastTitle />
            <ToastDescription />
            <ToastAction />
          </div>

          <ToastClose />
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
  ToastPortal,
  ToastProvider,
  ToastTitle,
  ToastViewport,
  createToastManager,
  toast,
  useToastManager,
}
