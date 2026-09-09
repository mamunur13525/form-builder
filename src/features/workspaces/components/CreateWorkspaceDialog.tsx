import { useEffect, useState } from "react"
import { Check, ImagePlus, Loader2, X } from "lucide-react"
import {
    Dialog,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { uploadFile } from "@/entities/upload/api/upload.api"
import { showError } from "@/shared/hooks/useToast"
import {
    useCreateWorkspace,
    useSlugAvailability,
} from "@/features/workspaces/hooks/useWorkspaces"

interface CreateWorkspaceDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

const inputClass =
    "h-[52px] rounded-lg border-[var(--input)] bg-[var(--secondary)] px-6 text-base placeholder:text-[var(--editorial-subtle)]"

/** Mirrors the server's `generateWorkspaceSlug` so the preview matches. */
function slugify(value: string): string {
    return value
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_]+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 48)
}

/**
 * Create a workspace: name, URL handle and optional logo.
 *
 * The slug field auto-follows the name until the user edits it, after which it
 * is left alone — a half-typed handle should not be overwritten on the next
 * keystroke in the name field.
 */
export function CreateWorkspaceDialog({
    open,
    onOpenChange,
}: CreateWorkspaceDialogProps) {
    const [name, setName] = useState("")
    const [slug, setSlug] = useState("")
    const [slugEdited, setSlugEdited] = useState(false)
    const [logoUrl, setLogoUrl] = useState("")
    const [isUploading, setIsUploading] = useState(false)
    const [debouncedSlug, setDebouncedSlug] = useState("")

    const createWorkspace = useCreateWorkspace()

    /**
     * Clears the form on the way out, so reopening never shows the previous
     * attempt. Done here rather than in an effect because every close path —
     * cancel, overlay click, successful create — runs through this handler.
     */
    const handleOpenChange = (next: boolean) => {
        if (!next) {
            setName("")
            setSlug("")
            setSlugEdited(false)
            setLogoUrl("")
            setDebouncedSlug("")
        }
        onOpenChange(next)
    }

    const effectiveSlug = slugEdited ? slug : slugify(name)

    // Debounced so typing a handle does not fire a request per keystroke.
    useEffect(() => {
        const timer = window.setTimeout(() => setDebouncedSlug(effectiveSlug), 400)
        return () => window.clearTimeout(timer)
    }, [effectiveSlug])

    const { data: availability, isFetching: isCheckingSlug } = useSlugAvailability(
        debouncedSlug,
        open,
    )

    const showAvailability =
        debouncedSlug.length >= 3 && debouncedSlug === effectiveSlug && !isCheckingSlug

    const handleLogoChange = async (file: File | undefined) => {
        if (!file) return

        setIsUploading(true)
        try {
            const uploaded = await uploadFile(file)
            setLogoUrl(uploaded.url)
        } catch (error) {
            showError("Could not upload logo", error)
        } finally {
            setIsUploading(false)
        }
    }

    const canSubmit =
        name.trim().length >= 2 &&
        effectiveSlug.length >= 3 &&
        !isUploading &&
        !createWorkspace.isPending &&
        availability?.available !== false

    const handleSubmit = () => {
        if (!canSubmit) return

        createWorkspace.mutate(
            {
                name: name.trim(),
                slug: effectiveSlug,
                ...(logoUrl ? { logoUrl } : {}),
            },
            {
                onSuccess: () => handleOpenChange(false),
            },
        )
    }

    return (
        <Dialog
            open={open}
            onOpenChange={handleOpenChange}
            className="editorial max-w-lg rounded-[24px] border-[var(--border)] bg-[var(--card)] p-8"
        >
            <DialogHeader>
                <DialogTitle className="font-display text-2xl text-[var(--foreground)]">
                    Create a workspace
                </DialogTitle>
                <DialogDescription className="mt-2 text-sm text-[var(--editorial-body)]">
                    Workspaces keep forms, members and settings separate. You can rename
                    or delete one later.
                </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
                {/* Logo */}
                <div className="space-y-2">
                    <Label className="text-sm text-[var(--editorial-body)]">
                        Logo
                        <span className="ml-2 text-xs text-[var(--editorial-subtle)]">
                            Optional
                        </span>
                    </Label>
                    <div className="flex items-center gap-4">
                        {logoUrl ? (
                            <div className="relative">
                                <img
                                    src={logoUrl}
                                    alt=""
                                    className="h-16 w-16 rounded-[16px] border border-[var(--editorial-border-light)] object-cover"
                                />
                                <button
                                    type="button"
                                    onClick={() => setLogoUrl("")}
                                    aria-label="Remove logo"
                                    className="editorial-transition absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--card)] text-[var(--editorial-body)] hover:text-[var(--foreground)]"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </div>
                        ) : (
                            <span className="flex h-16 w-16 items-center justify-center rounded-[16px] border border-dashed border-[var(--editorial-border-light)] bg-[var(--secondary)] text-[var(--editorial-subtle)]">
                                {isUploading ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    <ImagePlus className="h-5 w-5" />
                                )}
                            </span>
                        )}

                        <label className="editorial-transition inline-flex h-11 cursor-pointer items-center rounded-[16px] border border-[var(--border)] bg-[var(--card)] px-5 text-sm text-[var(--editorial-body)] hover:border-[var(--editorial-primary-ring)] hover:text-[var(--foreground)]">
                            {logoUrl ? "Replace" : "Upload image"}
                            <input
                                type="file"
                                accept="image/*"
                                className="sr-only"
                                disabled={isUploading}
                                onChange={(event) =>
                                    handleLogoChange(event.target.files?.[0])
                                }
                            />
                        </label>
                    </div>
                </div>

                {/* Name */}
                <div className="space-y-2">
                    <Label htmlFor="workspace-name" className="text-sm text-[var(--editorial-body)]">
                        Workspace name
                    </Label>
                    <Input
                        id="workspace-name"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        placeholder="Acme Marketing"
                        className={inputClass}
                        autoFocus
                    />
                </div>

                {/* Slug */}
                <div className="space-y-2">
                    <Label htmlFor="workspace-slug" className="text-sm text-[var(--editorial-body)]">
                        Workspace URL
                    </Label>
                    <div className="flex items-center gap-2">
                        <span className="shrink-0 text-sm text-[var(--editorial-subtle)]">
                            /w/
                        </span>
                        <Input
                            id="workspace-slug"
                            value={effectiveSlug}
                            onChange={(event) => {
                                setSlugEdited(true)
                                setSlug(slugify(event.target.value))
                            }}
                            placeholder="acme-marketing"
                            className={inputClass + " flex-1"}
                        />
                    </div>

                    {/* Availability feedback — the only place a coral accent appears here. */}
                    {isCheckingSlug && debouncedSlug.length >= 3 && (
                        <p className="flex items-center gap-2 text-xs text-[var(--editorial-subtle)]">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            Checking availability…
                        </p>
                    )}
                    {showAvailability && availability?.available && (
                        <p className="flex items-center gap-2 text-xs text-[var(--editorial-body)]">
                            <Check className="h-3 w-3" />
                            /{availability.slug} is available
                        </p>
                    )}
                    {showAvailability && availability && !availability.available && (
                        <p className="text-xs text-[var(--destructive)]">
                            That URL is taken. Try{" "}
                            <button
                                type="button"
                                onClick={() => {
                                    setSlugEdited(true)
                                    setSlug(availability.suggestion)
                                }}
                                className="underline underline-offset-2"
                            >
                                {availability.suggestion}
                            </button>
                            .
                        </p>
                    )}
                    {effectiveSlug.length > 0 && effectiveSlug.length < 3 && (
                        <p className="text-xs text-[var(--editorial-subtle)]">
                            URLs need at least 3 characters.
                        </p>
                    )}
                </div>
            </div>

            <DialogFooter className="mt-8">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleOpenChange(false)}
                    className="h-11 rounded-[16px] border-[var(--border)] px-6"
                >
                    Cancel
                </Button>
                <Button
                    type="button"
                    onClick={handleSubmit}
                    disabled={!canSubmit}
                    className="editorial-transition h-11 rounded-[16px] bg-[var(--primary)] px-6 text-sm font-medium text-white hover:bg-[var(--editorial-primary-hover)] active:scale-[.98]"
                >
                    {createWorkspace.isPending ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Creating…
                        </>
                    ) : (
                        "Create workspace"
                    )}
                </Button>
            </DialogFooter>
        </Dialog>
    )
}
