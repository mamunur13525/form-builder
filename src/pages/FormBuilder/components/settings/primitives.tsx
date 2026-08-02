import { useRef, useState, type ReactNode } from "react"
import { ImagePlus, Loader2, Trash2, Asterisk } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { uploadFile } from "@/entities/upload/api/upload.api"
import { showError } from "@/shared/hooks/useToast"
import type { CoverImage } from "@/shared/types/common"
import { cn } from "@/lib/utils"

/** A labeled settings section with an optional description. */
export function SettingsSection({
    title,
    description,
    children,
    className,
}: {
    title: string
    description?: string
    children?: ReactNode
    className?: string
}) {
    return (
        <div className={cn("space-y-3", className)}>
            <div className="space-y-1">
                <Label className="text-base font-semibold">{title}</Label>
                {description && (
                    <p className="text-xs text-muted-foreground">{description}</p>
                )}
            </div>
            {children}
        </div>
    )
}

/** A single toggle row: label + optional description on the left, switch on the right. */
export function ToggleRow({
    id,
    label,
    description,
    checked,
    onCheckedChange,
    icon,
}: {
    id?: string
    label: string
    description?: string
    checked: boolean
    onCheckedChange: (checked: boolean) => void
    icon?: ReactNode
}) {
    return (
        <div className="space-y-1.5">
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-1.5">
                    {icon}
                    <Label htmlFor={id} className="text-base cursor-pointer">
                        {label}
                    </Label>
                </div>
                <Switch
                    id={id}
                    checked={checked}
                    onCheckedChange={onCheckedChange}
                    size="sm"
                />
            </div>
            {description && (
                <p className="text-xs text-muted-foreground">{description}</p>
            )}
        </div>
    )
}

/** The "required field" toggle, shared by nearly every field type. */
export function RequiredToggle({
    checked,
    onCheckedChange,
    description = "If checked, users will be required to complete this field.",
}: {
    checked: boolean
    onCheckedChange: (checked: boolean) => void
    description?: string
}) {
    return (
        <ToggleRow
            id="required"
            label="Required field"
            description={description}
            checked={checked}
            onCheckedChange={onCheckedChange}
            icon={<Asterisk className="h-3.5 w-3.5 text-red-500" />}
        />
    )
}

/** A labeled number input that emits `undefined` when cleared. */
export function NumberSetting({
    label,
    description,
    value,
    onChange,
    placeholder,
    min,
    max,
}: {
    label: string
    description?: string
    value: number | undefined
    onChange: (value: number | undefined) => void
    placeholder?: string
    min?: number
    max?: number
}) {
    return (
        <div className="space-y-1">
            <Label className="text-base text-muted-foreground">{label}</Label>
            <Input
                type="number"
                value={value ?? ""}
                min={min}
                max={max}
                onChange={(e) => {
                    const raw = e.target.value
                    if (raw === "") {
                        onChange(undefined)
                        return
                    }
                    onChange(Number(raw))
                }}
                placeholder={placeholder}
                className="h-9 text-base"
            />
            {description && <p className="text-xs text-muted-foreground">{description}</p>}
        </div>
    )
}

/** A labeled text input. */
export function TextSetting({
    label,
    description,
    value,
    onChange,
    placeholder,
}: {
    label: string
    description?: string
    value: string
    onChange: (value: string) => void
    placeholder?: string
}) {
    return (
        <div className="space-y-1">
            <Label className="text-base text-muted-foreground">{label}</Label>
            <Input
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="h-9 text-base"
            />
            {description && <p className="text-xs text-muted-foreground">{description}</p>}
        </div>
    )
}

/** Cover image upload + preview. Uploads via POST /uploads and stores {url,fileId}. */
export function CoverImageField({
    value,
    onChange,
}: {
    value: CoverImage | null | undefined
    onChange: (value: CoverImage | null) => void
}) {
    const inputRef = useRef<HTMLInputElement>(null)
    const [uploading, setUploading] = useState(false)

    const handleFile = async (file: File | undefined) => {
        if (!file) return
        setUploading(true)
        try {
            const res = await uploadFile(file)
            onChange({ url: res.url, fileId: res.fileId, alt: "" })
        } catch (err) {
            console.error("Cover image upload failed:", err)
            showError("Failed to upload image", err)
        } finally {
            setUploading(false)
        }
    }

    return (
        <SettingsSection title="Cover image">
            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                    handleFile(e.target.files?.[0])
                    e.target.value = ""
                }}
            />
            {value?.url ? (
                <div className="space-y-2">
                    <div className="relative overflow-hidden rounded-md border">
                        <img
                            src={value.url}
                            alt={value.alt || "Cover"}
                            className="h-28 w-full object-cover"
                        />
                        {uploading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-background/60">
                                <Loader2 className="h-5 w-5 animate-spin" />
                            </div>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => inputRef.current?.click()}
                            disabled={uploading}
                            className="flex-1 rounded-md border px-3 py-1.5 text-sm hover:bg-accent disabled:opacity-50"
                        >
                            Replace
                        </button>
                        <button
                            type="button"
                            onClick={() => onChange(null)}
                            disabled={uploading}
                            className="flex items-center justify-center gap-1 rounded-md border px-3 py-1.5 text-sm text-destructive hover:bg-destructive/10 disabled:opacity-50"
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                            Remove
                        </button>
                    </div>
                </div>
            ) : (
                <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    disabled={uploading}
                    className="flex w-full flex-col items-center justify-center gap-1.5 rounded-md border border-dashed py-6 text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground disabled:opacity-50"
                >
                    {uploading ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                        <ImagePlus className="h-5 w-5" />
                    )}
                    <span>{uploading ? "Uploading..." : "Add a cover image"}</span>
                </button>
            )}
        </SettingsSection>
    )
}
