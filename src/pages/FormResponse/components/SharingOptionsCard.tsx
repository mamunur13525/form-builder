import { useState } from "react"
import { Check, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"

const STORAGE_PREFIX = "summary-share:"

/**
 * Sharing options beside the report: reveal a link and print the report as PDF.
 * `shortcut:` the toggle is stored per browser, not on the server, because the
 * summary endpoint is authenticated — add a public summary route to share it.
 */
export function SharingOptionsCard({ formId }: { formId: string }) {
    const [enabled, setEnabled] = useState(() => {
        try {
            return localStorage.getItem(STORAGE_PREFIX + formId) === "true"
        } catch {
            return false
        }
    })
    const [copied, setCopied] = useState(false)
    const url = `${window.location.origin}/form-response/${formId}/summary`

    const toggle = (checked: boolean) => {
        setEnabled(checked)
        try {
            localStorage.setItem(STORAGE_PREFIX + formId, String(checked))
        } catch {
            // Private mode: the toggle still works for this visit.
        }
    }

    const copy = async () => {
        try {
            await navigator.clipboard.writeText(url)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch {
            // Clipboard unavailable: the input is selectable instead.
        }
    }

    return (
        <section className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)] dark:border-zinc-800 dark:bg-[#18181c] print:hidden">
            <h2 className="text-base font-semibold text-slate-900 dark:text-zinc-100">
                Sharing Options
            </h2>

            <div className="mt-4 flex items-center justify-between gap-4 rounded-lg bg-slate-100 px-4 py-3 dark:bg-zinc-800/60">
                <span className="text-sm font-medium text-slate-800 dark:text-zinc-200">
                    Enable Link Sharing
                </span>
                <Switch
                    checked={enabled}
                    onCheckedChange={(checked) => toggle(Boolean(checked))}
                    aria-label="Enable link sharing"
                />
            </div>

            <p className="mt-3 text-xs leading-5 text-slate-500 dark:text-zinc-400">
                Link sharing lets you share the summary report with anyone who can open this
                form. The report updates in real-time with new responses.
            </p>

            {enabled && (
                <div className="mt-3 flex items-center gap-2">
                    <Input
                        readOnly
                        value={url}
                        aria-label="Shareable summary link"
                        onFocus={(event) => event.currentTarget.select()}
                        className="h-9 text-xs"
                    />
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={copy}
                        aria-label={copied ? "Link copied" : "Copy link"}
                        className="h-9 w-9 shrink-0"
                    >
                        {copied ? (
                            <Check className="h-4 w-4" />
                        ) : (
                            <Copy className="h-4 w-4" />
                        )}
                    </Button>
                </div>
            )}

            <Button
                type="button"
                onClick={() => window.print()}
                className="mt-4 w-full bg-slate-700 text-white hover:bg-slate-800 dark:bg-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-600"
            >
                Download PDF Report
            </Button>
        </section>
    )
}
