import { Check, ChevronsUpDown, Plus, Settings2 } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { useSettingsModalStore } from "@/shared/stores/settingsModalStore"
import { useCreateWorkspaceModalStore } from "@/shared/stores/createWorkspaceModalStore"
import {
    useActiveWorkspace,
    useSwitchWorkspace,
} from "@/features/workspaces/hooks/useWorkspaces"
import { WORKSPACE_ROLE_LABELS, type Workspace } from "@/entities/workspace/model/types"
import {
    Avatar, AvatarImage,
    AvatarFallback
} from "@/components/ui/avatar"

interface WorkspaceSwitcherProps {
    /** Called after a navigation so the mobile drawer can close itself. */
    onNavigate?: () => void
}

/** Initials fallback for a workspace with no logo. */
function initialsOf(name: string): string {
    if (!name.trim()) return "W"
    return name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? "")
        .join("")
}

function WorkspaceAvatar({
    workspace,
}: {
    workspace: Pick<Workspace, "name" | "logoUrl">
}) {

    return (
        <Avatar size="lg" >
            {
                workspace?.logoUrl ? (
                    <AvatarImage src={workspace.logoUrl} />
                ) : (
                    <AvatarFallback className="bg-[#efefef]">{initialsOf(workspace?.name)}</AvatarFallback>
                )
            }
        </Avatar >
    )
}

/**
 * Workspace switcher for the sidebar.
 *
 * Shows the active workspace and lets the user move between the ones they
 * belong to. Switching is optimistic — `useSwitchWorkspace` updates the local
 * store before the server confirms — so the label changes on click without a
 * spinner.
 */
export function WorkspaceSwitcher({ onNavigate }: WorkspaceSwitcherProps) {
    const { activeWorkspace, workspaces, isLoading, hasNoWorkspaces } =
        useActiveWorkspace()
    const switchWorkspace = useSwitchWorkspace()
    const openSettings = useSettingsModalStore((state) => state.openSettings)
    const openCreateWorkspace = useCreateWorkspaceModalStore(
        (state) => state.openCreateWorkspace,
    )

    const handleSelect = (workspaceId: string) => {
        if (workspaceId !== activeWorkspace?.id) {
            switchWorkspace.mutate(workspaceId)
        }
    }

    const handleCreateWorkspace = () => {
        openCreateWorkspace()
        onNavigate?.()
    }

    // Loading — a skeleton rather than an empty box, so the sidebar does not jump.
    if (isLoading) {
        return (
            <div className="h-[52px] w-full animate-pulse rounded-[16px] border border-[var(--editorial-border-light)] bg-[var(--secondary)]" />
        )
    }

    // No workspaces yet — the switcher becomes a single call to action.
    if (hasNoWorkspaces || !activeWorkspace) {
        return (
            <button
                type="button"
                onClick={handleCreateWorkspace}
                className="editorial-transition flex h-[52px] w-full items-center gap-3 rounded-[16px] border border-dashed border-[var(--editorial-primary-ring)] bg-[var(--editorial-primary-light)] px-4 text-left text-sm text-[var(--primary)] hover:bg-[var(--editorial-primary-selected)]"
            >
                <Plus className="h-4 w-4 shrink-0" />
                Create a workspace
            </button>
        )
    }

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger
                    className="editorial-transition flex h-[52px] w-full items-center gap-3 rounded-[16px] border border-[var(--editorial-border-light)] bg-[var(--secondary)] px-3 text-left hover:border-[var(--editorial-primary-ring)] hover:bg-[var(--editorial-primary-light)]"
                    aria-label="Switch workspace"
                >
                    <WorkspaceAvatar workspace={activeWorkspace} />
                    <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm text-[var(--foreground)]">
                            {activeWorkspace.name}
                        </span>
                        <span className="block truncate text-xs text-[var(--editorial-subtle)]">
                            {activeWorkspace.currentUserRole
                                ? WORKSPACE_ROLE_LABELS[activeWorkspace.currentUserRole]
                                : "Member"}
                            {" · "}
                            {activeWorkspace.memberCount}
                            {activeWorkspace.memberCount === 1 ? " member" : " members"}
                        </span>
                    </span>
                    <ChevronsUpDown className="h-4 w-4 shrink-0 text-[var(--editorial-subtle)]" />
                </DropdownMenuTrigger>

                {/* Portalled, so the theme class has to be re-applied here. */}
                <DropdownMenuContent
                    side="bottom"
                    align="start"
                    sideOffset={8}
                    className="editorial w-[17rem] rounded-[18px] border border-[var(--border)] bg-[var(--popover)] p-2"
                >
                    {/* Base UI requires labels to live inside a group — a bare
                        DropdownMenuLabel outside one throws on render. */}
                    <DropdownMenuGroup>
                        <DropdownMenuLabel className="px-3 py-2 text-xs uppercase tracking-wide text-[var(--editorial-subtle)]">
                            Workspaces
                        </DropdownMenuLabel>

                        <div className="max-h-[15rem] overflow-y-auto">
                            {workspaces.map((workspace) => {
                                const isActive = workspace.id === activeWorkspace.id
                                return (
                                    <DropdownMenuItem
                                        key={workspace.id}
                                        className="rounded-[12px] px-3 py-2.5"
                                        onClick={() => handleSelect(workspace.id)}
                                    >
                                        <WorkspaceAvatar
                                            workspace={workspace}
                                            className="h-7 w-7 text-[10px]"
                                        />
                                        <span className="min-w-0 flex-1">
                                            <span className="block truncate text-sm text-[var(--foreground)]">
                                                {workspace.name}
                                            </span>
                                            <span className="block truncate text-xs text-[var(--editorial-subtle)]">
                                                /{workspace.slug}
                                            </span>
                                        </span>
                                        {isActive && (
                                            <Check className="h-4 w-4 shrink-0 text-[var(--primary)]" />
                                        )}
                                    </DropdownMenuItem>
                                )
                            })}
                        </div>
                    </DropdownMenuGroup>

                    <DropdownMenuSeparator className="bg-[var(--editorial-border-light)]" />

                    <DropdownMenuItem
                        className="rounded-[12px] px-3 py-2.5"
                        onClick={() => {
                            openSettings("workspace")
                            onNavigate?.()
                        }}
                    >
                        <Settings2 className="h-4 w-4" />
                        Workspace settings
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        className="rounded-[12px] px-3 py-2.5"
                        onClick={handleCreateWorkspace}
                    >
                        <Plus className="h-4 w-4" />
                        Create workspace
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    )
}
