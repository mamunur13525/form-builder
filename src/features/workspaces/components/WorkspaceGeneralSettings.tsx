import { useEffect, useState } from "react"
import { Check, ImagePlus, Loader2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { uploadFile } from "@/entities/upload/api/upload.api"
import {
    ASSIGNABLE_WORKSPACE_ROLES,
    WORKSPACE_ROLE_DESCRIPTIONS,
    WORKSPACE_ROLE_LABELS,
    WORKSPACE_VISIBILITY_DESCRIPTIONS,
    WORKSPACE_VISIBILITY_LABELS,
    hasWorkspacePermission,
    type AssignableWorkspaceRole,
    type WorkspaceDetail,
    type WorkspaceVisibility,
} from "@/entities/workspace/model/types"
import {
    useSlugAvailability,
    useUpdateWorkspace,
    useUpdateWorkspaceSettings,
} from "@/features/workspaces/hooks/useWorkspaces"
import { showError } from "@/shared/hooks/useToast"

interface WorkspaceGeneralSettingsProps {
    workspace: WorkspaceDetail
}

const inputClass =
    "h-[52px] rounded-lg border-[var(--input)] bg-[var(--secondary)] px-6 text-base placeholder:text-[var(--editorial-subtle)]"

const cardClass = "rounded-[24px] border border-[var(--border)] bg-[var(--card)] p-8"

/** Mirrors the server's slug rules so the field can never submit something invalid. */
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

const VISIBILITY_OPTIONS: WorkspaceVisibility[] = ["private", "workspace", "public"]

/**
 * Identity fields — name, URL, logo, description.
 *
 * A save-on-submit form rather than save-on-change, because renaming a slug
 * breaks existing links and should be deliberate. All four fields seed from the
 * workspace once; the parent remounts this via `key` when the canonical values
 * change, which is what re-syncs it after a save or a workspace switch.
 */
function IdentityCard({
    workspace,
    canEdit,
}: {
    workspace: WorkspaceDetail
    canEdit: boolean
}) {
    const updateWorkspace = useUpdateWorkspace(workspace.id)

    const [name, setName] = useState(workspace.name)
    const [slug, setSlug] = useState(workspace.slug)
    const [description, setDescription] = useState(workspace.description)
    const [logoUrl, setLogoUrl] = useState(workspace.logoUrl)
    const [isUploading, setIsUploading] = useState(false)
    const [debouncedSlug, setDebouncedSlug] = useState(workspace.slug)

    useEffect(() => {
        const timer = window.setTimeout(() => setDebouncedSlug(slug), 400)
        return () => window.clearTimeout(timer)
    }, [slug])

    // Only ask the server about a slug that actually differs from the current one.
    const slugChanged = slug !== workspace.slug
    const { data: availability, isFetching: isCheckingSlug } = useSlugAvailability(
        debouncedSlug,
        slugChanged && debouncedSlug !== workspace.slug,
    )

    const slugTaken =
        slugChanged &&
        debouncedSlug === slug &&
        !isCheckingSlug &&
        availability?.available === false

    const isDirty =
        name !== workspace.name ||
        slug !== workspace.slug ||
        description !== workspace.description ||
        logoUrl !== workspace.logoUrl

    const canSave =
        isDirty &&
        name.trim().length >= 2 &&
        slug.length >= 3 &&
        !slugTaken &&
        !isUploading &&
        !updateWorkspace.isPending

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

    const handleSave = () => {
        if (!canSave) return

        // Send only what changed — the API treats every field as optional.
        updateWorkspace.mutate({
            ...(name !== workspace.name ? { name: name.trim() } : {}),
            ...(slug !== workspace.slug ? { slug } : {}),
            ...(description !== workspace.description ? { description } : {}),
            ...(logoUrl !== workspace.logoUrl ? { logoUrl } : {}),
        })
    }

    const handleReset = () => {
        setName(workspace.name)
        setSlug(workspace.slug)
        setDescription(workspace.description)
        setLogoUrl(workspace.logoUrl)
    }

    return (
        <section className={cardClass}>
            <h2 className="font-display text-2xl text-[var(--foreground)]">General</h2>
            <p className="mt-1 text-sm text-[var(--editorial-body)]">
                How this workspace appears to everyone in it.
            </p>

            <div className="mt-8 space-y-6">
                {/* Logo */}
                <div className="space-y-2">
                    <Label className="text-sm text-[var(--editorial-body)]">Logo</Label>
                    <div className="flex items-center gap-4">
                        {logoUrl ? (
                            <div className="relative">
                                <img
                                    src={logoUrl}
                                    alt=""
                                    className="h-16 w-16 rounded-[16px] border border-[var(--editorial-border-light)] object-cover"
                                />
                                {canEdit && (
                                    <button
                                        type="button"
                                        onClick={() => setLogoUrl("")}
                                        aria-label="Remove logo"
                                        className="editorial-transition absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--card)] text-[var(--editorial-body)] hover:text-[var(--foreground)]"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                )}
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

                        {canEdit && (
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
                        )}
                    </div>
                </div>

                {/* Name */}
                <div className="space-y-2">
                    <Label
                        htmlFor="settings-name"
                        className="text-sm text-[var(--editorial-body)]"
                    >
                        Workspace name
                    </Label>
                    <Input
                        id="settings-name"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        disabled={!canEdit}
                        className={inputClass}
                    />
                </div>

                {/* Slug */}
                <div className="space-y-2">
                    <Label
                        htmlFor="settings-slug"
                        className="text-sm text-[var(--editorial-body)]"
                    >
                        Workspace URL
                    </Label>
                    <div className="flex items-center gap-2">
                        <span className="shrink-0 text-sm text-[var(--editorial-subtle)]">
                            /w/
                        </span>
                        <Input
                            id="settings-slug"
                            value={slug}
                            onChange={(event) => setSlug(slugify(event.target.value))}
                            disabled={!canEdit}
                            className={inputClass + " flex-1"}
                        />
                    </div>
                    {isCheckingSlug && slugChanged && (
                        <p className="flex items-center gap-2 text-xs text-[var(--editorial-subtle)]">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            Checking availability…
                        </p>
                    )}
                    {slugTaken && availability && (
                        <p className="text-xs text-[var(--destructive)]">
                            That URL is taken. Try{" "}
                            <button
                                type="button"
                                onClick={() => setSlug(availability.suggestion)}
                                className="underline underline-offset-2"
                            >
                                {availability.suggestion}
                            </button>
                            .
                        </p>
                    )}
                    {slugChanged && !slugTaken && !isCheckingSlug && (
                        <p className="flex items-center gap-2 text-xs text-[var(--editorial-body)]">
                            <Check className="h-3 w-3" />
                            Changing the URL breaks existing links to this workspace.
                        </p>
                    )}
                </div>

                {/* Description */}
                <div className="space-y-2">
                    <Label
                        htmlFor="settings-description"
                        className="text-sm text-[var(--editorial-body)]"
                    >
                        Description
                        <span className="ml-2 text-xs text-[var(--editorial-subtle)]">
                            Optional
                        </span>
                    </Label>
                    <Input
                        id="settings-description"
                        value={description}
                        onChange={(event) => setDescription(event.target.value)}
                        placeholder="What this workspace is for"
                        disabled={!canEdit}
                        className={inputClass}
                    />
                </div>
            </div>

            {canEdit && (
                <div className="mt-8 flex items-center justify-end gap-3 border-t border-[var(--editorial-border-light)] pt-6">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={handleReset}
                        disabled={!isDirty || updateWorkspace.isPending}
                        className="h-11 rounded-[16px] px-5 text-[var(--editorial-body)]"
                    >
                        Discard
                    </Button>
                    <Button
                        type="button"
                        onClick={handleSave}
                        disabled={!canSave}
                        className="editorial-transition h-11 rounded-[16px] bg-[var(--primary)] px-6 text-sm font-medium text-white hover:bg-[var(--editorial-primary-hover)] active:scale-[.98]"
                    >
                        {updateWorkspace.isPending ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Saving…
                            </>
                        ) : (
                            "Save changes"
                        )}
                    </Button>
                </div>
            )}
        </section>
    )
}

/**
 * Workspace defaults and visibility.
 *
 * These are single-value switches with no intermediate state worth confirming,
 * so each one saves as it changes; the fields read straight from the server copy
 * rather than a local mirror.
 */
function DefaultsCard({
    workspace,
    canEdit,
}: {
    workspace: WorkspaceDetail
    canEdit: boolean
}) {
    const updateSettings = useUpdateWorkspaceSettings(workspace.id)

    return (
        <section className={cardClass}>
            <h2 className="font-display text-2xl text-[var(--foreground)]">Defaults</h2>
            <p className="mt-1 text-sm text-[var(--editorial-body)]">
                Applied to new members and new invitations. Saved as you change them.
            </p>

            <div className="mt-8 space-y-6">
                {/* Visibility */}
                <div className="space-y-2">
                    <Label className="text-sm text-[var(--editorial-body)]">
                        Workspace visibility
                    </Label>
                    <Select
                        value={workspace.settings.visibility}
                        onValueChange={(value) =>
                            updateSettings.mutate({
                                visibility: value as WorkspaceVisibility,
                            })
                        }
                        disabled={!canEdit}
                    >
                        <SelectTrigger className={inputClass + " w-full"}>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="editorial">
                            {VISIBILITY_OPTIONS.map((option) => (
                                <SelectItem key={option} value={option}>
                                    <span className="flex flex-col items-start">
                                        <span className="text-sm text-[var(--foreground)]">
                                            {WORKSPACE_VISIBILITY_LABELS[option]}
                                        </span>
                                        <span className="text-xs text-[var(--editorial-subtle)]">
                                            {WORKSPACE_VISIBILITY_DESCRIPTIONS[option]}
                                        </span>
                                    </span>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Default role for new members */}
                <div className="space-y-2">
                    <Label className="text-sm text-[var(--editorial-body)]">
                        Default role for new members
                    </Label>
                    <Select
                        value={workspace.settings.defaultMemberRole}
                        onValueChange={(value) =>
                            updateSettings.mutate({
                                defaultMemberRole: value as AssignableWorkspaceRole,
                            })
                        }
                        disabled={!canEdit}
                    >
                        <SelectTrigger className={inputClass + " w-full"}>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="editorial">
                            {ASSIGNABLE_WORKSPACE_ROLES.map((option) => (
                                <SelectItem key={option} value={option}>
                                    <span className="flex flex-col items-start">
                                        <span className="text-sm text-[var(--foreground)]">
                                            {WORKSPACE_ROLE_LABELS[option]}
                                        </span>
                                        <span className="text-xs text-[var(--editorial-subtle)]">
                                            {WORKSPACE_ROLE_DESCRIPTIONS[option]}
                                        </span>
                                    </span>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Toggles */}
                <div className="flex items-start justify-between gap-6 rounded-[18px] border border-[var(--editorial-border-light)] bg-[var(--secondary)] p-6">
                    <div>
                        <p className="text-sm text-[var(--foreground)]">
                            Let members invite people
                        </p>
                        <p className="mt-1 text-xs leading-5 text-[var(--editorial-body)]">
                            When off, only owners and admins can send invitations.
                        </p>
                    </div>
                    <Switch
                        checked={workspace.settings.allowMemberInvites}
                        disabled={!canEdit}
                        onCheckedChange={(checked) =>
                            updateSettings.mutate({ allowMemberInvites: checked })
                        }
                    />
                </div>

                <div className="flex items-start justify-between gap-6 rounded-[18px] border border-[var(--editorial-border-light)] bg-[var(--secondary)] p-6">
                    <div>
                        <p className="text-sm text-[var(--foreground)]">
                            Require approval for invitations
                        </p>
                        <p className="mt-1 text-xs leading-5 text-[var(--editorial-body)]">
                            Invitations raised by members wait for an admin to approve
                            them.
                        </p>
                    </div>
                    <Switch
                        checked={workspace.settings.requireInviteApproval}
                        disabled={!canEdit}
                        onCheckedChange={(checked) =>
                            updateSettings.mutate({ requireInviteApproval: checked })
                        }
                    />
                </div>
            </div>

            {!canEdit && (
                <p className="mt-6 text-xs text-[var(--editorial-subtle)]">
                    Only owners and admins can change these.
                </p>
            )}
        </section>
    )
}

/**
 * General information and default settings for a workspace.
 *
 * Split into two cards because the API splits the saves: identity (name / slug /
 * logo / description) goes to `PATCH /:id`, defaults go to
 * `PATCH /:id/settings`.
 *
 * The identity card is keyed on its own field values so that switching
 * workspaces — or saving — remounts it and reseeds the inputs from the server
 * copy, instead of mirroring props into state inside an effect.
 */
export function WorkspaceGeneralSettings({ workspace }: WorkspaceGeneralSettingsProps) {
    const canEditWorkspace = hasWorkspacePermission(workspace, "workspace:update")
    const canEditSettings = hasWorkspacePermission(workspace, "settings:update")

    const identityKey = [
        workspace.id,
        workspace.name,
        workspace.slug,
        workspace.description,
        workspace.logoUrl,
    ].join("|")

    return (
        <div className="space-y-6">
            <IdentityCard
                key={identityKey}
                workspace={workspace}
                canEdit={canEditWorkspace}
            />
            <DefaultsCard workspace={workspace} canEdit={canEditSettings} />
        </div>
    )
}
