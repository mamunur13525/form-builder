import { useState } from "react"
import { Bell, Building2, Link2, Pencil, Shield, User as UserIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import {
    useCurrentUserProfile,
    useUpdateCurrentUserProfile,
} from "@/features/users/hooks/useUsers"
import { useChangePassword } from "@/features/auth/hooks/useAuth"
import { showError, showSuccess } from "@/shared/hooks/useToast"
import { cn } from "@/lib/utils"

const inputClass =
    "h-[52px] rounded-lg border-[var(--input)] bg-[var(--secondary)] px-6 text-base placeholder:text-[var(--editorial-subtle)]"


/** A titled settings block, matching the editorial card treatment. */
function SettingsCard({
    icon: Icon,
    title,
    description,
    children,
}: {
    icon: typeof UserIcon
    title: string
    description: string
    children: React.ReactNode
}) {
    return (
        <Card className="editorial-shadow-sm rounded-xl border-[var(--border)] bg-[var(--card)]">
            <CardContent className="p-5 sm:p-8">
                <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] border border-[var(--editorial-border-light)] bg-[var(--secondary)] text-[var(--primary)]">
                        <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <h2 className="font-display text-xl leading-tight sm:text-2xl text-[var(--foreground)]">
                            {title}
                        </h2>
                        <p className="mt-1 text-sm leading-6 sm:text-base text-[var(--editorial-body)]">
                            {description}
                        </p>
                    </div>
                </div>
                <div className="mt-6 space-y-6 sm:mt-8">{children}</div>
            </CardContent>
        </Card>
    )
}

