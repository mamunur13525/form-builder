import { useRef, useState } from "react"
import { Upload, X, Loader2, FileIcon } from "lucide-react"
import { uploadFile } from "@/entities/upload/api/upload.api"
import type { UploadSettings } from "@/shared/types/common"
import { cn } from "@/lib/utils"

export interface UploadedFile {
    fileId: string
    filename: string
    url: string
    size: number
}

interface UploadPageProps {
    value?: UploadedFile[]
    onChange?: (value: UploadedFile[]) => void
    settings: UploadSettings
    disabled?: boolean
}

/** Expand a group name into the MIME prefixes the picker should accept. */
function acceptAttr(allowed: string[]): string | undefined {
    if (!allowed.length) return undefined
    return allowed
        .map((t) => {
            if (t === "image" || t === "video" || t === "audio" || t === "text") {
                return `${t}/*`
            }
            if (t === "application") return ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.json"
            return t
        })
        .join(",")
}

export function UploadPage({ value, onChange, settings, disabled }: UploadPageProps) {
    const inputRef = useRef<HTMLInputElement>(null)
    const [uploading, setUploading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const files = value ?? []

    const handleFiles = async (list: FileList | null) => {
        if (!list || list.length === 0) return
        setError(null)

        const picked = Array.from(list)
        const tooBig = picked.find((f) => f.size > settings.maxFileSizeMb * 1024 * 1024)
        if (tooBig) {
            setError(`"${tooBig.name}" exceeds the ${settings.maxFileSizeMb} MB limit.`)
            return
        }

        setUploading(true)
        try {
            const uploaded: UploadedFile[] = []
            for (const file of picked) {
                const res = await uploadFile(file)
                uploaded.push({
                    fileId: res.fileId,
                    filename: res.filename,
                    url: res.url,
                    size: res.size,
                })
            }
            onChange?.(settings.allowMultiple ? [...files, ...uploaded] : uploaded.slice(0, 1))
        } catch (err) {
            console.error("File upload failed:", err)
            setError("Upload failed. Please try again.")
        } finally {
            setUploading(false)
        }
    }

    const remove = (fileId: string) => {
        onChange?.(files.filter((f) => f.fileId !== fileId))
    }

    return (
        <div className="space-y-2">
            <input
                ref={inputRef}
                type="file"
                multiple={settings.allowMultiple}
                accept={acceptAttr(settings.allowedFileTypes)}
                className="hidden"
                onChange={(e) => {
                    handleFiles(e.target.files)
                    e.target.value = ""
                }}
            />

            <button
                type="button"
                disabled={disabled || uploading}
                onClick={() => inputRef.current?.click()}
                className={cn(
                    "flex w-full flex-col items-center justify-center gap-2 rounded-md border border-dashed py-8 text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground",
                    (disabled || uploading) && "pointer-events-none opacity-50",
                )}
            >
                {uploading ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                    <Upload className="h-6 w-6" />
                )}
                <span className="text-sm">
                    {uploading ? "Uploading..." : "Click to upload"}
                </span>
                <span className="text-xs text-muted-foreground">
                    Max {settings.maxFileSizeMb} MB
                    {settings.allowMultiple ? " each" : ""}
                </span>
            </button>

            {error && <p className="text-sm text-destructive">{error}</p>}

            {files.length > 0 && (
                <ul className="space-y-1.5">
                    {files.map((file) => (
                        <li
                            key={file.fileId}
                            className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm"
                        >
                            <FileIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
                            <span className="flex-1 truncate">{file.filename}</span>
                            <button
                                type="button"
                                onClick={() => remove(file.fileId)}
                                disabled={disabled}
                                className="text-muted-foreground hover:text-destructive"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}
