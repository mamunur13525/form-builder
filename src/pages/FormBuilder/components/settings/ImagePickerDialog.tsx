import React, { useState, useCallback, useMemo, useRef, type DragEvent } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { Search, Link2, Upload, ImagePlus, Images, Loader2, Check, Trash2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { showError } from "@/shared/hooks/useToast"
import { uploadImage } from "@/shared/api/upload.api"
import {
    GALLERY_QUERY_KEY,
    deleteGalleryItem,
    listGalleryItems,
    saveGalleryItem,
    type GalleryItem,
    type GalleryMediaType,
    type GallerySource,
} from "@/shared/api/gallery.api"
import type { CoverImage } from "@/shared/types/common"
import { cn } from "@/lib/utils"
import { TAB_LIST_CLASS, TAB_TRIGGER_CLASS } from "./primitives"


const PRIMARY_BUTTON_CLASS = "h-11 gap-2 rounded-lg bg-[#FF5722] hover:bg-[#F4511E] px-6 text-sm font-semibold text-white shadow-md shadow-[#FF5722]/20 transition-all cursor-pointer active:scale-95 disabled:pointer-events-none disabled:opacity-50"

// ── Types ───────────────────────────────────────────────────────────────────
interface ImagePickerDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSelect: (image: CoverImage) => void
    title?: string
    description?: string
}

type PickOrigin = {
    source: GallerySource
    thumbnailUrl?: string
    width?: number
    height?: number
}

type GalleryFilter = "all" | GalleryMediaType

const GALLERY_FILTERS: ReadonlyArray<{ value: GalleryFilter; label: string }> = [
    { value: "all", label: "All" },
    { value: "image", label: "Images" },
    { value: "gif", label: "Gifs" },
    { value: "icon", label: "Icons" },
]

// ── Helpers ─────────────────────────────────────────────────────────────────
function resolveAssetUrl(url: string): string {
    if (!url) return ""
    if (/^(https?:|data:|blob:)/i.test(url)) return url
    const base = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "")
    return `${base}${url.startsWith("/") ? "" : "/"}${url}`
}

function isValidImageUrl(url: string): boolean {
    try {
        const u = new URL(url)
        return /^https?:$/.test(u.protocol) && /\.(jpg|jpeg|png|webp|gif|avif|svg|ico)(\?.*)?$/i.test(u.pathname)
    } catch {
        return false
    }
}

function imageExists(url: string): Promise<boolean> {
    return fetch(url, { method: "HEAD", mode: "no-cors" })
        .then(() => true)
        .catch(() => false)
}

// ── Mock Unsplash data (replace with real API call if key is added) ──────────
interface UnsplashImage { id: string; url: string; thumb: string; alt: string }
const MOCK_UNSPLASH: UnsplashImage[] = [
    { id: "1", url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1600&q=70", thumb: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=400&q=60", alt: "Mountain" },
    { id: "2", url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1600&q=70", thumb: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=400&q=60", alt: "Forest" },
    { id: "3", url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=70", thumb: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=60", alt: "Beach" },
    { id: "4", url: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1600&q=70", thumb: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=400&q=60", alt: "Fog" },
    { id: "5", url: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1600&q=70", thumb: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=400&q=60", alt: "Valley" },
    { id: "6", url: "https://images.unsplash.com/photo-1504198458649-3128b932f49e?auto=format&fit=crop&w=1600&q=70", thumb: "https://images.unsplash.com/photo-1504198458649-3128b932f49e?auto=format&fit=crop&w=400&q=60", alt: "Ocean" },
]

