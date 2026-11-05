import { useCallback, useEffect, useMemo } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import * as workspaceApi from "@/entities/workspace/api/workspace.api"
import {
    hasWorkspacePermission,
    type CreateWorkspacePayload,
    type IncomingInvitation,
    type InviteMemberPayload,
    type UpdateWorkspacePayload,
    type UpdateWorkspaceSettingsPayload,
    type Workspace,
    type WorkspaceDetail,
    type WorkspaceMember,
    type WorkspacePermission,
} from "@/entities/workspace/model/types"
import { useWorkspaceStore } from "@/shared/stores/workspaceStore"
import { showError, showSuccess } from "@/shared/hooks/useToast"

/**
 * TanStack Query hooks for workspaces.
 *
 * Query keys are namespaced under `["workspaces", ...]` so a single
 * `invalidateQueries({ queryKey: WORKSPACES_QUERY_KEY })` refreshes the whole
 * feature after a mutation that could change membership or permissions.
 */

export const WORKSPACES_QUERY_KEY = ["workspaces"] as const

/**
 * Form caches are keyed by workspace, so leaving a workspace has to drop them.
 *
 * Written as a literal rather than imported from the forms feature: `useForms`
 * already depends on this module for the active workspace, and importing back
 * would close the cycle.
 */
const FORMS_QUERY_KEY = ["forms"] as const

const STALE_TIME = 5 * 60 * 1000
const GC_TIME = 10 * 60 * 1000

