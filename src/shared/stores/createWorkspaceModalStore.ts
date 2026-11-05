import { create } from "zustand"

interface CreateWorkspaceModalStore {
    open: boolean
    openCreateWorkspace: () => void
    setCreateWorkspaceOpen: (open: boolean) => void
}

export const useCreateWorkspaceModalStore = create<CreateWorkspaceModalStore>((set) => ({
    open: false,
    openCreateWorkspace: () => set({ open: true }),
    setCreateWorkspaceOpen: (open) => set({ open }),
}))