// ── Shared pieces ───────────────────────────────────────────────────────────
function UploadTab({
    onSelect,
}: {
    onSelect: (image: CoverImage, origin: PickOrigin) => void
}) {
    const inputRef = useRef<HTMLInputElement>(null)
    const [dragOver, setDragOver] = useState(false)
    const [uploading, setUploading] = useState(false)

    const processFile = async (file: File | undefined) => {
        if (!file) return
        if (!file.type.startsWith("image/")) {
            showError("Invalid file type", new Error("Please select an image file (JPG, PNG, WebP, GIF, etc)."))
            return
        }
        if (file.size > 10 * 1024 * 1024) {
            showError("File too large", new Error("Image must be smaller than 10MB."))
            return
        }
        setUploading(true)
        try {
            const uploaded = await uploadImage(file)
            if (uploaded?.url) {
                const finalUrl = resolveAssetUrl(uploaded.url)
                const finalThumb = resolveAssetUrl(uploaded.thumbnailUrl || uploaded.url)
                onSelect(
                    { url: finalUrl, fileId: uploaded.fileId, alt: file.name || "" },
                    {
                        source: "upload",
                        thumbnailUrl: finalThumb,
                        width: uploaded.width,
                        height: uploaded.height,
                    }
                )
            } else {
                throw new Error("No URL returned from upload server.")
            }
        } catch (err: unknown) {
            showError("Upload failed", err instanceof Error ? err : new Error("Could not upload the image file to ImageKit."))
        } finally {
            setUploading(false)
        }
    }

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        setDragOver(false)
        processFile(e.dataTransfer.files?.[0])
    }

    return (
        <div className="space-y-4">
            <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => !uploading && inputRef.current?.click()}
                className={cn(
                    "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed py-8 sm:py-12 text-center transition-all",
                    uploading && "pointer-events-none opacity-70",
                    dragOver
                        ? "border-[#FF5722] bg-[#FF5722]/10"
                        : "border-slate-300 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-900/40 hover:border-[#FF5722]/60 hover:bg-slate-100/70 dark:hover:bg-zinc-900/70"
                )}
            >
                {uploading ? (
                    <Loader2 className="h-6 w-6 animate-spin text-[#FF5722]" />
                ) : (
                    <Upload className="h-6 w-6 text-[#FF5722]" />
                )}
                <div className="text-sm text-slate-800 dark:text-zinc-200 font-medium">
                    {uploading ? "Uploading to ImageKit..." : "Drag & drop an image here, or click to browse"}
                </div>
                <p className="text-xs text-slate-500 dark:text-zinc-500">JPG, PNG, WebP, GIF up to 10MB</p>
            </div>

            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                    processFile(e.target.files?.[0])
                    e.target.value = ""
                }}
            />
        </div>
    )
}