export const workspaceKeys = {
    all: WORKSPACES_QUERY_KEY,
    list: () => [...WORKSPACES_QUERY_KEY, "list"] as const,
    detail: (workspaceId: string) =>
        [...WORKSPACES_QUERY_KEY, "detail", workspaceId] as const,
    members: (workspaceId: string) =>
        [...WORKSPACES_QUERY_KEY, "members", workspaceId] as const,
    invitations: (workspaceId: string) =>
        [...WORKSPACES_QUERY_KEY, "invitations", workspaceId] as const,
    activity: (workspaceId: string, page: number) =>
        [...WORKSPACES_QUERY_KEY, "activity", workspaceId, page] as const,
    incoming: () => [...WORKSPACES_QUERY_KEY, "incoming"] as const,
    invitationToken: (token: string) =>
        [...WORKSPACES_QUERY_KEY, "invitation", token] as const,
    active: () => [...WORKSPACES_QUERY_KEY, "active"] as const,
    slug: (slug: string) => [...WORKSPACES_QUERY_KEY, "slug-available", slug] as const,
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export function useWorkspaces() {
    return useQuery({
        queryKey: workspaceKeys.list(),
        queryFn: workspaceApi.getWorkspaces,
        staleTime: STALE_TIME,
        gcTime: GC_TIME,
    })
}

export function useWorkspace(workspaceId: string | null | undefined) {
    return useQuery({
        queryKey: workspaceKeys.detail(workspaceId ?? ""),
        queryFn: () => workspaceApi.getWorkspace(workspaceId as string),
        enabled: Boolean(workspaceId),
        staleTime: STALE_TIME,
        gcTime: GC_TIME,
    })
}

export function useWorkspaceMembers(workspaceId: string | null | undefined) {
    return useQuery({
        queryKey: workspaceKeys.members(workspaceId ?? ""),
        queryFn: () => workspaceApi.getMembers(workspaceId as string),
        enabled: Boolean(workspaceId),
        staleTime: STALE_TIME,
        gcTime: GC_TIME,
    })
}

export function useWorkspaceInvitations(
    workspaceId: string | null | undefined,
    enabled = true,
) {
    return useQuery({
        queryKey: workspaceKeys.invitations(workspaceId ?? ""),
        queryFn: () => workspaceApi.getInvitations(workspaceId as string),
        enabled: Boolean(workspaceId) && enabled,
        staleTime: STALE_TIME,
        gcTime: GC_TIME,
    })
}

export function useWorkspaceActivity(
    workspaceId: string | null | undefined,
    page = 1,
    limit = 20,
) {
    return useQuery({
        queryKey: workspaceKeys.activity(workspaceId ?? "", page),
        queryFn: () => workspaceApi.getActivity(workspaceId as string, { page, limit }),
        enabled: Boolean(workspaceId),
        staleTime: STALE_TIME,
        gcTime: GC_TIME,
    })
}

/** Invitations addressed to the signed-in user, for the notification badge. */
export function useIncomingInvitations() {
    return useQuery({
        queryKey: workspaceKeys.incoming(),
        queryFn: workspaceApi.getIncomingInvitations,
        staleTime: STALE_TIME,
        gcTime: GC_TIME,
    })
}

/**
 * Preview an invitation from its link. `retry: false` because a bad or expired
 * token will never succeed — retrying only delays the error screen.
 */
export function useInvitationByToken(token: string | null | undefined) {
    return useQuery({
        queryKey: workspaceKeys.invitationToken(token ?? ""),
        queryFn: () => workspaceApi.getInvitationByToken(token as string),
        enabled: Boolean(token),
        retry: false,
        staleTime: STALE_TIME,
        gcTime: GC_TIME,
    })
}

/**
 * Live slug availability for the create/settings forms. The caller is expected
 * to debounce `slug` — this only skips obviously-too-short input.
 */
export function useSlugAvailability(slug: string, enabled = true) {
    return useQuery({
        queryKey: workspaceKeys.slug(slug),
        queryFn: () => workspaceApi.checkSlugAvailability(slug),
        enabled: enabled && slug.length >= 3,
        retry: false,
        staleTime: 30 * 1000,
        gcTime: GC_TIME,
    })
}

// ---------------------------------------------------------------------------
// Active workspace
// ---------------------------------------------------------------------------

/**
 * The workspace the user is working in, reconciling three sources:
 *
 * 1. the persisted local store (instant, may be stale),
 * 2. the server's `lastActiveWorkspace` (authoritative across devices),
 * 3. the user's workspace list (the fallback when neither is usable).
 *
 * The local value is only trusted while it still appears in the list, so a
 * workspace the user was removed from or deleted cannot leave the UI pinned to
 * something they can no longer load.
 */
export function useActiveWorkspace() {
    const { activeWorkspaceId, setActiveWorkspaceId } = useWorkspaceStore()
    const { data: workspaces = [], isLoading: isLoadingList } = useWorkspaces()

    const { data: serverActive } = useQuery({
        queryKey: workspaceKeys.active(),
        queryFn: workspaceApi.getActiveWorkspace,
        staleTime: STALE_TIME,
        gcTime: GC_TIME,
    })

    const resolvedId = useMemo(() => {
        if (!workspaces.length) return null

        const isMember = (id: string | null | undefined) =>
            Boolean(id) && workspaces.some((workspace) => workspace.id === id)

        if (isMember(activeWorkspaceId)) return activeWorkspaceId
        if (isMember(serverActive?.workspaceId)) return serverActive?.workspaceId ?? null

        return workspaces[0].id
    }, [workspaces, activeWorkspaceId, serverActive?.workspaceId])

    // Write the reconciled value back so the next reload starts correct.
    useEffect(() => {
        if (resolvedId && resolvedId !== activeWorkspaceId) {
            setActiveWorkspaceId(resolvedId)
        }
    }, [resolvedId, activeWorkspaceId, setActiveWorkspaceId])

    const activeWorkspace = useMemo(
        () => workspaces.find((workspace) => workspace.id === resolvedId) ?? null,
        [workspaces, resolvedId],
    )

    /** True when the active workspace grants `permission`. */
    const can = useCallback(
        (permission: WorkspacePermission) =>
            hasWorkspacePermission(activeWorkspace, permission),
        [activeWorkspace],
    )

    return {
        activeWorkspaceId: resolvedId,
        activeWorkspace,
        workspaces,
        isLoading: isLoadingList,
        /** True once loaded and the user belongs to no workspace at all. */
        hasNoWorkspaces: !isLoadingList && workspaces.length === 0,
        can,
    }
}

/**
 * Switch workspace. The local store is updated first so the UI moves
 * immediately; the server call then persists the choice. A failed persist is
 * not rolled back — the user is where they asked to be, and the next load
 * simply falls back to the server's older value.
 */
export function useSwitchWorkspace() {
    const queryClient = useQueryClient()
    const setActiveWorkspaceId = useWorkspaceStore((state) => state.setActiveWorkspaceId)

    return useMutation({
        mutationFn: (workspaceId: string) => workspaceApi.setActiveWorkspace(workspaceId),
        onMutate: (workspaceId: string) => {
            setActiveWorkspaceId(workspaceId)
            // The form list re-keys on the new id by itself; this drops the
            // single-form entries, which are not workspace-keyed and would
            // otherwise still hold forms from the workspace just left.
            queryClient.removeQueries({ queryKey: FORMS_QUERY_KEY })
        },
        onSuccess: (data) => {
            queryClient.setQueryData(workspaceKeys.active(), data)
        },
        onError: (error) => {
            showError("Could not switch workspace", error)
        },
    })
}

// ---------------------------------------------------------------------------
// Workspace mutations
// ---------------------------------------------------------------------------

export function useCreateWorkspace() {
    const queryClient = useQueryClient()
    const setActiveWorkspaceId = useWorkspaceStore((state) => state.setActiveWorkspaceId)

    return useMutation({
        mutationFn: (payload: CreateWorkspacePayload) =>
            workspaceApi.createWorkspace(payload),
        onSuccess: (workspace: Workspace) => {
            queryClient.setQueryData<Workspace[]>(workspaceKeys.list(), (previous) =>
                previous ? [workspace, ...previous] : [workspace],
            )
            // The server switches to a freshly created workspace, so match it.
            setActiveWorkspaceId(workspace.id)
            queryClient.removeQueries({ queryKey: FORMS_QUERY_KEY })
            queryClient.invalidateQueries({ queryKey: workspaceKeys.active() })
            showSuccess("Workspace created", `${workspace.name} is ready to use`)
        },
        onError: (error) => {
            showError("Could not create workspace", error)
        },
    })
}

export function useUpdateWorkspace(workspaceId: string) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (payload: UpdateWorkspacePayload) =>
            workspaceApi.updateWorkspace(workspaceId, payload),
        onSuccess: (workspace: Workspace) => {
            queryClient.setQueryData<Workspace[]>(workspaceKeys.list(), (previous) =>
                previous?.map((entry) =>
                    entry.id === workspace.id ? { ...entry, ...workspace } : entry,
                ),
            )
            queryClient.invalidateQueries({
                queryKey: workspaceKeys.detail(workspaceId),
            })
            queryClient.invalidateQueries({
                queryKey: workspaceKeys.activity(workspaceId, 1),
            })
            showSuccess("Workspace updated")
        },
        onError: (error) => {
            showError("Could not update workspace", error)
        },
    })
}

