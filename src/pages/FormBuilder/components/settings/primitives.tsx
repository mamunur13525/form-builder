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

/** Shared control geometry so every settings input lines up. Exported for the
 * type-specific widget files (choice/phone/rating/type-settings) so ad-hoc
 * controls stay pixel-identical to the primitives. */
export const CONTROL_CLASS =
    "transition-colors h-[40px] rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#1a1a20] text-sm text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 hover:border-slate-300 dark:hover:border-zinc-700 focus-visible:border-[#FF5722] focus-visible:ring-1 focus-visible:ring-[#FF5722] shadow-xs"

/** Portalled surfaces escape the container, so they get standard popover styling. */
export const OVERLAY_CLASS =
    "rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#18181c] text-slate-900 dark:text-zinc-100 shadow-2xl p-1.5 z-50"

/**
 * Segmented pill tabs: the list is an inset track, the active tab a raised card.
 */
export const TAB_LIST_CLASS =
    "h-auto w-full gap-1 rounded-xl bg-slate-100 dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800/80 p-1 text-slate-600 dark:text-zinc-400 group-data-horizontal/tabs:h-auto"

export const TAB_TRIGGER_CLASS =
    "transition-all flex-1 gap-2 rounded-lg border border-transparent px-3 py-2 text-sm font-medium text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white data-active:border-slate-200 dark:data-active:border-zinc-700 data-active:bg-white dark:data-active:bg-[#1e1e24] data-active:text-slate-900 dark:data-active:text-white data-active:shadow-xs focus-visible:outline-none cursor-pointer"

const PAGE_LABEL_CLASS = "text-xs font-medium text-slate-700 dark:text-zinc-400"

const HINT_CLASS = "text-xs leading-4 text-slate-500 dark:text-zinc-500"

/** A label + control + optional hint stack, used by every page below. */
function Page({
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
            <Label htmlFor={htmlFor} className={PAGE_LABEL_CLASS}>
                {label}
            </Label>
            {children}
            {hint && <p className={HINT_CLASS}>{hint}</p>}
        </div>
    )
}

/** A labeled settings section with an optional description and icon. */
export function SettingsSection({
    title,
    description,
    children,
    className,
    icon,
}: {
    title: string
    description?: string
    children?: ReactNode
    className?: string
    icon?: ReactNode
}) {
    return (
        <div className={cn("space-y-3.5", className)}>
            {title && (
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        {icon}
                        <Label className="text-sm font-semibold text-slate-800 dark:text-zinc-100">
                            {title}
                        </Label>
                    </div>
                    {description && (
                        <p className="text-xs leading-4 text-slate-500 dark:text-zinc-500">
                            {description}
                        </p>
                    )}
                </div>
            )}
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
                        className="cursor-pointer text-sm font-medium text-slate-800 dark:text-zinc-200"
                    >
                        {label}
                    </Label>
                </div>
                <Switch
                    id={id}
                    checked={checked}
                    onCheckedChange={onCheckedChange}
                    className="data-checked:bg-[#FF5722] data-checked:border-[#FF5722]"
                />
            </div>
            {description && (
                <p className="text-xs leading-5 text-slate-500 dark:text-zinc-500">
                    {description}
                </p>
            )}
        </div>
    )
}

/** The "required page" toggle, shared by nearly every page type. */
export function RequiredToggle({
    checked,
    onCheckedChange,
    description = "If checked, users will be required to complete this page.",
}: {
    checked: boolean
    onCheckedChange: (checked: boolean) => void
    description?: string
}) {
    return (
        <ToggleRow
            id="required"
            label="Required page"
            description={description}
            checked={checked}
            onCheckedChange={onCheckedChange}
            icon={<Asterisk className="h-4 w-4 text-[#FF5722]" />}
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
                className={cn(CONTROL_CLASS, "px-4")}
            />
            {description && (
                <p className="text-xs leading-5 text-[var(--editorial-subtle)]">
                    {description}
                </p>
            )}
        </div>
    )
}