function LinkTab({
    onSelect,
}: {
    onSelect: (image: CoverImage, origin: PickOrigin) => void
}) {
    const [url, setUrl] = useState("")
    const [validating, setValidating] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handlePaste = async () => {
        setError(null)
        const trimmed = url.trim()
        if (!trimmed) { setError("Please paste an image URL."); return }

        setValidating(true)
        try {
            const valid = isValidImageUrl(trimmed)
            if (!valid) { setError("URL does not appear to be an image."); setValidating(false); return }
            const reachable = await imageExists(trimmed)
            if (!reachable) { setError("Could not load image from this URL."); setValidating(false); return }
            onSelect({ url: trimmed, alt: "" }, { source: "link" })
            setUrl("")
        } catch {
            setError("Something went wrong while validating the URL.")
        } finally {
            setValidating(false)
        }
    }

    return (
        <div className="space-y-4">
            <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-800 dark:text-zinc-200">Image URL</label>
                <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                        <Link2 className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-zinc-500" />
                        <Input
                            value={url}
                            onChange={(e) => { setUrl(e.target.value); setError(null) }}
                            placeholder="https://example.com/photo.jpg"
                            onKeyDown={(e) => e.key === "Enter" && handlePaste()}
                            className="h-11 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#1a1a20] pl-10 pr-4 text-sm text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus-visible:border-[#FF5722] focus-visible:ring-1 focus-visible:ring-[#FF5722] shadow-xs"
                        />
                    </div>
                    <Button onClick={handlePaste} disabled={validating} className={PRIMARY_BUTTON_CLASS}>
                        {validating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add"}
                    </Button>
                </div>
                {error && <p className="text-xs leading-5 text-rose-500 dark:text-rose-400">{error}</p>}
            </div>
        </div>
    )
}

function UnsplashTab({
    onSelect,
}: {
    onSelect: (image: CoverImage, origin: PickOrigin) => void
}) {
    const [query, setQuery] = useState("")
    const [results, setResults] = useState<UnsplashImage[]>([])
    const [searching, setSearching] = useState(false)
    const [selectedId, setSelectedId] = useState<string | null>(null)

    const doSearch = useCallback(async () => {
        const q = query.trim()
        if (!q) return
        setSearching(true)
        await new Promise((r) => setTimeout(r, 500))
        const filtered = MOCK_UNSPLASH.filter((img) => img.alt.toLowerCase().includes(q.toLowerCase()))
        setResults(filtered.length ? filtered : MOCK_UNSPLASH)
        setSearching(false)
    }, [query])

    const handleKey = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") doSearch()
    }

    const pick = (img: UnsplashImage) => {
        setSelectedId(img.id)
        onSelect({ url: img.url, alt: img.alt }, { source: "unsplash", thumbnailUrl: img.thumb })
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-zinc-500" />
                    <Input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={handleKey}
                        placeholder="Search Unsplash..."
                        className="h-11 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#1a1a20] pl-10 pr-4 text-sm text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus-visible:border-[#FF5722] focus-visible:ring-1 focus-visible:ring-[#FF5722] shadow-xs"
                    />
                </div>
                <Button onClick={doSearch} disabled={searching} className={PRIMARY_BUTTON_CLASS}>
                    {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
                </Button>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <AnimatePresence>
                    {results.map((img) => (
                        <motion.button
                            key={img.id}
                            type="button"
                            onClick={() => pick(img)}
                            className="relative aspect-[4/3] overflow-hidden rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-100 dark:bg-zinc-900 hover:border-[#FF5722]/60 cursor-pointer shadow-xs"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <img src={img.thumb} alt={img.alt} className="h-full w-full object-cover" loading="lazy" />
                            {selectedId === img.id && (
                                <div className="absolute inset-0 flex items-center justify-center bg-[#FF5722]/30">
                                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FF5722] text-white shadow-md">
                                        <Check className="h-4 w-4" />
                                    </span>
                                </div>
                            )}
                        </motion.button>
                    ))}
                </AnimatePresence>
                {!searching && results.length === 0 && (
                    <div className="col-span-3 py-10 text-center text-sm text-slate-500 dark:text-zinc-500">
                        Type a keyword and press Search to find images.
                    </div>
                )}
            </div>
        </div>
    )
}