export function useUpdateWorkspaceSettings(workspaceId: string) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (payload: UpdateWorkspaceSettingsPayload) =>
            workspaceApi.updateWorkspaceSettings(workspaceId, payload),
        onSuccess: (workspace: Workspace) => {
            queryClient.setQueryData<Workspace[]>(workspaceKeys.list(), (previous) =>
                previous?.map((entry) =>
                    entry.id === workspace.id ? { ...entry, ...workspace } : entry,
                ),
            )
            queryClient.invalidateQueries({
                queryKey: workspaceKeys.detail(workspaceId),
            })
            queryClient.invalidateQueries({
                queryKey: workspaceKeys.activity(workspaceId, 1),
            })
            showSuccess("Settings saved")
        },
        onError: (error) => {
            showError("Could not save settings", error)
        },
    })
}

/**
 * Delete a workspace. Clears the local active id so the app resolves a new one
 * instead of pointing at something that no longer exists.
 */
export function useDeleteWorkspace() {
    const queryClient = useQueryClient()
    const clearActiveWorkspaceId = useWorkspaceStore(
        (state) => state.clearActiveWorkspaceId,
    )

    return useMutation({
        mutationFn: (workspaceId: string) => workspaceApi.deleteWorkspace(workspaceId),
        onSuccess: ({ workspaceId }) => {
            queryClient.setQueryData<Workspace[]>(workspaceKeys.list(), (previous) =>
                previous?.filter((entry) => entry.id !== workspaceId),
            )
            queryClient.removeQueries({ queryKey: workspaceKeys.detail(workspaceId) })
            clearActiveWorkspaceId()
            queryClient.removeQueries({ queryKey: FORMS_QUERY_KEY })
            queryClient.invalidateQueries({ queryKey: workspaceKeys.all })
            showSuccess("Workspace deleted")
        },
        onError: (error) => {
            showError("Could not delete workspace", error)
        },
    })
}

export function useLeaveWorkspace() {
    const queryClient = useQueryClient()
    const clearActiveWorkspaceId = useWorkspaceStore(
        (state) => state.clearActiveWorkspaceId,
    )

    return useMutation({
        mutationFn: (workspaceId: string) => workspaceApi.leaveWorkspace(workspaceId),
        onSuccess: ({ workspaceId }) => {
            queryClient.setQueryData<Workspace[]>(workspaceKeys.list(), (previous) =>
                previous?.filter((entry) => entry.id !== workspaceId),
            )
            queryClient.removeQueries({ queryKey: workspaceKeys.detail(workspaceId) })
            clearActiveWorkspaceId()
            queryClient.removeQueries({ queryKey: FORMS_QUERY_KEY })
            queryClient.invalidateQueries({ queryKey: workspaceKeys.all })
            showSuccess("You left the workspace")
        },
        onError: (error) => {
            showError("Could not leave workspace", error)
        },
    })
}

/**
 * Hand the workspace to another member. The caller's own permissions drop to
 * admin, so the whole feature is invalidated rather than patched.
 */
export function useTransferOwnership(workspaceId: string) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (memberId: string) =>
            workspaceApi.transferOwnership(workspaceId, memberId),
        onSuccess: (workspace: WorkspaceDetail) => {
            queryClient.setQueryData(workspaceKeys.detail(workspaceId), workspace)
            queryClient.invalidateQueries({ queryKey: workspaceKeys.all })
            showSuccess(
                "Ownership transferred",
                `${workspace.owner?.name ?? "The new owner"} now owns this workspace`,
            )
        },
        onError: (error) => {
            showError("Could not transfer ownership", error)
        },
    })
}

