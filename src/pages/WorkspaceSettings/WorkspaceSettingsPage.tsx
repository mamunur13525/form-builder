import { useState } from "react"
import { Activity, Building2, ShieldAlert, Users } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useCurrentUserProfile } from "@/features/users/hooks/useUsers"
import {
    hasWorkspacePermission,
    WORKSPACE_ROLE_LABELS,
} from "@/entities/workspace/model/types"
import {
    useActiveWorkspace,
    useWorkspace,
    useWorkspaceMembers,
} from "@/features/workspaces/hooks/useWorkspaces"
import { ActivityFeed } from "@/features/workspaces/components/ActivityFeed"
import { CreateWorkspaceDialog } from "@/features/workspaces/components/CreateWorkspaceDialog"
import { DangerZone } from "@/features/workspaces/components/DangerZone"
import { IncomingInvitations } from "@/features/workspaces/components/IncomingInvitations"
import { MembersPanel } from "@/features/workspaces/components/MembersPanel"
import { WorkspaceGeneralSettings } from "@/features/workspaces/components/WorkspaceGeneralSettings"

type TabId = "general" | "members" | "activity" | "danger"

interface TabDefinition {
    id: TabId
    label: string
    icon: LucideIcon
}

const TABS: TabDefinition[] = [
    { id: "general", label: "General", icon: Building2 },
    { id: "members", label: "Members", icon: Users },
    { id: "activity", label: "Activity", icon: Activity },
    { id: "danger", label: "Danger zone", icon: ShieldAlert },
]

function shellClass(embedded: boolean) {
    return cn(
        "editorial mx-auto w-full space-y-6",
        embedded
            ? "max-w-none px-1 pb-4"
            : "max-w-[900px] px-4 pt-8 pb-12 sm:space-y-8 sm:px-6 sm:pt-12 sm:pb-16 lg:px-8",
    )
}

/**
 * Everything about the active workspace, in one page.
 *
 * Tabs are plain buttons rather than the Tabs primitive because each panel owns
 * its own queries — mounting only the visible one keeps the page from firing
 * four requests on load. `Activity` is hidden from anyone without
 * `activity:view` (viewers), so the tab strip reflects what the user can
 * actually do.
 */
