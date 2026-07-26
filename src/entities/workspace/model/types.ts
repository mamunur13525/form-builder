/** Workspace types that match the backend API documentation. */

export type WorkspaceRole = "admin" | "editor" | "viewer"

export interface Workspace {
    id: string
    name: string
    description?: string
    createdBy: string
    createdAt: string
    updatedAt: string
}

export interface WorkspaceMember {
    id: string
    workspaceId: string
    userId: string
    role: WorkspaceRole
    joinedAt: string
}

export interface CreateWorkspaceRequest {
    name: string
    description?: string
}

export interface UpdateWorkspaceRequest {
    name?: string
    description?: string
}

export interface AddWorkspaceMemberRequest {
    userId: string
    role: WorkspaceRole
}

export interface UpdateWorkspaceMemberRequest {
    role: WorkspaceRole
}
