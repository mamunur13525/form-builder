/**
 * What the signed-in user may do with forms in their active workspace.
 *
 * The permission list is computed on the server and shipped on the workspace, so
 * this hook only reads it — the role → permission matrix is never re-derived on
 * the client, where it could drift out of step with the backend.
 *
 * Hiding a control is a courtesy, not the enforcement: every form route is
 * guarded server-side, so a viewer who forges a request still gets a 403.
 */

import { useActiveWorkspace } from "@/features/workspaces/hooks/useWorkspaces"

export interface FormPermissions {
    /** Create a form, or duplicate an existing one. */
    canCreate: boolean
    /** Rename, edit pages/logic/theme, archive, restore. */
    canEdit: boolean
    canPublish: boolean
    canDelete: boolean
    /** Open submissions, analytics and exports. */
    canViewResponses: boolean
    /** Delete or edit individual submissions. */
    canManageResponses: boolean
    /** False until the workspace list has loaded — treat controls as pending. */
    isReady: boolean
}

export function useFormPermissions(): FormPermissions {
    const { can, isLoading } = useActiveWorkspace()

    return {
        canCreate: can("form:create"),
        canEdit: can("form:update"),
        canPublish: can("form:publish"),
        canDelete: can("form:delete"),
        canViewResponses: can("response:view"),
        canManageResponses: can("response:manage"),
        isReady: !isLoading,
    }
}
