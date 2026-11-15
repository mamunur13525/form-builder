import { useEffect, useId, useRef, useState } from "react"
import { ChevronsUpDown, Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { FormPage } from "@/shared/types/common"
import {
    AddressPage,
    ContactInfoPage,
    MatrixPage,
    OpinionScalePage,
    SignaturePage,
    StatementPage,
    StarRatingPage,
    UploadPage,
    dropdownTriggerClasses,
    SliderPage,
} from "@/shared/components/pages"
import { getDropdownItemStyle, getDropdownMenuStyle } from "@/shared/utils/theme"
import { cn } from "@/lib/utils"

interface EditorProps {
    page: FormPage
    pageIndex: number
    onUpdate: (index: number, updates: Partial<FormPage>) => void
    isMobileView?: boolean
    color?: string
    fontSizeClass?: string
}

// ---------------------------------------------------------------------------
// Statement — display-only. Label + helperText are edited by the page chrome,
// so this only previews the configured embed.
// ---------------------------------------------------------------------------

export function StatementEditor({ page }: EditorProps) {
    const settings = page.settings?.statement

    if (!settings?.embedUrl) {
        return null
    }

    return <StatementPage settings={settings} />
}

// ---------------------------------------------------------------------------
// Dropdown — boxed trigger preview; clicking it opens the editable option list.
// ---------------------------------------------------------------------------

export function DropdownEditor({ page, pageIndex, onUpdate, color, fontSizeClass }: EditorProps) {
    const [open, setOpen] = useState(false)
    const wrapperRef = useRef<HTMLDivElement>(null)
    const menuId = useId()
    const patchOptions = (options: FormPage["options"]) => onUpdate(pageIndex, { options })

    // Clicking anywhere else closes the menu, like the fill-view dropdown.
    useEffect(() => {
        if (!open) return
        const onPointerDown = (event: PointerEvent) => {
            if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false)
        }
        document.addEventListener("pointerdown", onPointerDown)
        return () => document.removeEventListener("pointerdown", onPointerDown)
    }, [open])

    useEffect(() => {
        if (!open) return
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") setOpen(false)
        }
        document.addEventListener("keydown", onKeyDown)
        return () => document.removeEventListener("keydown", onKeyDown)
    }, [open])

    return (
        <div ref={wrapperRef} className="relative">
            <button
                type="button"
                aria-haspopup="true"
                aria-expanded={open}
                aria-controls={menuId}
                onClick={() => setOpen((value) => !value)}
                className={cn(
                    dropdownTriggerClasses,
                    fontSizeClass,
                    "cursor-pointer",
                    !color && "border-slate-600 dark:border-zinc-500",
                )}
                style={
                    color
                        ? {
                            color,
                            borderColor: `color-mix(in oklab, ${color} 30%, transparent)`,
                            backgroundColor: `color-mix(in oklab, ${color} 5%, transparent)`,
                        }
                        : undefined
                }
            >
                <span className="truncate">Please select an option</span>
                <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-70" />
            </button>

            {open && (
                <div
                    id={menuId}
                    aria-label="Dropdown options"
                    style={getDropdownMenuStyle(color)}
                    className="absolute left-0 right-0 top-full z-30 mt-1 max-h-80 space-y-2 overflow-y-auto rounded-lg border border-slate-200 bg-white p-2 shadow-lg dark:border-zinc-700 dark:bg-zinc-900"
                >
                    <div className="flex items-center justify-between px-1">
                        <span className="text-xs font-medium text-slate-500 dark:text-zinc-400">
                            Dropdown options
                        </span>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 shrink-0"
                            aria-label="Close options"
                            onClick={() => setOpen(false)}
                        >
                            <X className="h-3.5 w-3.5" />
                        </Button>
                    </div>
                    {page.options.map((opt, optIndex) => (
                        <div key={optIndex} className="flex items-center gap-2">
                            <Input
                                value={opt.label}
                                onChange={(e) => {
                                    const newOpts = [...page.options]
                                    newOpts[optIndex] = {
                                        label: e.target.value,
                                        value: e.target.value.toLowerCase().replace(/\s+/g, "_"),
                                    }
                                    patchOptions(newOpts)
                                }}
                                placeholder="Option label"
                                className="flex-1"
                                style={
                                    color
                                        ? {
                                            ...getDropdownItemStyle(color, false),
                                            borderColor: `color-mix(in oklab, ${color} 30%, transparent)`,
                                        }
                                        : undefined
                                }
                            />
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 shrink-0"
                                aria-label={`Remove option ${optIndex + 1}`}
                                onClick={() =>
                                    patchOptions(page.options.filter((_, i) => i !== optIndex))
                                }
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                    <Button
                        variant="outline"
                        size="sm"
                        style={
                            color
                                ? {
                                    color,
                                    borderColor: `color-mix(in oklab, ${color} 35%, transparent)`,
                                }
                                : undefined
                        }
                        onClick={() => patchOptions([...page.options, { label: "", value: "" }])}
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Option
                    </Button>
                </div>
            )}
        </div>
    )
}

// ---------------------------------------------------------------------------
// Address — preview of the configured sub-pages.
// ---------------------------------------------------------------------------

export function AddressEditor({ page, isMobileView, color, fontSizeClass }: EditorProps) {
    const pages = page.settings?.address?.pages ?? []
    const fieldsPerRow = page.settings?.address?.fieldsPerRow

    if (pages.length === 0) {
        return (
            <p className="rounded-lg border border-dashed py-6 text-center text-sm text-muted-foreground">
                Configure the address pages in the settings panel.
            </p>
        )
    }

    return (
        <AddressPage
            pages={pages}
            fieldsPerRow={fieldsPerRow}
            isMobileView={isMobileView}
            disabled
            color={color}
            fontSizeClass={fontSizeClass}
        />
    )
}

// ---------------------------------------------------------------------------
// Contact Info — preview of the configured sub-pages.
// ---------------------------------------------------------------------------

export function ContactInfoEditor({ page, isMobileView, color, fontSizeClass }: EditorProps) {
    const pages = page.settings?.contactInfo?.pages ?? []
    const fieldsPerRow = page.settings?.contactInfo?.fieldsPerRow
    const phoneSettings =
        page.settings?.contactInfo?.phone ??
        page.settings?.phone ?? {
            phoneVerification: false,
            countryCodeMode: "auto" as const,
            defaultCountry: null,
        }

    if (pages.length === 0) {
        return (
            <p className="rounded-lg border border-dashed py-6 text-center text-sm text-muted-foreground">
                Configure the contact info fields in the settings panel.
            </p>
        )
    }

    return (
        <ContactInfoPage
            pages={pages}
            phoneSettings={phoneSettings}
            fieldsPerRow={fieldsPerRow}
            isMobileView={isMobileView}
            disabled
            color={color}
            fontSizeClass={fontSizeClass}
        />
    )
}

// ---------------------------------------------------------------------------
// Opinion scale — preview of the number row with labels.
// ---------------------------------------------------------------------------

export function OpinionScaleEditor({ page, color }: EditorProps) {
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
            color={color}
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
// Slider — preview using the configured range, defaults and decoration.
// ---------------------------------------------------------------------------

export function SliderEditor({ page, color, fontSizeClass }: EditorProps) {
    return (
        <SliderPage
            settings={
                page.settings?.slider ?? {
                    min: 0,
                    max: 100,
                    step: 1,
                    rangeMode: false,
                    defaultLow: 0,
                    defaultHigh: 100,
                    prefix: "",
                    suffix: "",
                    thousandSeparator: "comma",
                }
            }
            disabled
            color={color}
            fontSizeClass={fontSizeClass}
        />
    )
}

// ---------------------------------------------------------------------------
// Rating — preview honouring style/max from settings.
// ---------------------------------------------------------------------------

export function RatingSettingsAwareEditor({ page, color }: EditorProps) {
    return (
        <StarRatingPage
            settings={page.settings?.rating ?? { style: "star", max: 5 }}
            disabled
            color={color}
        />
    )
}