export function WorkspaceSettingsPage({ embedded = false }: { embedded?: boolean }) {
    const [tab, setTab] = useState<TabId>("general")
    const [createOpen, setCreateOpen] = useState(false)

    const { data: currentUser } = useCurrentUserProfile()
    const { activeWorkspaceId, isLoading: isResolving, hasNoWorkspaces } =
        useActiveWorkspace()

    const { data: workspace, isLoading: isLoadingWorkspace } =
        useWorkspace(activeWorkspaceId)

    // Shared with the members tab, and used by the danger zone to explain the
    // consequences of leaving.
    const { data: members = [] } = useWorkspaceMembers(activeWorkspaceId)
    const activeMemberCount = members.filter(
        (member) => member.status === "active",
    ).length

    // ----- Resolving -------------------------------------------------------
    if (isResolving || (activeWorkspaceId && isLoadingWorkspace && !workspace)) {
        return (
            <div className={shellClass(embedded)}>
                <div className="h-14 w-72 animate-pulse rounded-[18px] bg-[var(--secondary)]" />
                <div className="h-[420px] animate-pulse rounded-[24px] border border-[var(--border)] bg-[var(--secondary)]" />
            </div>
        )
    }

    // ----- No workspace yet ------------------------------------------------
    if (hasNoWorkspaces || !workspace) {
        return (
            <div className={shellClass(embedded)}>
                <div>
                    <h1 className="font-display text-[32px] leading-[1.1] text-[var(--foreground)] sm:text-[48px]">
                        Workspace
                    </h1>
                    <p className="mt-1 text-sm leading-6 text-[var(--editorial-body)] sm:mt-2 sm:text-base">
                        Workspaces keep forms, members and settings separate.
                    </p>
                </div>

                {/* Anything addressed to this user, so they can join without a link. */}
                <IncomingInvitations />

                <div className="rounded-[24px] border border-dashed border-[var(--editorial-border-light)] bg-[var(--card)] p-12 text-center">
                    <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-[18px] border border-[var(--editorial-border-light)] bg-[var(--secondary)] text-[var(--primary)]">
                        <Building2 className="h-6 w-6" />
                    </span>
                    <h2 className="font-display mt-6 text-2xl text-[var(--foreground)]">
                        No workspace yet
                    </h2>
                    <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[var(--editorial-body)]">
                        Create one to invite your team, or accept an invitation you have
                        been sent.
                    </p>
                    <Button
                        type="button"
                        onClick={() => setCreateOpen(true)}
                        className="editorial-transition mt-8 h-11 rounded-[16px] bg-[var(--primary)] px-6 text-sm font-medium text-white hover:bg-[var(--editorial-primary-hover)] active:scale-[.98]"
                    >
                        Create a workspace
                    </Button>
                </div>

                <CreateWorkspaceDialog open={createOpen} onOpenChange={setCreateOpen} />
            </div>
        )
    }

    // Viewers have no audit-trail access, so the tab should not be offered.
    const visibleTabs = TABS.filter((definition) =>
        definition.id === "activity"
            ? hasWorkspacePermission(workspace, "activity:view")
            : true,
    )

    const role = workspace.currentUserRole

    return (
        <div className={shellClass(embedded)}>
            {/* Header */}
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex min-w-0 items-center gap-4">
                    {workspace.logoUrl ? (
                        <img
                            src={workspace.logoUrl}
                            alt=""
                            className="h-14 w-14 shrink-0 rounded-[18px] border border-[var(--editorial-border-light)] object-cover"
                        />
                    ) : (
                        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[18px] border border-[var(--editorial-border-light)] bg-[var(--secondary)] text-lg font-semibold text-[var(--editorial-body)]">
                            {workspace.name.slice(0, 2).toUpperCase()}
                        </span>
                    )}
                    <div className="min-w-0">
                        <h1 className="font-display truncate text-[32px] leading-[1.1] text-[var(--foreground)] sm:text-[40px]">
                            {workspace.name}
                        </h1>
                        <p className="mt-1 text-sm text-[var(--editorial-body)]">
                            /w/{workspace.slug}
                            {role && ` · you are ${WORKSPACE_ROLE_LABELS[role]}`}
                        </p>
                    </div>
                </div>
            </div>

            {/* Invitations addressed to this user, from any workspace. */}
            <IncomingInvitations />

            {/* Tabs */}
            <div className="flex flex-wrap gap-2 border-b border-[var(--editorial-border-light)] pb-4">
                {visibleTabs.map(({ id, label, icon: Icon }) => (
                    <button
                        key={id}
                        type="button"
                        onClick={() => setTab(id)}
                        aria-current={tab === id ? "page" : undefined}
                        className={cn(
                            "editorial-transition inline-flex h-11 items-center gap-2 rounded-[16px] px-5 text-sm",
                            tab === id
                                ? "bg-[var(--secondary)] text-[var(--foreground)]"
                                : "text-[var(--editorial-body)] hover:text-[var(--foreground)]",
                        )}
                    >
                        <Icon className="h-4 w-4" />
                        {label}
                    </button>
                ))}
            </div>

            {/* Panels — only the active one mounts, so only it fetches. */}
            {tab === "general" && <WorkspaceGeneralSettings workspace={workspace} />}

            {tab === "members" && (
                <MembersPanel workspace={workspace} currentUserId={currentUser?.id} />
            )}

            {tab === "activity" && <ActivityFeed workspaceId={workspace.id} />}

            {tab === "danger" && (
                <DangerZone
                    workspace={workspace}
                    activeMemberCount={activeMemberCount || 1}
                />
            )}
        </div>
    )
}
