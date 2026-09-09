import { apiRequest, buildQuery } from "@/shared/api/client"
import type {
    ActiveWorkspaceRef,
    CreateWorkspacePayload,
    IncomingInvitation,
    InviteMemberPayload,
    PaginatedActivity,
    SlugAvailability,
    UpdateWorkspacePayload,
    UpdateWorkspaceSettingsPayload,
    Workspace,
    WorkspaceDetail,
    WorkspaceInvitation,
    WorkspaceMember,
} from "../model/types"

/**
 * Thin wrappers over `/workspaces`. No caching or state here — that is the
 * hooks' job in `features/workspaces`; these functions only describe endpoints.
 */

const BASE = "/workspaces"

// ---------------------------------------------------------------------------
// Workspaces
// ---------------------------------------------------------------------------

export const createWorkspace = (payload: CreateWorkspacePayload): Promise<Workspace> =>
    apiRequest<Workspace>(BASE, {
        method: "POST",
        body: JSON.stringify(payload),
    })

/** Every workspace the signed-in user belongs to, each with their role in it. */
export const getWorkspaces = (): Promise<Workspace[]> =>
    apiRequest<Workspace[]>(BASE)

/** One workspace including its merged member + pending-invitation list. */
export const getWorkspace = (workspaceId: string): Promise<WorkspaceDetail> =>
    apiRequest<WorkspaceDetail>(`${BASE}/${workspaceId}`)

export const getWorkspaceBySlug = (slug: string): Promise<WorkspaceDetail> =>
    apiRequest<WorkspaceDetail>(`${BASE}/slug/${slug}`)

export const updateWorkspace = (
    workspaceId: string,
    payload: UpdateWorkspacePayload,
): Promise<Workspace> =>
    apiRequest<Workspace>(`${BASE}/${workspaceId}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
    })

export const updateWorkspaceSettings = (
    workspaceId: string,
    payload: UpdateWorkspaceSettingsPayload,
): Promise<Workspace> =>
    apiRequest<Workspace>(`${BASE}/${workspaceId}/settings`, {
        method: "PATCH",
        body: JSON.stringify(payload),
    })

export const deleteWorkspace = (
    workspaceId: string,
): Promise<{ workspaceId: string }> =>
    apiRequest<{ workspaceId: string }>(`${BASE}/${workspaceId}`, {
        method: "DELETE",
    })

export const leaveWorkspace = (
    workspaceId: string,
): Promise<{ workspaceId: string }> =>
    apiRequest<{ workspaceId: string }>(`${BASE}/${workspaceId}/leave`, {
        method: "POST",
    })

/** `memberId` is the membership id of the member who should become owner. */
export const transferOwnership = (
    workspaceId: string,
    memberId: string,
): Promise<WorkspaceDetail> =>
    apiRequest<WorkspaceDetail>(`${BASE}/${workspaceId}/transfer-ownership`, {
        method: "POST",
        body: JSON.stringify({ memberId }),
    })

/** Whether a slug is free, plus a suggestion when it is not. */
export const checkSlugAvailability = (slug: string): Promise<SlugAvailability> =>
    apiRequest<SlugAvailability>(`${BASE}/slug-available${buildQuery({ slug })}`)

// ---------------------------------------------------------------------------
// Switching
// ---------------------------------------------------------------------------

/**
 * The workspace to open on load, resolved server-side so the choice survives a
 * new device or cleared storage.
 */
export const getActiveWorkspace = (): Promise<ActiveWorkspaceRef> =>
    apiRequest<ActiveWorkspaceRef>(`${BASE}/active`)

export const setActiveWorkspace = (
    workspaceId: string,
): Promise<ActiveWorkspaceRef> =>
    apiRequest<ActiveWorkspaceRef>(`${BASE}/active`, {
        method: "PUT",
        body: JSON.stringify({ workspaceId }),
    })

// ---------------------------------------------------------------------------
// Members
// ---------------------------------------------------------------------------

/** Active members and pending invitations as one list — see `WorkspaceMember`. */
export const getMembers = (workspaceId: string): Promise<WorkspaceMember[]> =>
    apiRequest<WorkspaceMember[]>(`${BASE}/${workspaceId}/members`)

/** Returns the refreshed member list, so the table can be replaced wholesale. */
export const updateMemberRole = (
    workspaceId: string,
    memberId: string,
    role: string,
): Promise<WorkspaceMember[]> =>
    apiRequest<WorkspaceMember[]>(
        `${BASE}/${workspaceId}/members/${memberId}/role`,
        {
            method: "PATCH",
            body: JSON.stringify({ role }),
        },
    )

export const removeMember = (
    workspaceId: string,
    memberId: string,
): Promise<WorkspaceMember[]> =>
    apiRequest<WorkspaceMember[]>(`${BASE}/${workspaceId}/members/${memberId}`, {
        method: "DELETE",
    })

// ---------------------------------------------------------------------------
// Invitations — inviter side
// ---------------------------------------------------------------------------

/** The response carries `inviteUrl`, which the caller should offer to copy. */
export const inviteMember = (
    workspaceId: string,
    payload: InviteMemberPayload,
): Promise<WorkspaceInvitation> =>
    apiRequest<WorkspaceInvitation>(`${BASE}/${workspaceId}/invitations`, {
        method: "POST",
        body: JSON.stringify(payload),
    })

export const getInvitations = (
    workspaceId: string,
): Promise<WorkspaceInvitation[]> =>
    apiRequest<WorkspaceInvitation[]>(`${BASE}/${workspaceId}/invitations`)

/** Issues a fresh token and extends the window; the old link stops working. */
export const resendInvitation = (
    workspaceId: string,
    invitationId: string,
): Promise<WorkspaceInvitation> =>
    apiRequest<WorkspaceInvitation>(
        `${BASE}/${workspaceId}/invitations/${invitationId}/resend`,
        { method: "POST" },
    )

export const cancelInvitation = (
    workspaceId: string,
    invitationId: string,
): Promise<WorkspaceInvitation> =>
    apiRequest<WorkspaceInvitation>(
        `${BASE}/${workspaceId}/invitations/${invitationId}`,
        { method: "DELETE" },
    )

// ---------------------------------------------------------------------------
// Invitations — invitee side
// ---------------------------------------------------------------------------

/** Invitations waiting for the signed-in user, matched on their account email. */
export const getIncomingInvitations = (): Promise<IncomingInvitation[]> =>
    apiRequest<IncomingInvitation[]>(`${BASE}/invitations`)

/** Preview an invitation from its link, before the user accepts or declines. */
export const getInvitationByToken = (token: string): Promise<IncomingInvitation> =>
    apiRequest<IncomingInvitation>(`${BASE}/invitations/${token}`)

/** Accepting also switches the user's active workspace to the one they joined. */
export const acceptInvitation = (token: string): Promise<Workspace> =>
    apiRequest<Workspace>(`${BASE}/invitations/${token}/accept`, {
        method: "POST",
    })

export const rejectInvitation = (token: string): Promise<WorkspaceInvitation> =>
    apiRequest<WorkspaceInvitation>(`${BASE}/invitations/${token}/reject`, {
        method: "POST",
    })

// ---------------------------------------------------------------------------
// Activity
// ---------------------------------------------------------------------------

export const getActivity = (
    workspaceId: string,
    params?: { page?: number; limit?: number },
): Promise<PaginatedActivity> =>
    apiRequest<PaginatedActivity>(
        `${BASE}/${workspaceId}/activity${buildQuery(params)}`,
    )
