import React from "react"
import { Image, ImagePlus, Trash2 } from "lucide-react"
import type { FormPage } from "../../../../shared/types/common"
import { ImagePickerDialog } from "./ImagePickerDialog"
import { CoverImageLayoutSetting } from "./cover-image-layout"
import { SettingsSection } from "./primitives"

interface CoverImageSettingProps {
    page: FormPage
    pageIndex: number
    onUpdate: (index: number, updates: Partial<FormPage>) => void
}

/** Page-level cover image: preview, replace, remove and layout. */
export function CoverImageSetting({ page, pageIndex, onUpdate }: CoverImageSettingProps) {
    const [dialogOpen, setDialogOpen] = React.useState(false)

    return (
        <SettingsSection
            title="Page Cover Image"
            icon={<Image className="h-4 w-4 text-zinc-400" />}
        >
            {page.coverImage?.url ? (
                <div className="space-y-3">
                    <div className="relative overflow-hidden rounded-lg border border-zinc-800 shadow-xs">
                        <img
                            src={page.coverImage.url}
                            alt={page.coverImage.alt || "Cover"}
                            className="h-28 w-full object-cover"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setDialogOpen(true)}
                            className="flex h-10 flex-1 items-center justify-center rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-100 dark:bg-[#1a1a20] px-3 text-xs font-medium text-slate-700 dark:text-zinc-300 shadow-xs hover:bg-slate-200 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                        >
                            Replace
                        </button>
                        <button
                            type="button"
                            onClick={() => onUpdate(pageIndex, { coverImage: null })}
                            className="flex h-10 items-center justify-center gap-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 text-xs font-medium text-rose-500 dark:text-rose-400 hover:bg-rose-500/20 transition-colors cursor-pointer"
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                            Remove
                        </button>
                    </div>
                    <CoverImageLayoutSetting
                        value={page.coverImage.layout}
                        onChange={(layout) =>
                            onUpdate(pageIndex, {
                                coverImage: { ...page.coverImage!, layout },
                            })
                        }
                    />
                </div>
            ) : (
                <div
                    onClick={() => setDialogOpen(true)}
                    className="flex w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-900/40 py-7 px-4 text-center cursor-pointer hover:bg-slate-100/70 dark:hover:bg-zinc-900/80 hover:border-[#FF5722]/60 transition-all group"
                >
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#18181c] text-[#FF5722] shadow-xs group-hover:scale-105 transition-transform">
                        <ImagePlus className="h-5 w-5" />
                    </div>
                    <p className="mt-3 text-sm font-medium text-slate-800 dark:text-zinc-200">
                        Add a cover image or drag & drop
                    </p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-zinc-500">
                        JPG, PNG, SVG • Max 5MB
                    </p>
                </div>
            )}

            <ImagePickerDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                onSelect={(coverImage) =>
                    onUpdate(pageIndex, {
                        coverImage: {
                            ...coverImage,
                            layout: page.coverImage?.layout ?? "top",
                        },
                    })
                }
            />
        </SettingsSection>
    )
}