// ---------------------------------------------------------------------------
// Member mutations
// ---------------------------------------------------------------------------

export function useUpdateMemberRole(workspaceId: string) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ memberId, role }: { memberId: string; role: string }) =>
            workspaceApi.updateMemberRole(workspaceId, memberId, role),
        onSuccess: (members: WorkspaceMember[]) => {
            queryClient.setQueryData(workspaceKeys.members(workspaceId), members)
            queryClient.invalidateQueries({
                queryKey: workspaceKeys.detail(workspaceId),
            })
            queryClient.invalidateQueries({
                queryKey: workspaceKeys.activity(workspaceId, 1),
            })
            showSuccess("Role updated")
        },
        onError: (error) => {
            showError("Could not update role", error)
        },
    })
}

export function useRemoveMember(workspaceId: string) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (memberId: string) =>
            workspaceApi.removeMember(workspaceId, memberId),
        onSuccess: (members: WorkspaceMember[]) => {
            queryClient.setQueryData(workspaceKeys.members(workspaceId), members)
            queryClient.invalidateQueries({
                queryKey: workspaceKeys.detail(workspaceId),
            })
            queryClient.invalidateQueries({
                queryKey: workspaceKeys.activity(workspaceId, 1),
            })
            showSuccess("Member removed")
        },
        onError: (error) => {
            showError("Could not remove member", error)
        },
    })
}

// ---------------------------------------------------------------------------
// Invitation mutations
// ---------------------------------------------------------------------------

export function useInviteMember(workspaceId: string) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (payload: InviteMemberPayload) =>
            workspaceApi.inviteMember(workspaceId, payload),
        onSuccess: (invitation) => {
            queryClient.invalidateQueries({
                queryKey: workspaceKeys.members(workspaceId),
            })
            queryClient.invalidateQueries({
                queryKey: workspaceKeys.invitations(workspaceId),
            })
            queryClient.invalidateQueries({
                queryKey: workspaceKeys.detail(workspaceId),
            })
            queryClient.invalidateQueries({
                queryKey: workspaceKeys.activity(workspaceId, 1),
            })
            showSuccess("Invitation sent", `${invitation.email} has been invited`)
        },
        onError: (error) => {
            showError("Could not send invitation", error)
        },
    })
}

export function useResendInvitation(workspaceId: string) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (invitationId: string) =>
            workspaceApi.resendInvitation(workspaceId, invitationId),
        onSuccess: (invitation) => {
            queryClient.invalidateQueries({
                queryKey: workspaceKeys.invitations(workspaceId),
            })
            queryClient.invalidateQueries({
                queryKey: workspaceKeys.members(workspaceId),
            })
            showSuccess("Invitation resent", `A new link was issued for ${invitation.email}`)
        },
        onError: (error) => {
            showError("Could not resend invitation", error)
        },
    })
}

export function useCancelInvitation(workspaceId: string) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (invitationId: string) =>
            workspaceApi.cancelInvitation(workspaceId, invitationId),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: workspaceKeys.invitations(workspaceId),
            })
            queryClient.invalidateQueries({
                queryKey: workspaceKeys.members(workspaceId),
            })
            queryClient.invalidateQueries({
                queryKey: workspaceKeys.detail(workspaceId),
            })
            showSuccess("Invitation cancelled")
        },
        onError: (error) => {
            showError("Could not cancel invitation", error)
        },
    })
}

/** Accepting joins the workspace and makes it active. */
export function useAcceptInvitation() {
    const queryClient = useQueryClient()
    const setActiveWorkspaceId = useWorkspaceStore((state) => state.setActiveWorkspaceId)

    return useMutation({
        mutationFn: (token: string) => workspaceApi.acceptInvitation(token),
        onSuccess: (workspace: Workspace) => {
            setActiveWorkspaceId(workspace.id)
            queryClient.removeQueries({ queryKey: FORMS_QUERY_KEY })
            queryClient.invalidateQueries({ queryKey: workspaceKeys.all })
            showSuccess("Invitation accepted", `Welcome to ${workspace.name}`)
        },
        onError: (error) => {
            showError("Could not accept invitation", error)
        },
    })
}

export function useRejectInvitation() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (token: string) => workspaceApi.rejectInvitation(token),
        onSuccess: (invitation: IncomingInvitation | { email: string }) => {
            queryClient.invalidateQueries({ queryKey: workspaceKeys.incoming() })
            showSuccess("Invitation declined", `You declined the invite to ${invitation.email}`)
        },
        onError: (error) => {
            showError("Could not decline invitation", error)
        },
    })
}