/** A labeled text input with optional leading icon. */
export function TextSetting({
    label,
    description,
    value,
    onChange,
    placeholder,
    icon,
}: {
    label?: string
    description?: string
    value: string
    onChange: (value: string) => void
    placeholder?: string
    icon?: ReactNode
}) {
    return (
        <div className="space-y-1.5">
            {label && <Label className="block text-xs font-medium text-slate-600 dark:text-zinc-400">{label}</Label>}
            <div className="relative flex items-center">
                {icon && (
                    <div className="pointer-events-none absolute left-3 flex items-center text-slate-400 dark:text-zinc-500">
                        {icon}
                    </div>
                )}
                <Input
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className={cn(CONTROL_CLASS, icon ? "pl-9" : "px-3.5")}
                />
            </div>
            {description && (
                <p className="text-xs leading-4 text-slate-500 dark:text-zinc-500">
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
 * data instead of repeating trigger/content/item markup per page.
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
        <Page label={label} hint={hint} className={className}>
            <Select
                value={value}
                onValueChange={(next: T | null) => {
                    if (!next) return
                    onChange(next)
                }}
            >
                <SelectTrigger className={cn(CONTROL_CLASS, "w-full text-slate-900 dark:text-zinc-100 [&>svg:last-child]:text-slate-400 dark:[&>svg:last-child]:text-zinc-500")}>
                    <SelectValue placeholder={placeholder ?? `Select ${label}`} className="text-slate-900 dark:text-zinc-100 font-medium" />
                </SelectTrigger>
                <SelectContent className={OVERLAY_CLASS}>
                    {options.map((option) => (
                        <SelectItem
                            key={option.value}
                            value={option.value}
                            className="cursor-pointer rounded-lg px-3 py-2 text-sm font-medium text-slate-700 dark:text-zinc-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 focus:bg-slate-100 dark:focus:bg-zinc-800 focus:text-slate-900 dark:focus:text-white"
                        >
                            <span className="text-slate-800 dark:text-zinc-100 font-medium">{option.label}</span>
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </Page>
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
        <Page label={label} hint={hint}>
            <RadioGroup
                value={value}
                onValueChange={(next) => {
                    if (typeof next !== "string") return
                    onChange(next as T)
                }}
                aria-label={label}
                className="gap-1 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-100 dark:bg-zinc-900/90 p-1"
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
                                "flex flex-col items-center justify-center gap-1.5 rounded-lg py-2.5 px-1 text-slate-600 dark:text-zinc-400 transition-all cursor-pointer",
                                "hover:bg-slate-200/70 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-zinc-200",
                                "data-checked:border data-checked:border-slate-300/80 dark:data-checked:border-zinc-700 data-checked:bg-white dark:data-checked:bg-zinc-800 data-checked:text-[#FF5722] data-checked:shadow-xs font-semibold"
                            )}
                        >
                            <Icon className="h-5 w-5" />
                            {!hideLabels && (
                                <span className="w-full text-xs truncate text-center font-medium">{option.label}</span>
                            )}
                        </RadioGroupCard>
                    )
                })}
            </RadioGroup>
        </Page>
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
        <Page label={label} hint={hint}>
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
        </Page>
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
        <Page label={label} className="flex items-center justify-between">
            <div className="flex items-center ml-2">
                <Input
                    type="text"
                    value={current}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={fallback}
                    className={cn(CONTROL_CLASS, "font-mono uppercase w-24 border-r-transparent rounded-r-none text-slate-900 dark:text-zinc-100")}
                />
                <span className="relative h-[40px] w-[40px] shrink-0 overflow-hidden rounded-xl rounded-l-none border border-l-transparent border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-[#1a1a20] p-1 hover:border-slate-300 dark:hover:border-zinc-700 transition-colors">
                    <input
                        type="color"
                        aria-label={label}
                        value={current}
                        onChange={(e) => onChange(e.target.value)}
                        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                    />
                    <span
                        aria-hidden
                        className="block h-full w-full rounded-lg border border-black/10 dark:border-white/10 shadow-inner"
                        style={{ backgroundColor: current }}
                    />
                </span>
            </div>
        </Page>
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
            <div className="flex items-center justify-between text-xs font-medium text-slate-600 dark:text-zinc-400">
                <span>{label}</span>
                <span className="tabular-nums font-semibold text-slate-900 dark:text-zinc-200">
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
                className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-200 dark:bg-zinc-800 accent-[#FF5722]"
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
                className={cn(OVERLAY_CLASS, "w-80 p-4 border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#18181c] text-slate-900 dark:text-zinc-100 shadow-xl")}
                align={align}
                side="top"
                sideOffset={16}
            >
                <PopoverHeader>
                    <PopoverTitle className="text-sm font-semibold text-slate-900 dark:text-white">{title}</PopoverTitle>
                    <PopoverDescription className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                        {description}
                    </PopoverDescription>
                </PopoverHeader>
                <div className="mt-4 flex justify-end gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-9 rounded-xl border-slate-200 dark:border-zinc-800 bg-slate-100 dark:bg-zinc-900 px-4 text-xs font-medium text-slate-700 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-white shadow-xs cursor-pointer"
                        onClick={() => onOpenChange(false)}
                    >
                        {cancelLabel}
                    </Button>
                    <Button
                        size="sm"
                        onClick={onConfirm}
                        disabled={confirmDisabled}
                        className={destructive ?
                            "h-9 rounded-xl bg-red-600 hover:bg-red-700 px-4 text-xs font-medium text-white shadow-xs cursor-pointer transition-colors"
                            : "h-9 rounded-xl bg-[#FF5722] hover:bg-[#F4511E] px-4 text-xs font-medium text-white shadow-xs cursor-pointer transition-colors"}
                    >
                        {confirmLabel}
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    )
}

