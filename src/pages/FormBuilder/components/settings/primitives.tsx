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
        <div className={cn("space-y-4", className)}>
            <div className="space-y-1.5">
                <Label className="text-base font-semibold text-[var(--foreground)]">
                    {title}
                </Label>
                {description && (
                    <p className="text-xs leading-5 text-[var(--editorial-subtle)]">
                        {description}
                    </p>
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
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-2">
                    {icon}
                    <Label
                        htmlFor={id}
                        className="cursor-pointer text-base text-[var(--editorial-body)]"
                    >
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
                <p className="text-xs leading-5 text-[var(--editorial-subtle)]">
                    {description}
                </p>
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
            icon={<Asterisk className="h-4 w-4 text-[var(--primary)]" />}
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
        <div className="space-y-1.5">
            <Label className="text-base text-[var(--editorial-body)]">{label}</Label>
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
                className="h-[52px] rounded-full border-[var(--input)] bg-[var(--secondary)] px-5 text-base"
            />
            {description && (
                <p className="text-xs leading-5 text-[var(--editorial-subtle)]">
                    {description}
                </p>
            )}
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
        <div className="space-y-1.5">
            <Label className="text-base text-[var(--editorial-body)]">{label}</Label>
            <Input
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="h-[52px] rounded-full border-[var(--input)] bg-[var(--secondary)] px-5 text-base"
            />
            {description && (
                <p className="text-xs leading-5 text-[var(--editorial-subtle)]">
                    {description}
                </p>
            )}
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
                <div className="space-y-3">
                    <div className="relative overflow-hidden rounded-[22px] border border-[var(--editorial-border-light)]">
                        <img
                            src={value.url}
                            alt={value.alt || "Cover"}
                            className="h-28 w-full object-cover"
                        />
                        {uploading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-[var(--card)]/70">
                                <Loader2 className="h-5 w-5 animate-spin text-[var(--primary)]" />
                            </div>
                        )}
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => inputRef.current?.click()}
                            disabled={uploading}
                            className="editorial-transition flex-1 rounded-[16px] border border-[var(--border)] bg-[var(--secondary)] px-4 py-3 text-sm text-[var(--foreground)] hover:-translate-y-0.5 hover:border-[var(--editorial-primary-ring)] hover:bg-[var(--editorial-primary-light)] active:translate-y-0 active:scale-[.98] disabled:pointer-events-none disabled:opacity-50"
                        >
                            Replace
                        </button>
                        <button
                            type="button"
                            onClick={() => onChange(null)}
                            disabled={uploading}
                            className="editorial-transition flex items-center justify-center gap-1.5 rounded-[16px] border border-[var(--border)] bg-[var(--secondary)] px-4 py-3 text-sm text-[var(--destructive)] hover:-translate-y-0.5 hover:border-[var(--destructive)]/30 active:translate-y-0 active:scale-[.98] disabled:pointer-events-none disabled:opacity-50"
                        >
                            <Trash2 className="h-4 w-4" />
                            Remove
                        </button>
                    </div>
                </div>
            ) : (
                <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    disabled={uploading}
                    className="editorial-transition flex w-full flex-col items-center justify-center gap-2 rounded-[22px] border border-dashed border-[var(--input)] bg-[var(--secondary)] py-10 text-sm text-[var(--editorial-subtle)] hover:border-[var(--editorial-primary-ring)] hover:bg-[var(--editorial-primary-light)] hover:text-[var(--foreground)] disabled:pointer-events-none disabled:opacity-50"
                >
                    {uploading ? (
                        <Loader2 className="h-5 w-5 animate-spin text-[var(--primary)]" />
                    ) : (
                        <ImagePlus className="h-5 w-5" />
                    )}
                    <span>{uploading ? "Uploading..." : "Add a cover image"}</span>
                </button>
            )}
        </SettingsSection>
    )
}