export function SettingsPage() {
    const { data: user } = useCurrentUserProfile()
    const updateProfile = useUpdateCurrentUserProfile()
    const changePassword = useChangePassword()

    // Edits are held as overrides so the loaded profile can be shown without
    // copying it into state inside an effect.
    const [nameEdit, setNameEdit] = useState<string | null>(null)
    const [avatarEdit, setAvatarEdit] = useState<string | null>(null)
    const [currentPassword, setCurrentPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")

    // Notification preferences are local-only until a backend endpoint exists.
    const [emailOnResponse, setEmailOnResponse] = useState(true)
    const [weeklyDigest, setWeeklyDigest] = useState(false)

    // Local text for the avatar URL input, decoupled from the saved override.
    const [avatarInput, setAvatarInput] = useState("")
    const [avatarEditorOpen, setAvatarEditorOpen] = useState(false)
    const [isAvatarValid, setIsAvatarValid] = useState(true)

    const name = nameEdit ?? user?.name ?? ""
    const avatarUrl = avatarEdit ?? user?.avatarUrl ?? ""

    const handleProfileSave = () => {
        updateProfile.mutate(
            { name: name.trim(), avatarUrl: avatarUrl.trim() },
            {
                onSuccess: () => {
                    // Drop the overrides so the freshly saved profile is shown.
                    setNameEdit(null)
                    setAvatarEdit(null)
                    showSuccess("Profile updated")
                },
                onError: (error) => showError("Could not update profile", error),
            },
        )
    }

    const handlePasswordChange = () => {
        if (!currentPassword || !newPassword) {
            showError("Please fill in both password pages", null)
            return
        }
        changePassword.mutate(
            { currentPassword, newPassword },
            {
                onSuccess: () => {
                    setCurrentPassword("")
                    setNewPassword("")
                    showSuccess("Password changed")
                },
                 onError: (error) => showError("Could not change password", error),
            },
        )
    }

    const initialsOf = (userName: string | undefined): string => {
        if (!userName) return "?"
        return userName
            .trim()
            .split(/\s+/)
            .slice(0, 2)
            .map((part) => part[0]?.toUpperCase() ?? "")
            .join("")
    }

    const isValidAvatarUrl = (url: string): boolean => {
        try {
            const u = new URL(url)
            return /^https?:$/.test(u.protocol)
        } catch {
            return false
        }
    }

    const handleAvatarSave = () => {
        const trimmed = avatarInput.trim()
        if (!trimmed || !isValidAvatarUrl(trimmed)) {
            setIsAvatarValid(false)
            return
        }
        setAvatarEdit(trimmed)
        setAvatarEditorOpen(false)
    }

    return (
        <div className="editorial mx-auto w-full max-w-[900px] space-y-6 px-4 pt-8 pb-12 sm:space-y-12 sm:px-6 sm:pt-12 sm:pb-16 lg:px-8">
            <div>
                <h1 className="font-display text-[32px] leading-[1.1] sm:text-[48px] text-[var(--foreground)]">
                    Settings
                </h1>
                <p className="mt-1 text-sm leading-6 sm:mt-2 sm:text-base text-[var(--editorial-body)]">
                    Manage your profile, security and workspace preferences.
                </p>
            </div>

            <SettingsCard
                icon={UserIcon}
                title="Profile"
                description="How your name and picture appear across the workspace."
            >
                 <div className="space-y-2">
                    <Label htmlFor="settings-avatar" className="editorial-eyebrow text-[var(--editorial-subtle)]">
                        Avatar
                    </Label>
                    <div className="flex items-end gap-3">
                         <div className="relative -mb-1 flex h-20 w-20 shrink-0 items-center justify-center rounded-full border border-[var(--editorial-border-light)] bg-[var(--secondary)] text-[var(--foreground)]">
                            {avatarUrl ? (
                                <img
                                    src={avatarUrl}
                                    alt="Your avatar"
                                    className="h-full w-full object-cover rounded-full"
                                />
                            ) : (
                                <span className="text-xl font-semibold">
                                    {initialsOf(name || user?.name)}
                                </span>
                            )}
                            <button
                                type="button"
                                aria-label="Edit avatar"
                                onClick={() => {
                                    setAvatarInput(avatarUrl)
                                    setIsAvatarValid(true)
                                    setAvatarEditorOpen((open) => !open)
                                }}
                                className={cn(
                                    "editorial-transition absolute bottom-0.5 end-0.5 flex h-7 w-7 items-center justify-center rounded-full border border-[var(--editorial-border-light)] bg-[var(--secondary)] text-[var(--editorial-subtle)] shadow-sm",
                                    "hover:border-[var(--primary)] hover:bg-[var(--primary)] hover:text-white",
                                )}
                            >
                                <Pencil className="h-3.5 w-3.5" />
                            </button>
                        </div>
                        <span className="text-xs text-[var(--editorial-subtle)]">
                            Click the pencil to set an avatar URL.
                        </span>
                       
                    </div>
                     {avatarEditorOpen && (
                            <div className="space-y-3 pt-1">
                                <div className="space-y-1">
                                    <Label
                                        htmlFor="avatar-url"
                                        className="editorial-eyebrow text-[var(--editorial-subtle)]"
                                    >
                                        Image URL
                                    </Label>
                                    <div className="relative">
                                        <Link2 className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--editorial-subtle)]" />
                                        <Input
                                            id="avatar-url"
                                            value={avatarInput}
                                            onChange={(event) => {
                                                setAvatarInput(event.target.value)
                                                setIsAvatarValid(true)
                                            }}
                                            onKeyDown={(event) =>
                                                event.key === "Enter" && handleAvatarSave()
                                            }
                                            placeholder="https://example.com/photo.jpg"
                                            aria-invalid={!isAvatarValid}
                                            className={cn(
                                                inputClass,
                                                "pl-10",
                                                !isAvatarValid && "border-[var(--destructive)]",
                                            )}
                                        />
                                    </div>
                                    {!isAvatarValid && (
                                        <p className="text-xs leading-5 text-[var(--destructive)]">
                                            Please paste a valid HTTP(S) URL.
                                        </p>
                                    )}
                                </div>
                                <div className="flex justify-end gap-2">
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => setAvatarEditorOpen(false)}
                                        className="text-sm"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        size="sm"
                                        onClick={handleAvatarSave}
                                        className="text-sm"
                                    >
                                        Save
                                    </Button>
                                </div>
                            </div>
                        )}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="settings-name" className="editorial-eyebrow text-[var(--editorial-subtle)]">
                        Full name
                    </Label>
                    <Input
                        id="settings-name"
                        value={name}
                        onChange={(event) => setNameEdit(event.target.value)}
                        placeholder="Your name"
                        className={inputClass}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="settings-email" className="editorial-eyebrow text-[var(--editorial-subtle)]">
                        Email
                    </Label>
                    <Input
                        id="settings-email"
                        value={user?.email ?? ""}
                        readOnly
                        className={`${inputClass} text-[var(--editorial-subtle)]`}
                    />
                    <p className="text-xs leading-5 text-[var(--editorial-subtle)]">
                        Your sign-in email cannot be changed here.
                    </p>
                </div>
               
                <div className="flex justify-stretch sm:justify-end">
                    <Button
                        onClick={handleProfileSave}
                        disabled={updateProfile.isPending}
                    >
                        {updateProfile.isPending ? "Saving..." : "Save changes"}
                    </Button>
                </div>
            </SettingsCard>

            <SettingsCard
                icon={Shield}
                title="Security"
                description="Update the password you use to sign in."
            >
                <div className="space-y-2">
                    <Label htmlFor="settings-current-password" className="editorial-eyebrow text-[var(--editorial-subtle)]">
                        Current password
                    </Label>
                    <Input
                        id="settings-current-password"
                        type="password"
                        value={currentPassword}
                        onChange={(event) => setCurrentPassword(event.target.value)}
                        placeholder="••••••••"
                        className={inputClass}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="settings-new-password" className="editorial-eyebrow text-[var(--editorial-subtle)]">
                        New password
                    </Label>
                    <Input
                        id="settings-new-password"
                        type="password"
                        value={newPassword}
                        onChange={(event) => setNewPassword(event.target.value)}
                        placeholder="••••••••"
                        className={inputClass}
                    />
                </div>
                <div className="flex justify-stretch sm:justify-end">
                    <Button
                        onClick={handlePasswordChange}
                        disabled={changePassword.isPending}
                    >
                        {changePassword.isPending ? "Updating..." : "Change password"}
                    </Button>
                </div>
            </SettingsCard>

            <SettingsCard
                icon={Bell}
                title="Notifications"
                description="Choose when we should email you about activity."
            >
                <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                        <Label htmlFor="notify-response" className="cursor-pointer text-base text-[var(--foreground)]">
                            New response alerts
                        </Label>
                        <p className="mt-1 text-xs leading-5 text-[var(--editorial-subtle)]">
                            Get an email whenever someone completes one of your forms.
                        </p>
                    </div>
                    <Switch
                        id="notify-response"
                        checked={emailOnResponse}
                        onCheckedChange={setEmailOnResponse}
                    />
                </div>
                <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                        <Label htmlFor="notify-digest" className="cursor-pointer text-base text-[var(--foreground)]">
                            Weekly digest
                        </Label>
                        <p className="mt-1 text-xs leading-5 text-[var(--editorial-subtle)]">
                            A calm Monday summary of the past week's responses.
                        </p>
                    </div>
                    <Switch
                        id="notify-digest"
                        checked={weeklyDigest}
                        onCheckedChange={setWeeklyDigest}
                    />
                </div>
            </SettingsCard>

            <SettingsCard
                icon={Building2}
                title="Workspace"
                description="Details shared by everyone in this workspace."
            >
                <div className="space-y-2">
                    <Label htmlFor="settings-workspace" className="editorial-eyebrow text-[var(--editorial-subtle)]">
                        Workspace name
                    </Label>
                    <Input
                        id="settings-workspace"
                        defaultValue="My Workspace"
                        className={inputClass}
                    />
                </div>
                <p className="text-xs leading-5 text-[var(--editorial-subtle)]">
                    Workspace management, including members and roles, is coming soon.
                </p>
            </SettingsCard>
        </div>
    )
}
