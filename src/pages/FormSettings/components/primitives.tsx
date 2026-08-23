import type { ReactNode } from "react"
import { Switch } from "../../../components/ui/switch"

/**
 * Shared layout primitives for the form-settings sections. They keep every
 * section visually consistent — a titled card, evenly divided rows, and a
 * standard label + control arrangement — so individual sections only describe
 * *what* to configure, not *how* it looks.
 *
 * This file is design-only: controls are uncontrolled/local at the call site
 * and nothing here talks to an API.
 */

/** A titled panel: heading + optional description, then a divided body of rows. */
export function SettingsSection({
    title,
    description,
    children,
}: {
    title: string
    description?: string
    children: ReactNode
}) {
    return (
        <section className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
            <header className="border-b border-[var(--editorial-border-light)] px-5 py-4">
                <h2 className="text-[15px] font-semibold text-[var(--foreground)]">
                    {title}
                </h2>
                {description && (
                    <p className="mt-1 text-[13px] leading-snug text-[var(--muted-foreground)]">
                        {description}
                    </p>
                )}
            </header>
            <div className="divide-y divide-[var(--editorial-border-light)]">
                {children}
            </div>
        </section>
    )
}

/**
 * A single setting row: label (+ description) on the left, an optional control
 * on the right, and optional expanded content underneath (e.g. a nested input
 * revealed when a toggle is on).
 */
export function SettingRow({
    label,
    description,
    htmlFor,
    control,
    children,
}: {
    label: string
    description?: string
    htmlFor?: string
    control?: ReactNode
    children?: ReactNode
}) {
    return (
        <div className="px-5 py-4">
            <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                    <label
                        htmlFor={htmlFor}
                        className="block text-sm font-medium text-[var(--foreground)]"
                    >
                        {label}
                    </label>
                    {description && (
                        <p className="mt-1 text-[13px] leading-snug text-[var(--muted-foreground)]">
                            {description}
                        </p>
                    )}
                </div>
                {control && <div className="shrink-0 pt-0.5">{control}</div>}
            </div>
            {children && <div className="mt-4">{children}</div>}
        </div>
    )
}

/** A setting row whose control is a Switch; children render only when checked. */
export function ToggleRow({
    label,
    description,
    checked,
    onCheckedChange,
    children,
    htmlFor,
}: {
    label: string
    description?: string
    checked: boolean
    onCheckedChange: (checked: boolean) => void
    children?: ReactNode
    /** Associates the label with the Switch control so click-to-toggle works. */
    htmlFor?: string
}) {
    return (
        <SettingRow
            label={label}
            description={description}
            htmlFor={htmlFor}
            control={
                <Switch
                    id={htmlFor || undefined}
                    checked={checked}
                    onCheckedChange={onCheckedChange}
                />
            }
        >
            {checked && children ? <NestedPanel>{children}</NestedPanel> : null}
        </SettingRow>
    )
}

/**
 * An inset container for fields that belong to the row above (revealed by a
 * toggle or radio). The left accent border ties it visually to its parent.
 */
export function NestedPanel({ children }: { children: ReactNode }) {
    return (
        <div className="rounded-xl border border-[var(--border)] border-l-2 border-l-[var(--editorial-primary-ring)] bg-[var(--secondary)] px-4 py-4">
            {children}
        </div>
    )
}

/** A small caption label used above inputs inside nested panels. */
export function FieldLabel({
    htmlFor,
    children,
}: {
    htmlFor?: string
    children: ReactNode
}) {
    return (
        <label
            htmlFor={htmlFor}
            className="mb-1.5 block text-xs font-medium text-[var(--editorial-body)]"
        >
            {children}
        </label>
    )
}
