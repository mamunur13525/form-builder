import {
    useRef,
    useState,
    type ComponentType,
    type ReactElement,
    type ReactNode,
} from "react"
import { ImagePlus, Loader2, Trash2, Asterisk } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Popover,
    PopoverContent,
    PopoverDescription,
    PopoverHeader,
    PopoverTitle,
    PopoverTrigger,
} from "@/components/ui/popover"
import { RadioGroup, RadioGroupCard } from "@/components/ui/radio-group"
import { uploadFile } from "@/entities/upload/api/upload.api"
import { showError } from "@/shared/hooks/useToast"
import type { CoverImage } from "@/shared/types/common"
import { cn } from "@/lib/utils"

/** Shared control geometry so every settings input lines up. */
const CONTROL_CLASS =
    "editorial-transition h-[44px] rounded-[14px] border-[var(--input)] bg-[var(--secondary)] text-sm text-[var(--foreground)] hover:border-[var(--editorial-primary-ring)] focus-visible:border-[var(--ring)]"

/** Portalled surfaces escape the `.editorial` subtree, so they opt back in. */
const OVERLAY_CLASS =
    "editorial rounded-[18px] border border-[var(--border)] bg-[var(--popover)] text-[var(--foreground)]"

/**
 * Editorial button treatments, matching PublishDialog so confirmation prompts
 * and drawer footers read as the same product surface.
 */

/**
 * Segmented pill tabs: the list is an inset track, the active tab a raised
 * card. Keep `TabsList` on its default variant — the `line` variant forces
 * `data-active:bg-transparent` and would cancel the raised fill.
 */
export const TAB_LIST_CLASS =
    "h-auto w-full gap-1 rounded-[18px] border border-[var(--editorial-border-light)] bg-[var(--editorial-canvas)] p-1.5 text-[var(--editorial-body)] group-data-horizontal/tabs:h-auto"

export const TAB_TRIGGER_CLASS =
    "editorial-transition flex-1 gap-2 rounded-[13px] border border-transparent px-3 py-2.5 text-sm font-medium text-[var(--editorial-subtle)] hover:bg-[var(--editorial-primary-light)] hover:text-[var(--foreground)] data-active:border-[var(--editorial-border-light)] data-active:bg-[var(--card)] data-active:text-[var(--foreground)] data-active:shadow-[0_2px_8px_rgba(24,20,18,.06)] focus-visible:ring-[3px] focus-visible:ring-[var(--editorial-primary-ring)] focus-visible:outline-none"

const FIELD_LABEL_CLASS = "text-sm font-medium text-[var(--editorial-body)]"

const HINT_CLASS = "text-xs leading-5 text-[var(--editorial-subtle)]"

/** A label + control + optional hint stack, used by every field below. */
function Field({
    label,
    hint,
    htmlFor,
    children,
    className,
}: {
    label: string
    hint?: string
    htmlFor?: string
    children: ReactNode
    className?: string
}) {
    return (
        <div className={cn("space-y-1.5", className)}>
            <Label htmlFor={htmlFor} className={FIELD_LABEL_CLASS}>
                {label}
            </Label>
            {children}
            {hint && <p className={HINT_CLASS}>{hint}</p>}
        </div>
    )
}

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
                className="h-[52px] rounded-2xl border-[var(--input)] bg-[var(--secondary)] px-5 text-base"
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

export type SelectSettingOption<T extends string> = {
    value: T
    label: string
}

/**
 * A labeled select driven by an options array, so callers describe choices as
 * data instead of repeating trigger/content/item markup per field.
 */
