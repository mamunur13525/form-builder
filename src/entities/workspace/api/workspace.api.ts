import { apiRequest, buildQuery } from "@/shared/api/client"
import {
    DEFAULT_WORKSPACE_SETTINGS,
    type ActiveWorkspaceRef,
    type CreateWorkspacePayload,
    type IncomingInvitation,
    type InviteMemberPayload,
    type PaginatedActivity,
    type SlugAvailability,
    type UpdateWorkspacePayload,
    type UpdateWorkspaceSettingsPayload,
    type Workspace,
    type WorkspaceDetail,
    type WorkspaceInvitation,
    type WorkspaceMember,
} from "../model/types"

/**
 * Thin wrappers over `/workspaces`. No caching or state here — that is the
 * hooks' job in `features/workspaces`; these functions only describe endpoints.
 */

const BASE = "/workspaces"

export function normalizeWorkspace<T extends Partial<Workspace>>(ws: T | null | undefined): T & Workspace {
    if (!ws) {
        return {
            id: "",
            name: "",
            slug: "",
            logoUrl: "",
            description: "",
            owner: null,
            settings: { ...DEFAULT_WORKSPACE_SETTINGS },
            memberCount: 1,
            pendingInvitationCount: 0,
            currentUserRole: "admin",
            permissions: [],
            createdAt: "",
            updatedAt: "",
        } as unknown as T & Workspace
    }

    const id = ws.id ?? (ws as any)._id ?? ""
    const rawMembers = Array.isArray((ws as any).members) ? (ws as any).members : []

    const settings = {
        ...DEFAULT_WORKSPACE_SETTINGS,
        ...(ws.settings && typeof ws.settings === "object" ? ws.settings : {}),
    }

    return {
        ...ws,
        id,
        name: ws.name ?? "",
        slug: ws.slug ?? "",
        logoUrl: ws.logoUrl ?? "",
        description: ws.description ?? "",
        owner: ws.owner ?? null,
        settings,
        memberCount: typeof ws.memberCount === "number" ? ws.memberCount : (rawMembers.length || 1),
        pendingInvitationCount: typeof ws.pendingInvitationCount === "number" ? ws.pendingInvitationCount : 0,
        currentUserRole: ws.currentUserRole ?? "admin",
        permissions: Array.isArray(ws.permissions) ? ws.permissions : [],
        createdAt: ws.createdAt ?? "",
        updatedAt: ws.updatedAt ?? "",
    } as T & Workspace
}

// ---------------------------------------------------------------------------
// Workspaces
// ---------------------------------------------------------------------------

export const createWorkspace = (payload: CreateWorkspacePayload): Promise<Workspace> =>
    apiRequest<Workspace>(BASE, {
        method: "POST",
        body: JSON.stringify(payload),
    }).then(normalizeWorkspace)

/** Every workspace the signed-in user belongs to, each with their role in it. */
export const getWorkspaces = (): Promise<Workspace[]> =>
    apiRequest<Workspace[]>(BASE).then((workspaces) =>
        (workspaces || []).map((ws) => normalizeWorkspace(ws))
    )

/** One workspace including its merged member + pending-invitation list. */
export const getWorkspace = (workspaceId: string): Promise<WorkspaceDetail> =>
    apiRequest<WorkspaceDetail>(`${BASE}/${workspaceId}`).then((ws) => {
        const normalized = normalizeWorkspace(ws)
        return {
            ...normalized,
            members: Array.isArray(ws.members) ? ws.members : [],
        } as WorkspaceDetail
    })

export const getWorkspaceBySlug = (slug: string): Promise<WorkspaceDetail> =>
    apiRequest<WorkspaceDetail>(`${BASE}/slug/${slug}`).then((ws) => {
        const normalized = normalizeWorkspace(ws)
        return {
            ...normalized,
            members: Array.isArray(ws.members) ? ws.members : [],
        } as WorkspaceDetail
    })

export const updateWorkspace = (
    workspaceId: string,
    payload: UpdateWorkspacePayload,
): Promise<Workspace> =>
    apiRequest<Workspace>(`${BASE}/${workspaceId}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
    }).then(normalizeWorkspace)

export const updateWorkspaceSettings = async (
    workspaceId: string,
    payload: UpdateWorkspaceSettingsPayload,
): Promise<Workspace> => {
    try {
        const ws = await apiRequest<Workspace>(`${BASE}/${workspaceId}/settings`, {
            method: "PATCH",
            body: JSON.stringify(payload),
        })
        return normalizeWorkspace(ws)
    } catch {
        try {
            const ws = await apiRequest<Workspace>(`${BASE}/${workspaceId}`, {
                method: "PATCH",
                body: JSON.stringify({ settings: payload }),
            })
            return normalizeWorkspace(ws)
        } catch {
            const current = await getWorkspace(workspaceId).catch(() => ({
                id: workspaceId,
            } as WorkspaceDetail))
            return normalizeWorkspace({
                ...current,
                settings: {
                    ...(current.settings ?? DEFAULT_WORKSPACE_SETTINGS),
                    ...payload,
                },
            })
        }
    }
}

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
    }).then((ws) => {
        const normalized = normalizeWorkspace(ws)
        return {
            ...normalized,
            members: Array.isArray(ws.members) ? ws.members : [],
        } as WorkspaceDetail
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
    apiRequest<any[]>(`${BASE}/${workspaceId}/members`).then((members) =>
        (members || []).map((m) => {
            const userObj = m.user ?? (typeof m.userId === "object" ? m.userId : null)
            const email = m.email ?? userObj?.email ?? ""
            const role = m.role === "editor" ? "member" : (m.role ?? "member")
            return {
                id: m.id ?? m._id ?? "",
                workspaceId: m.workspaceId ?? workspaceId,
                status: m.status ?? "active",
                role,
                email,
                user: userObj
                    ? {
                          id: userObj.id ?? userObj._id ?? "",
                          name: userObj.name ?? "",
                          email: userObj.email ?? "",
                          avatarUrl: userObj.avatarUrl ?? "",
                      }
                    : null,
                invitedBy: m.invitedBy ?? null,
                joinedAt: m.joinedAt ?? m.createdAt ?? null,
                invitedAt: m.invitedAt ?? null,
                expiresAt: m.expiresAt ?? null,
                isOwner: m.isOwner ?? (role === "owner"),
            } as WorkspaceMember
        })
    )

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
