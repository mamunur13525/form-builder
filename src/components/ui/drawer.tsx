import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "../../shared/utils/cn";

interface DrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Edge the panel slides in from. */
  side?: "left" | "right";
  title?: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Off-canvas panel used on narrow viewports to host content that lives in a
 * fixed side panel on desktop (pages list, settings).
 */
export function Drawer({
  open,
  onOpenChange,
  side = "left",
  title,
  children,
  className,
}: DrawerProps) {
  // Close on Escape so the drawer behaves like the other overlays.
  React.useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onOpenChange(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onOpenChange]);

  // Prevent the page behind the overlay from scrolling while it is open.
  React.useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  const offscreen = side === "left" ? "-100%" : "100%";

  return (
    <AnimatePresence>
      {open && (
        <div className="editorial fixed inset-0 z-50">
          <motion.div
            className="absolute inset-0 bg-black/40"
            onClick={() => onOpenChange(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className={cn(
              "absolute inset-y-0 flex w-[86vw] max-w-[360px] flex-col bg-[var(--editorial-canvas)] p-3 shadow-2xl",
              side === "left" ? "left-0" : "right-0",
              className,
            )}
            initial={{ x: offscreen }}
            animate={{ x: 0 }}
            exit={{ x: offscreen }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <div className="flex shrink-0 items-center justify-between px-2 pb-2">
              <span className="editorial-eyebrow text-[var(--editorial-subtle)]">
                {title}
              </span>
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                aria-label="Close"
                className="editorial-transition flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--card)] text-[var(--editorial-body)] hover:bg-[var(--secondary)] hover:text-[var(--foreground)] active:scale-[.98]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="min-h-0 flex-1">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