/** Cover image upload + preview. Uploads via POST /uploads and stores {url,fileId}. */
export function CoverImagePage({
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
                    <div className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs">
                        <img
                            src={value.url}
                            alt={value.alt || "Cover"}
                            className="h-28 w-full object-cover"
                        />
                        {uploading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-white/70 dark:bg-[#141418]/70">
                                <Loader2 className="h-5 w-5 animate-spin text-[#FF5722]" />
                            </div>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => inputRef.current?.click()}
                            disabled={uploading}
                            className="flex-1 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-100 dark:bg-[#1a1a20] px-3 py-2 text-xs font-medium text-slate-700 dark:text-zinc-300 shadow-xs hover:bg-slate-200 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer disabled:pointer-events-none disabled:opacity-50"
                        >
                            Replace
                        </button>
                        <button
                            type="button"
                            onClick={() => onChange(null)}
                            disabled={uploading}
                            className="flex items-center justify-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs font-medium text-rose-500 dark:text-rose-400 hover:bg-rose-500/20 transition-colors cursor-pointer disabled:pointer-events-none disabled:opacity-50"
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
                    className="flex w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-900/40 py-7 px-4 text-center cursor-pointer hover:bg-slate-100/70 dark:hover:bg-zinc-900/80 hover:border-[#FF5722]/60 transition-all group disabled:pointer-events-none disabled:opacity-50"
                >
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#18181c] text-[#FF5722] shadow-xs group-hover:scale-105 transition-transform">
                        {uploading ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            <ImagePlus className="h-5 w-5" />
                        )}
                    </div>
                    <p className="mt-3 text-sm font-medium text-slate-800 dark:text-zinc-200">
                        {uploading ? "Uploading..." : "Add a cover image or drag & drop"}
                    </p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-zinc-500">
                        JPG, PNG, SVG • Max 5MB
                    </p>
                </button>
            )}
        </SettingsSection>
    )
}
