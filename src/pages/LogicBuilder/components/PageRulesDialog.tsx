import { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Workflow } from "lucide-react";
import { Button } from "../../../components/ui/button";
import {
  FIELD_TYPE_ICONS,
  FIELD_TYPE_LABELS,
} from "../../../shared/constants/form-types";
import type { FormField, LogicRule } from "../../../shared/types/common";

interface PageRulesDialogProps {
  /** The page whose rules are being configured, or null when closed. */
  page: FormField | null;
  /** Zero-based index of the page, used for the page-number label. */
  pageIndex: number | null;
  /**
   * Explicit close handler. This is the ONLY way the dialog closes — there is
   * deliberately no backdrop-click or Escape dismissal (see the overlay below).
   */
  onClose: () => void;
}

const OPERATOR_LABELS: Record<LogicRule["operator"], string> = {
  equals: "is equal to",
  notEquals: "is not equal to",
  contains: "contains",
  greaterThan: "is greater than",
  lessThan: "is less than",
};

const ACTION_LABELS: Record<LogicRule["action"], string> = {
  show: "Show this page",
  hide: "Hide this page",
  goToField: "Jump to page",
  goToEnd: "Jump to end",
};

function formatValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "(empty)";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function PageRulesDialogComponent({
  page,
  pageIndex,
  onClose,
}: PageRulesDialogProps) {
  const open = page !== null && pageIndex !== null;
  const TypeIcon = page ? FIELD_TYPE_ICONS[page.type] : Workflow;
  const rules = page?.logic ?? [];

  return (
    <AnimatePresence>
      {open && page && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label={`Rules for page ${pageIndex! + 1}`}
        >
          {/*
            Backdrop. Intentionally NOT clickable: the spec requires that
            clicking outside the dialog does not dismiss it. Rendering the
            overlay with no onClick handler disables outside-click dismissal.
          */}
          <motion.div
            className="fixed inset-0 bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />

          <motion.div
            className="editorial relative z-50 flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-[0_24px_60px_rgba(0,0,0,0.18)]"
            initial={{ opacity: 0, scale: 0.96, y: -12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-3 border-b border-[var(--editorial-border-light)] px-6 py-5">
              <div className="flex min-w-0 flex-col gap-1">
                <span className="editorial-eyebrow text-[var(--editorial-subtle)]">
                  Page {String(pageIndex! + 1).padStart(2, "0")} · Rules
                </span>
                <h2 className="truncate font-display text-xl text-[var(--foreground)]">
                  {page.label || "Untitled page"}
                </h2>
                <span className="mt-0.5 inline-flex w-fit items-center gap-1 rounded-md border border-[var(--border)] bg-[var(--secondary)] px-1.5 py-0.5 text-[11px] font-medium text-[var(--editorial-body)]">
                  <TypeIcon className="h-3 w-3 shrink-0" />
                  {FIELD_TYPE_LABELS[page.type]}
                </span>
              </div>
              <button
                type="button"
                aria-label="Close"
                onClick={onClose}
                className="editorial-transition flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[var(--editorial-subtle)] hover:bg-[var(--secondary)] hover:text-[var(--foreground)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Body */}
            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
              <p className="mb-4 text-[13px] leading-relaxed text-[var(--editorial-body)]">
                Define conditional logic that controls when this page is shown
                or where the form jumps next.
              </p>

              {rules.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-[var(--border)] bg-[var(--secondary)] px-6 py-10 text-center">
                  <Workflow className="h-6 w-6 text-[var(--editorial-subtle)]" />
                  <p className="text-sm font-medium text-[var(--foreground)]">
                    No rules yet
                  </p>
                  <p className="max-w-xs text-[13px] leading-snug text-[var(--editorial-subtle)]">
                    This page always appears in order. Add a rule to make it
                    conditional.
                  </p>
                </div>
              ) : (
                <ul className="flex flex-col gap-2">
                  {rules.map((rule, i) => (
                    <li
                      key={i}
                      className="rounded-xl border border-[var(--border)] bg-[var(--secondary)] px-4 py-3 text-[13px] leading-relaxed text-[var(--foreground)]"
                    >
                      <span className="text-[var(--editorial-subtle)]">
                        When
                      </span>{" "}
                      <span className="font-medium">{rule.whenFieldKey}</span>{" "}
                      <span className="text-[var(--editorial-subtle)]">
                        {OPERATOR_LABELS[rule.operator]}
                      </span>{" "}
                      <span className="font-medium">
                        {formatValue(rule.value)}
                      </span>
                      <span className="text-[var(--editorial-subtle)]"> → </span>
                      <span className="font-medium text-[var(--primary)]">
                        {ACTION_LABELS[rule.action]}
                        {rule.targetFieldKey ? ` (${rule.targetFieldKey})` : ""}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Footer — the only exits from this dialog. */}
            <div className="flex justify-end gap-2 border-t border-[var(--editorial-border-light)] px-6 py-4">
              <Button variant="outline" size="sm" onClick={onClose}>
                Cancel
              </Button>
              <Button size="sm" onClick={onClose}>
                Close
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export const PageRulesDialog = memo(PageRulesDialogComponent);
