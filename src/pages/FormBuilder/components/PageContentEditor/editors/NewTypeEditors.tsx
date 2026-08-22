import { List, Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { FormPage } from "@/shared/types/common"
import {
    AddressPage,
    MatrixPage,
    OpinionScalePage,
    SignaturePage,
    StatementPage,
    StarRatingPage,
    UploadPage,
} from "@/shared/components/pages"

interface EditorProps {
    page: FormPage
    pageIndex: number
    onUpdate: (index: number, updates: Partial<FormPage>) => void
    color?: string
    fontSizeClass?: string
}

// ---------------------------------------------------------------------------
// Statement — display-only. Label + helperText are edited by the page chrome,
// so this only previews the configured embed.
// ---------------------------------------------------------------------------

export function StatementEditor({ page }: EditorProps) {
    const settings = page.settings?.statement ?? {
        embedUrl: "",
        embedProvider: "youtube" as const,
        embedTitle: "",
    }

    if (!settings.embedUrl) {
        return (
            <p className="rounded-md border border-dashed py-6 text-center text-sm text-muted-foreground">
                Add an embed link in the settings panel to preview it here.
            </p>
        )
    }

    return <StatementPage settings={settings} />
}

// ---------------------------------------------------------------------------
// Dropdown — same option list editing as Select.
// ---------------------------------------------------------------------------

export function DropdownEditor({ page, pageIndex, onUpdate, color }: EditorProps) {
    return (
        <div className="space-y-3">
            <div className="space-y-2">
                {page.options.map((opt, optIndex) => (
                    <div key={optIndex} className="flex items-center gap-2">
                        <List className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <Input
                            value={opt.label}
                            onChange={(e) => {
                                const newOpts = [...page.options]
                                newOpts[optIndex] = {
                                    label: e.target.value,
                                    value: e.target.value.toLowerCase().replace(/\s+/g, "_"),
                                }
                                onUpdate(pageIndex, { options: newOpts })
                            }}
                            placeholder="Option label"
                            className="flex-1"
                            style={color ? { color } : undefined}
                        />
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 shrink-0"
                            onClick={() =>
                                onUpdate(pageIndex, {
                                    options: page.options.filter((_, i) => i !== optIndex),
                                })
                            }
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                ))}
            </div>
            <Button
                variant="outline"
                size="sm"
                onClick={() =>
                    onUpdate(pageIndex, {
                        options: [...page.options, { label: "", value: "" }],
                    })
                }
            >
                <Plus className="mr-2 h-4 w-4" />
                Add Option
            </Button>
        </div>
    )
}

// ---------------------------------------------------------------------------
// Address — preview of the configured sub-pages.
// ---------------------------------------------------------------------------

export function AddressEditor({ page, color, fontSizeClass }: EditorProps) {
    const pages = page.settings?.address?.pages ?? []

    if (pages.length === 0) {
        return (
            <p className="rounded-md border border-dashed py-6 text-center text-sm text-muted-foreground">
                Configure the address pages in the settings panel.
            </p>
        )
    }

    return <AddressPage pages={pages} disabled color={color} fontSizeClass={fontSizeClass} />
}

// ---------------------------------------------------------------------------
// Opinion scale — preview of the number row with labels.
// ---------------------------------------------------------------------------

export function OpinionScaleEditor({ page }: EditorProps) {
    return (
        <OpinionScalePage
            settings={
                page.settings?.opinionScale ?? {
                    min: 0,
                    max: 10,
                    leftLabel: "",
                    rightLabel: "",
                }
            }
            disabled
        />
    )
}

// ---------------------------------------------------------------------------
// Signature — preview of the signing board.
// ---------------------------------------------------------------------------

export function SignatureEditor() {
    return <SignaturePage disabled />
}

// ---------------------------------------------------------------------------
// Matrix — preview of the grid.
// ---------------------------------------------------------------------------

export function MatrixEditor({ page }: EditorProps) {
    return (
        <MatrixPage
            settings={
                page.settings?.matrix ?? {
                    rows: [],
                    columns: [],
                    allowMultiplePerRow: false,
                }
            }
            disabled
        />
    )
}

// ---------------------------------------------------------------------------
// Upload — preview honouring the upload settings.
// ---------------------------------------------------------------------------

export function UploadEditor({ page }: EditorProps) {
    return (
        <UploadPage
            settings={
                page.settings?.upload ?? {
                    allowMultiple: false,
                    allowedFileTypes: [],
                    maxFileSizeMb: 10,
                }
            }
            disabled
        />
    )
}

// ---------------------------------------------------------------------------
// Rating — preview honouring style/max from settings.
// ---------------------------------------------------------------------------

export function RatingSettingsAwareEditor({ page }: EditorProps) {
    return (
        <StarRatingPage
            settings={page.settings?.rating ?? { style: "star", max: 5 }}
            disabled
        />
    )
}