function MyGalleryTab({
    open,
    onSelect,
}: {
    open: boolean
    onSelect: (image: CoverImage, origin: PickOrigin) => void
}) {
    const queryClient = useQueryClient()
    const [search, setSearch] = useState("")
    const [filter, setFilter] = useState<GalleryFilter>("all")
    const [deletingId, setDeletingId] = useState<string | null>(null)

    const { data: items = [], isLoading, isError } = useQuery({
        queryKey: GALLERY_QUERY_KEY,
        queryFn: listGalleryItems,
        enabled: open,
        staleTime: 0,
        refetchOnMount: "always",
    })

    const filteredItems = useMemo(() => {
        const q = search.trim().toLowerCase()
        return items.filter((item) => {
            if (filter !== "all" && item.mediaType !== filter) return false
            if (!q) return true
            return (
                item.name.toLowerCase().includes(q) ||
                item.url.toLowerCase().includes(q) ||
                item.source.toLowerCase().includes(q)
            )
        })
    }, [items, search, filter])

    const handleRemove = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation()
        setDeletingId(id)
        try {
            await deleteGalleryItem(id)
            queryClient.setQueryData<GalleryItem[]>(GALLERY_QUERY_KEY, (prev = []) =>
                prev.filter((entry) => entry.id !== id)
            )
        } catch (err) {
            showError("Could not remove image", err)
        } finally {
            setDeletingId(null)
        }
    }

    const pickItem = (item: GalleryItem) => {
        const finalUrl = resolveAssetUrl(item.url)
        onSelect(
            {
                url: finalUrl,
                fileId: item.fileId || undefined,
                alt: item.name || "",
            },
            {
                source: item.source,
                thumbnailUrl: resolveAssetUrl(item.thumbnailUrl || item.url),
                width: item.width,
                height: item.height,
            }
        )
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
                <div className="relative min-w-[180px] flex-1">
                    <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-zinc-500" />
                    <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search gallery"
                        className="h-10 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#1a1a20] pl-10 pr-4 text-sm text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus-visible:border-[#FF5722] focus-visible:ring-1 focus-visible:ring-[#FF5722] shadow-xs"
                    />
                </div>
                <div className="flex items-center gap-1.5" role="group" aria-label="Filter gallery by media type">
                    {GALLERY_FILTERS.map((option) => {
                        const active = filter === option.value
                        return (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => setFilter(option.value)}
                                className={cn(
                                    "h-10 rounded-lg px-3.5 text-sm font-medium transition-colors cursor-pointer whitespace-nowrap",
                                    active
                                        ? "bg-slate-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs"
                                        : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-zinc-800/80 dark:text-zinc-300 dark:hover:bg-zinc-800"
                                )}
                            >
                                {option.label}
                            </button>
                        )
                    })}
                </div>
            </div>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center gap-2 py-12 text-sm text-slate-500 dark:text-zinc-400">
                    <Loader2 className="h-5 w-5 animate-spin text-[#FF5722]" />
                    <span>Loading your gallery...</span>
                </div>
            ) : isError ? (
                <div className="rounded-lg border border-rose-200 dark:border-rose-900/40 bg-rose-50/60 dark:bg-rose-950/20 py-10 text-center text-sm text-rose-600 dark:text-rose-400">
                    Could not load your saved gallery images.
                </div>
            ) : filteredItems.length === 0 ? (
                <div className="rounded-lg border border-dashed border-slate-200 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-900/30 px-6 py-12 text-center">
                    <Images className="mx-auto h-7 w-7 text-slate-400 dark:text-zinc-500" />
                    <p className="mt-2.5 text-sm font-medium text-slate-700 dark:text-zinc-200">
                        {items.length === 0
                            ? "No saved images in your gallery yet"
                            : "No matching items found"}
                    </p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-zinc-500">
                        {items.length === 0
                            ? "Images you upload, link, or use as cover images will appear here automatically."
                            : "Try a different search term or media filter."}
                    </p>
                </div>
            ) : (
                <div className="max-h-[360px] overflow-y-auto pr-1">
                    <div className="columns-2 sm:columns-3 gap-3">
                        {filteredItems.map((item) => {
                            const previewUrl = resolveAssetUrl(item.thumbnailUrl || item.url)
                            const isIcon = item.mediaType === "icon"
                            return (
                                <div
                                    key={item.id}
                                    role="button"
                                    tabIndex={0}
                                    onClick={() => pickItem(item)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" || e.key === " ") {
                                            e.preventDefault()
                                            pickItem(item)
                                        }
                                    }}
                                    className="group relative mb-3 break-inside-avoid overflow-hidden rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-100 dark:bg-zinc-900/80 shadow-xs transition-all hover:border-[#FF5722]/70 hover:shadow-md cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5722]"
                                >
                                    <img
                                        src={previewUrl}
                                        alt={item.name || "Gallery image"}
                                        loading="lazy"
                                        className={cn(
                                            "w-full transition-transform duration-300 group-hover:scale-[1.02]",
                                            isIcon
                                                ? "h-32 bg-white dark:bg-zinc-900 p-5 object-contain"
                                                : "h-auto max-h-64 object-cover"
                                        )}
                                    />
                                    <button
                                        type="button"
                                        aria-label={`Remove ${item.name || "image"} from My Gallery`}
                                        onClick={(e) => handleRemove(e, item.id)}
                                        disabled={deletingId === item.id}
                                        className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-md bg-black/65 text-white opacity-0 backdrop-blur-xs transition-opacity group-hover:opacity-100 hover:bg-rose-600 focus-visible:opacity-100 cursor-pointer"
                                    >
                                        {deletingId === item.id ? (
                                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                        ) : (
                                            <Trash2 className="h-3.5 w-3.5" />
                                        )}
                                    </button>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    )
}

// ── Dialog ───────────────────────────────────────────────────────────────────
export function ImagePickerDialog({
    open,
    onOpenChange,
    onSelect,
    title = "Cover image",
    description = "Upload, paste a link, search Unsplash, or pick from My Gallery.",
}: ImagePickerDialogProps) {
    const queryClient = useQueryClient()
    const [tab, setTab] = useState("upload")

    const handleSelect = (image: CoverImage, origin?: PickOrigin) => {
        onSelect(image)
        onOpenChange(false)

        if (image.url) {
            saveGalleryItem({
                url: image.url,
                thumbnailUrl: origin?.thumbnailUrl || image.url,
                fileId: image.fileId,
                name: image.alt,
                source: origin?.source || "cover",
                width: origin?.width,
                height: origin?.height,
            })
                .then((savedItem) => {
                    queryClient.setQueryData<GalleryItem[]>(GALLERY_QUERY_KEY, (prev) => {
                        if (!prev) return [savedItem]
                        return [
                            savedItem,
                            ...prev.filter(
                                (entry) => entry.id !== savedItem.id && entry.url !== savedItem.url
                            ),
                        ]
                    })
                    return queryClient.invalidateQueries({
                        queryKey: GALLERY_QUERY_KEY,
                        refetchType: "all",
                    })
                })
                .catch(() => {})
        }
    }

    return (
        <Dialog
            open={open}
            onOpenChange={(next) => { if (!next) setTab("upload"); onOpenChange(next); }}
            className="w-full max-w-3xl rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#141418] text-slate-900 dark:text-zinc-100 p-6 sm:p-10 shadow-2xl"
        >
            <DialogContent className="border-0 bg-transparent text-slate-900 dark:text-zinc-100">
                <DialogHeader className="mb-6">
                    <DialogTitle className="text-xl sm:text-2xl font-semibold text-slate-900 dark:text-white">
                        {title}
                    </DialogTitle>
                    <DialogDescription className="mt-1 text-sm text-slate-500 dark:text-zinc-400">
                        {description}
                    </DialogDescription>
                </DialogHeader>

                <Tabs value={tab} onValueChange={setTab} className="w-full">
                    <TabsList className={cn(TAB_LIST_CLASS, "h-auto flex-wrap sm:h-10 sm:flex-nowrap")}>
                        <TabsTrigger value="upload" className={TAB_TRIGGER_CLASS}>
                            <Upload className="h-4 w-4" />
                            Upload
                        </TabsTrigger>
                        <TabsTrigger value="link" className={TAB_TRIGGER_CLASS}>
                            <Link2 className="h-4 w-4" />
                            Link
                        </TabsTrigger>
                        <TabsTrigger value="unsplash" className={TAB_TRIGGER_CLASS}>
                            <ImagePlus className="h-4 w-4" />
                            Unsplash
                        </TabsTrigger>
                        <TabsTrigger value="gallery" className={TAB_TRIGGER_CLASS}>
                            <Images className="h-4 w-4" />
                            My Gallery
                        </TabsTrigger>
                    </TabsList>

                    <div className="mt-4">
                        <TabsContent value="upload" className="mt-0">
                            <UploadTab onSelect={handleSelect} />
                        </TabsContent>
                        <TabsContent value="link" className="mt-0">
                            <LinkTab onSelect={handleSelect} />
                        </TabsContent>
                        <TabsContent value="unsplash" className="mt-0">
                            <UnsplashTab onSelect={handleSelect} />
                        </TabsContent>
                        <TabsContent value="gallery" className="mt-0">
                            <MyGalleryTab open={open} onSelect={handleSelect} />
                        </TabsContent>
                    </div>
                </Tabs>

                <DialogFooter className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        className="h-11 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-100 dark:bg-[#1a1a20] px-8 text-sm font-medium text-slate-700 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer w-full sm:w-auto shadow-xs"
                    >
                        Cancel
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
