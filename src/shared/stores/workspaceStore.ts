/**
 * Which workspace the user is currently looking at.
 *
 * Persisted to localStorage so a reload does not bounce the user back to their
 * default workspace before the server's `/workspaces/active` response lands.
 * The server copy (`User.lastActiveWorkspace`) remains the source of truth —
 * this store is the fast local cache that avoids a flash of the wrong
 * workspace, and `useActiveWorkspace` reconciles the two.
 */

import { create } from "zustand"
import { persist } from "zustand/middleware"

interface WorkspaceStore {
    activeWorkspaceId: string | null
    setActiveWorkspaceId: (workspaceId: string | null) => void
    clearActiveWorkspaceId: () => void
}

export const useWorkspaceStore = create<WorkspaceStore>()(
    persist(
        (set) => ({
            activeWorkspaceId: null,

            setActiveWorkspaceId: (workspaceId: string | null) => {
                set({ activeWorkspaceId: workspaceId })
            },

            clearActiveWorkspaceId: () => {
                set({ activeWorkspaceId: null })
            },
        }),
        {
            name: "workspace-storage",
        },
    ),
)
