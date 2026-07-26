/**
 * Workspace API — wraps every endpoint documented under "Workspaces Endpoints" in API_DOCUMENTATION.md.
 */

import { apiRequest, apiRequestVoid } from "@/shared/api/client"
import type {
    AddWorkspaceMemberRequest,
    CreateWorkspaceRequest,
    UpdateWorkspaceMemberRequest,
    UpdateWorkspaceRequest,
    Workspace,
    WorkspaceMember,
} from "@/entities/workspace/model/types"

// ---------------------------------------------------------------------------
// Workspace CRUD
// ---------------------------------------------------------------------------

/** POST /workspaces — create a new workspace. */
export async function createWorkspace(data: CreateWorkspaceRequest): Promise<Workspace> {
    return apiRequest<Workspace>("/workspaces", {
        method: "POST",
        body: JSON.stringify(data),
    })
}

/** GET /workspaces — get all workspaces for the current user. */
export async function getWorkspaces(): Promise<Workspace[]> {
    return apiRequest<Workspace[]>("/workspaces")
}

/** GET /workspaces/:workspaceId — get a workspace by ID. */
export async function getWorkspaceById(workspaceId: string): Promise<Workspace> {
    return apiRequest<Workspace>(`/workspaces/${workspaceId}`)
}

/** PATCH /workspaces/:workspaceId — update a workspace. */
export async function updateWorkspace(
    workspaceId: string,
    data: UpdateWorkspaceRequest,
): Promise<Workspace> {
    return apiRequest<Workspace>(`/workspaces/${workspaceId}`, {
        method: "PATCH",
        body: JSON.stringify(data),
    })
}

/** DELETE /workspaces/:workspaceId — delete a workspace. */
export async function deleteWorkspace(workspaceId: string): Promise<void> {
    return apiRequestVoid(`/workspaces/${workspaceId}`, { method: "DELETE" })
}

// ---------------------------------------------------------------------------
// Workspace members
// ---------------------------------------------------------------------------

/** POST /workspaces/:workspaceId/members — add a member to a workspace. */
export async function addWorkspaceMember(
    workspaceId: string,
    data: AddWorkspaceMemberRequest,
): Promise<WorkspaceMember> {
    return apiRequest<WorkspaceMember>(`/workspaces/${workspaceId}/members`, {
        method: "POST",
        body: JSON.stringify(data),
    })
}

/** GET /workspaces/:workspaceId/members — get all members of a workspace. */
export async function getWorkspaceMembers(workspaceId: string): Promise<WorkspaceMember[]> {
    return apiRequest<WorkspaceMember[]>(`/workspaces/${workspaceId}/members`)
}

/** PATCH /workspaces/:workspaceId/members/:memberId — update a workspace member's role. */
export async function updateWorkspaceMember(
    workspaceId: string,
    memberId: string,
    data: UpdateWorkspaceMemberRequest,
): Promise<WorkspaceMember> {
    return apiRequest<WorkspaceMember>(`/workspaces/${workspaceId}/members/${memberId}`, {
        method: "PATCH",
        body: JSON.stringify(data),
    })
}

/** DELETE /workspaces/:workspaceId/members/:memberId — remove a member from a workspace. */
export async function removeWorkspaceMember(
    workspaceId: string,
    memberId: string,
): Promise<void> {
    return apiRequestVoid(`/workspaces/${workspaceId}/members/${memberId}`, { method: "DELETE" })
}
