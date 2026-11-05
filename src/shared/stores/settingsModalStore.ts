import { create } from "zustand"

export type SettingsSection = "account" | "workspace" | "billing" | "pricing"

interface SettingsModalStore {
    open: boolean
    section: SettingsSection
    openSettings: (section?: SettingsSection) => void
    setSection: (section: SettingsSection) => void
    closeSettings: () => void
}

export const useSettingsModalStore = create<SettingsModalStore>((set) => ({
    open: false,
    section: "account",

    openSettings: (section = "account") => {
        set({ open: true, section })
    },

    setSection: (section) => {
        set({ section })
    },

    closeSettings: () => {
        set({ open: false })
    },
}))
