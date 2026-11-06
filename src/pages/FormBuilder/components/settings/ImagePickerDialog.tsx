import React, { useState, useCallback, useRef, type DragEvent } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Link2, Upload, ImagePlus, Loader2, X, Check } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { showError } from "@/shared/hooks/useToast"
import type { CoverImage } from "@/shared/types/common"
import { cn } from "@/lib/utils"
import { TAB_LIST_CLASS, TAB_TRIGGER_CLASS } from "./primitives"


const PRIMARY_BUTTON_CLASS = "h-11 gap-2 rounded-xl bg-[#FF5722] hover:bg-[#F4511E] px-6 text-sm font-semibold text-white shadow-md shadow-[#FF5722]/20 transition-all cursor-pointer active:scale-95 disabled:pointer-events-none disabled:opacity-50"

// ── Types ───────────────────────────────────────────────────────────────────
interface ImagePickerDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSelect: (image: CoverImage) => void
    currentImage?: CoverImage | null
    title?: string
    description?: string
}

// ── Helpers ─────────────────────────────────────────────────────────────────
function isValidImageUrl(url: string): boolean {
    try {
        const u = new URL(url)
        return /^https?:$/.test(u.protocol) && /\.(jpg|jpeg|png|webp|gif|avif)(\?.*)?$/i.test(u.pathname)
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
function ImagePreview({ src, alt, className }: { src: string; alt?: string; className?: string }) {
    const [loaded, setLoaded] = useState(false)
    return (
        <div className={cn("relative overflow-hidden rounded-2xl border border-slate-200 dark:border-zinc-800", className)}>
            <img
                src={src}
                alt={alt || "Cover"}
                className={cn("h-28 w-full object-cover transition-opacity duration-300", loaded ? "opacity-100" : "opacity-0")}
                onLoad={() => setLoaded(true)}
            />
            {!loaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-100 dark:bg-zinc-900">
                    <Loader2 className="h-5 w-5 animate-spin text-[#FF5722]" />
                </div>
            )}
        </div>
    )
}

function UploadTab({ onSelect }: { onSelect: (image: CoverImage) => void }) {
    const inputRef = useRef<HTMLInputElement>(null)
    const [dragOver, setDragOver] = useState(false)
    const [uploading, setUploading] = useState(false)

    const readFileAsDataUrl = (file: File) => new Promise<string>((resolve) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result as string)
        reader.readAsDataURL(file)
    })

    const processFile = async (file: File | undefined) => {
        if (!file) return
        if (!file.type.startsWith("image/")) {
            showError("Invalid file type", new Error("Please select an image file."))
            return
        }
        setUploading(true)
        try {
            const dataUrl = await readFileAsDataUrl(file)
            onSelect({ url: dataUrl, alt: "" })
        } catch {
            showError("Upload failed", new Error("Could not read the image file."))
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
                onClick={() => inputRef.current?.click()}
                className={cn(
                    "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed py-8 sm:py-12 text-center transition-all",
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
                    {uploading ? "Uploading..." : "Drag & drop an image here, or click to browse"}
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

function LinkTab({ onSelect }: { onSelect: (image: CoverImage) => void }) {
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
            onSelect({ url: trimmed, alt: "" })
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
                            className="h-11 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#1a1a20] pl-10 pr-4 text-sm text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus-visible:border-[#FF5722] focus-visible:ring-1 focus-visible:ring-[#FF5722] shadow-xs"
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

function UnsplashTab({ onSelect }: { onSelect: (image: CoverImage) => void }) {
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
        onSelect({ url: img.url, alt: img.alt })
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
                        className="h-11 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#1a1a20] pl-10 pr-4 text-sm text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus-visible:border-[#FF5722] focus-visible:ring-1 focus-visible:ring-[#FF5722] shadow-xs"
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
                            className="relative aspect-[4/3] overflow-hidden rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-100 dark:bg-zinc-900 hover:border-[#FF5722]/60 cursor-pointer shadow-xs"
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

// ── Dialog ───────────────────────────────────────────────────────────────────
export function ImagePickerDialog({
    open,
    onOpenChange,
    onSelect,
    currentImage,
    title = "Cover image",
    description = "Upload, paste a link, or search Unsplash to add an image.",
}: ImagePickerDialogProps) {
    const [tab, setTab] = useState("upload")
    const [preview, setPreview] = useState<string | null>(currentImage?.url ?? null)

    const reset = () => {
        setPreview(currentImage?.url ?? null)
        setTab("upload")
    }

    const handleSelect = (image: CoverImage) => {
        setPreview(image.url)
        onSelect(image)
        onOpenChange(false)
    }

    const clearSelection = () => {
        setPreview(null)
        onSelect({ url: "", alt: "" })
    }

    return (
        <Dialog
            open={open}
            onOpenChange={(next) => { if (!next) reset(); onOpenChange(next); }}
            className="w-full max-w-3xl rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#141418] text-slate-900 dark:text-zinc-100 p-6 sm:p-10 shadow-2xl"
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
                    <TabsList className={TAB_LIST_CLASS}>
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
                    </div>
                </Tabs>

                {preview && (
                    <div className="mt-6 flex items-start justify-between gap-4">
                        <ImagePreview src={preview} alt="Selected image" className="h-28 flex-1" />
                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={clearSelection}
                            className="shrink-0 rounded-full border border-slate-200 dark:border-zinc-800 bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:text-rose-500 dark:hover:text-rose-400 hover:border-rose-300 dark:hover:border-rose-500/40 cursor-pointer shadow-xs"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                )}

                <DialogFooter className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        className="h-11 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-100 dark:bg-[#1a1a20] px-8 text-sm font-medium text-slate-700 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer w-full sm:w-auto shadow-xs"
                    >
                        Cancel
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}