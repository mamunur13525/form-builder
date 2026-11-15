import { useState } from "react"
import { Bell, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import {
    useCurrentUserProfile,
    useUpdateCurrentUserProfile,
} from "@/features/users/hooks/useUsers"
import { useChangePassword } from "@/features/auth/hooks/useAuth"
import { showError, showSuccess } from "@/shared/hooks/useToast"
import { cn } from "@/lib/utils"
import { ProfileSettingsCard } from "./components/ProfileSettingsCard"

const inputClass =
    "h-[52px] rounded-lg border-[var(--input)] bg-[var(--secondary)] px-6 text-base placeholder:text-[var(--editorial-subtle)]"

/** Placeholder cards for the profile, security and notification sections. */
function SettingsCardSkeleton({ index = 0 }: { index?: number }) {
    return (
        <Card
            className="editorial-shadow-sm animate-in fade-in duration-300 rounded-lg border-[var(--border)] bg-[var(--card)]"
            style={{
                animationDelay: `${index * 80}ms`,
                animationFillMode: "backwards",
            }}
        >
            <CardContent className="space-y-4 p-5 sm:p-8">
                <div className="flex items-start gap-4">
                    <Skeleton className="h-12 w-12 rounded-lg" />
                    <div className="min-w-0 flex-1 space-y-2">
                        <Skeleton className="h-5 w-40" />
                        <Skeleton className="h-4 w-64 max-w-full" />
                    </div>
                </div>
                <Skeleton className="h-[52px] w-full rounded-lg" />
                <Skeleton className="h-[52px] w-full rounded-lg" />
            </CardContent>
        </Card>
    )
}

export function SettingsPage({ embedded = false }: { embedded?: boolean }) {
    const { data: user, isLoading } = useCurrentUserProfile()
    const updateProfile = useUpdateCurrentUserProfile()
    const changePassword = useChangePassword()

    const [currentPassword, setCurrentPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")

    // Notification preferences are local-only until a backend endpoint exists.
    const [emailOnResponse, setEmailOnResponse] = useState(true)
    const [weeklyDigest, setWeeklyDigest] = useState(false)

    const handleProfileSave = (name: string, avatarUrl: string) => {
        updateProfile.mutate(
            { name, avatarUrl },
            {
                onSuccess: () => showSuccess("Profile updated"),
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

    const shellClass = cn(
        "editorial mx-auto w-full space-y-6",
        embedded
            ? "max-w-none px-1 pb-4"
            : "max-w-[900px] px-4 pt-8 pb-12 sm:space-y-12 sm:px-6 sm:pt-12 sm:pb-16 lg:px-8",
    )

    if (isLoading) {
        return (
            <div className={shellClass}>
                {[0, 1, 2].map((index) => (
                    <SettingsCardSkeleton key={index} index={index} />
                ))}
            </div>
        )
    }

    return (
        <div className={shellClass}>
            {!embedded && (
                <div>
                    <h1 className="font-display text-[32px] leading-[1.1] sm:text-[48px] text-[var(--foreground)]">
                        Settings
                    </h1>
                    <p className="mt-1 text-sm leading-6 sm:mt-2 sm:text-base text-[var(--editorial-body)]">
                        Manage your profile, security and workspace preferences.
                    </p>
                </div>
            )}

            <ProfileSettingsCard
                user={user}
                onSaveProfile={handleProfileSave}
                isSaving={updateProfile.isPending}
            />

            <Card className="editorial-shadow-sm rounded-lg border-[var(--border)] bg-[var(--card)]">
                <CardContent className="p-5 sm:p-8">
                    <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-[var(--editorial-border-light)] bg-[var(--secondary)] text-[var(--primary)]">
                            <Shield className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <h2 className="font-display text-xl leading-tight sm:text-2xl text-[var(--foreground)]">
                                Security
                            </h2>
                            <p className="mt-1 text-sm leading-6 sm:text-base text-[var(--editorial-body)]">
                                Update the password you use to sign in.
                            </p>
                        </div>
                    </div>
                    <div className="mt-6 space-y-6 sm:mt-8">
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
                    </div>
                </CardContent>
            </Card>

            <Card className="editorial-shadow-sm rounded-lg border-[var(--border)] bg-[var(--card)]">
                <CardContent className="p-5 sm:p-8">
                    <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-[var(--editorial-border-light)] bg-[var(--secondary)] text-[var(--primary)]">
                            <Bell className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <h2 className="font-display text-xl leading-tight sm:text-2xl text-[var(--foreground)]">
                                Notifications
                            </h2>
                            <p className="mt-1 text-sm leading-6 sm:text-base text-[var(--editorial-body)]">
                                Choose when we should email you about activity.
                            </p>
                        </div>
                    </div>
                    <div className="mt-6 space-y-6 sm:mt-8">
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
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
