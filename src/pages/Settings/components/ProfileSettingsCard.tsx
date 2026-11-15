import { useState } from "react"
import { Link2, Pencil, User as UserIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { User } from "@/entities/user/model/types"

const inputClass =
    "h-[52px] rounded-lg border-[var(--input)] bg-[var(--secondary)] px-6 text-base placeholder:text-[var(--editorial-subtle)]"

interface ProfileSettingsCardProps {
    user: User | undefined
    onSaveProfile: (name: string, avatarUrl: string) => void
    isSaving: boolean
}

export function ProfileSettingsCard({
    user,
    onSaveProfile,
    isSaving,
}: ProfileSettingsCardProps) {
    const [nameEdit, setNameEdit] = useState<string | null>(null)
    const [avatarEdit, setAvatarEdit] = useState<string | null>(null)
    const [avatarInput, setAvatarInput] = useState("")
    const [avatarEditorOpen, setAvatarEditorOpen] = useState(false)
    const [isAvatarValid, setIsAvatarValid] = useState(true)

    const name = nameEdit ?? user?.name ?? ""
    const avatarUrl = avatarEdit ?? user?.avatarUrl ?? ""

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

    const handleSave = () => {
        onSaveProfile(name.trim(), avatarUrl.trim())
        setNameEdit(null)
        setAvatarEdit(null)
    }

    return (
        <Card className="editorial-shadow-sm rounded-lg border-[var(--border)] bg-[var(--card)]">
            <CardContent className="p-5 sm:p-8">
                <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-[var(--editorial-border-light)] bg-[var(--secondary)] text-[var(--primary)]">
                        <UserIcon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <h2 className="font-display text-xl leading-tight sm:text-2xl text-[var(--foreground)]">
                            Profile
                        </h2>
                        <p className="mt-1 text-sm leading-6 sm:text-base text-[var(--editorial-body)]">
                            How your name and picture appear across the workspace.
                        </p>
                    </div>
                </div>
                <div className="mt-6 space-y-6 sm:mt-8">
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
                            onClick={handleSave}
                            disabled={isSaving}
                        >
                            {isSaving ? "Saving..." : "Save changes"}
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