export function SelectSetting<T extends string>({
    label,
    hint,
    value,
    options,
    onChange,
    placeholder,
    className,
}: {
    label: string
    hint?: string
    value: T
    options: readonly SelectSettingOption<T>[]
    onChange: (value: T) => void
    placeholder?: string
    className?: string
}) {
    return (
        <Field label={label} hint={hint} className={className}>
            <Select
                value={value}
                onValueChange={(next: T | null) => {
                    if (!next) return
                    onChange(next)
                }}
            >
                <SelectTrigger className={cn(CONTROL_CLASS, "w-full")}>
                    <SelectValue placeholder={placeholder ?? `Select ${label}`} />
                </SelectTrigger>
                <SelectContent className={OVERLAY_CLASS}>
                    {options.map((option) => (
                        <SelectItem
                            key={option.value}
                            value={option.value}
                            className="rounded-[12px]"
                        >
                            {option.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </Field>
    )
}

export type IconChoiceOption<T extends string> = {
    value: T
    label: string
    /** Any component taking `className`: a lucide icon or a custom preview swatch. */
    icon: ComponentType<{ className?: string }>
    /** Optional longer text for the tile's tooltip/title attribute. */
    title?: string
}

/**
 * An icon-led radio group rendered as tiles. Preferred over `SelectSetting`
 * for short, visual option sets (alignment, size, corner radius) where seeing
 * every choice at once is faster than opening a dropdown.
 */
export function IconChoiceSetting<T extends string>({
    label,
    hint,
    value,
    options,
    onChange,
    columns,
    hideLabels,
}: {
    label: string
    hint?: string
    value: T
    options: readonly IconChoiceOption<T>[]
    onChange: (value: T) => void
    /** Defaults to one column per option, which suits 3-5 choices. */
    columns?: number
    /** Show icons only, with the text moved to each tile's tooltip. */
    hideLabels?: boolean
}) {
    return (
        <Field label={label} hint={hint}>
            <RadioGroup
                value={value}
                onValueChange={(next) => {
                    if (typeof next !== "string") return
                    onChange(next as T)
                }}
                aria-label={label}
                className="gap-1 rounded-[16px] border border-[var(--editorial-border-light)] bg-[var(--editorial-canvas)] p-1.5"
                style={{
                    gridTemplateColumns: `repeat(${columns ?? options.length}, minmax(0, 1fr))`,
                }}
            >
                {options.map((option) => {
                    const Icon = option.icon
                    return (
                        <RadioGroupCard
                            key={option.value}
                            value={option.value}
                            title={option.title ?? option.label}
                            className={cn(
                                "editorial-transition text-[var(--editorial-subtle)] gap-1",
                                "hover:bg-[var(--card)]/60 hover:text-[var(--foreground)]",
                                "data-checked:border-[var(--editorial-border-light)] data-checked:bg-[var(--card)]",
                                "data-checked:text-[var(--foreground)] data-checked:shadow-[0_2px_8px_rgba(24,20,18,.06)]",
                                "data-checked:[&>:first-child]:text-[var(--primary)]"
                            )}
                        >
                            <Icon className="h-[24px] w-[24px]" />
                            {!hideLabels && (
                                <span className="w-full text-xs truncate text-center">{option.label}</span>
                            )}
                        </RadioGroupCard>
                    )
                })}
            </RadioGroup>
        </Field>
    )
}

/** A labeled text input sized for the compact settings column. */
export function InputSetting({
    label,
    hint,
    value,
    onChange,
    placeholder,
    type = "text",
    trailing,
}: {
    label: string
    hint?: string
    value: string
    onChange: (value: string) => void
    placeholder?: string
    type?: string
    trailing?: ReactNode
}) {
    return (
        <Field label={label} hint={hint}>
            <div className="flex items-center gap-2">
                <Input
                    type={type}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className={cn(CONTROL_CLASS, "flex-1 px-4")}
                />
                {trailing}
            </div>
        </Field>
    )
}

/** A swatch + hex input pair kept in sync on a single colour value. */
export function ColorSetting({
    label,
    value,
    onChange,
    fallback,
}: {
    label: string
    value: string | undefined
    onChange: (value: string) => void
    fallback: string
}) {
    const current = value || fallback
    return (
        <Field label={label} className="flex items-center justify-between">

            <div className="flex items-center ml-2">
                <Input
                    type="text"
                    value={current}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={fallback}
                    className={cn(CONTROL_CLASS, "font-mono uppercase w-24 border-r-transparent rounded-r-none")}
                />
                <span className="editorial-transition relative h-[44px] w-[44px] shrink-0 overflow-hidden rounded-[14px] rounded-l-none border border-l-transparent border-[var(--input)] bg-[var(--secondary)] p-1 hover:border-[var(--editorial-primary-ring)]">
                    <input
                        type="color"
                        aria-label={label}
                        value={current}
                        onChange={(e) => onChange(e.target.value)}
                        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                    />
                    <span
                        aria-hidden
                        className="block h-full w-full rounded-[10px] border border-[var(--editorial-border-light)]"
                        style={{ backgroundColor: current }}
                    />
                </span>

            </div>
        </Field>
    )
}

/** A labeled range slider that shows its current value beside the label. */
export function RangeSetting({
    label,
    value,
    onChange,
    min,
    max,
    step,
}: {
    label: string
    value: number
    onChange: (value: number) => void
    min: number
    max: number
    step?: number
}) {
    return (
        <div className="space-y-1.5">
            <div
                className={cn(
                    "flex items-center justify-between",
                    FIELD_LABEL_CLASS
                )}
            >
                <span>{label}</span>
                <span className="tabular-nums text-[var(--editorial-subtle)]">
                    {value}
                </span>
            </div>
            <input
                type="range"
                aria-label={label}
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                className="h-2 w-full cursor-pointer appearance-none rounded-full border border-[var(--editorial-border-light)] bg-[var(--muted)] accent-[var(--primary)]"
            />
        </div>
    )
}

/**
 * Wraps a trigger button in a yes/no confirmation popover. `open` stays with the
 * caller so it can suppress the prompt when there is nothing to confirm.
 */
export function ConfirmPopover({
    open,
    onOpenChange,
    trigger,
    title,
    description,
    confirmLabel = "Yes",
    cancelLabel = "No",
    onConfirm,
    confirmDisabled,
    destructive,
    align = "center",
}: {
    open: boolean
    onOpenChange: (open: boolean) => void
    trigger: ReactElement
    title: string
    description: string
    confirmLabel?: string
    cancelLabel?: string
    onConfirm: () => void
    confirmDisabled?: boolean
    destructive?: boolean
    align?: "start" | "center" | "end"
}) {
    return (
        <Popover open={open} onOpenChange={onOpenChange}>
            <PopoverTrigger render={trigger} />
            <PopoverContent
                className={cn(OVERLAY_CLASS, "editorial-shadow-md w-80")}
                align={align}
                side="top"
                sideOffset={16}
            >
                <PopoverHeader>
                    <PopoverTitle className="text-[var(--foreground)]">{title}</PopoverTitle>
                    <PopoverDescription className="text-[var(--editorial-body)]">
                        {description}
                    </PopoverDescription>
                </PopoverHeader>
                <div className="mt-4 flex justify-end gap-2">
                    <Button
                        variant="outline"
                        size="lg"
                        className="editorial-transition h-11 gap-2 rounded-[16px] border-[var(--border)] bg-[var(--card)] px-6 text-sm text-[var(--foreground)] hover:-translate-y-0.5 hover:border-[var(--editorial-primary-ring)] hover:bg-[var(--editorial-primary-light)] active:translate-y-0 active:scale-[.98] disabled:pointer-events-none disabled:opacity-50"
                        onClick={() => onOpenChange(false)}
                    >
                        {cancelLabel}
                    </Button>
                    <Button
                        size="lg"
                        onClick={onConfirm}
                        disabled={confirmDisabled}
                        className={destructive ?
                            "editorial-transition h-11 gap-2 rounded-[16px] border border-[var(--destructive)]/25 bg-[var(--destructive)]/10 px-6 text-sm font-medium text-[var(--destructive)] hover:-translate-y-0.5 hover:bg-[var(--destructive)]/16 active:translate-y-0 active:scale-[.98] disabled:pointer-events-none disabled:opacity-50"
                            : "editorial-transition h-11 gap-2 rounded-[16px] bg-[var(--primary)] px-6 text-sm font-medium text-[var(--primary-foreground)] hover:bg-[var(--editorial-primary-hover)] active:translate-y-0 active:scale-[.98] active:bg-[var(--editorial-primary-pressed)] disabled:pointer-events-none disabled:opacity-50"}
                    >
                        {confirmLabel}
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
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
