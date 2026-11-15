import type { ContactInfoPageSetting } from "@/shared/types/common"

/** Sample text shown when a contact info field has no configured placeholder. */
export const DEFAULT_CONTACT_INFO_PLACEHOLDERS: Record<ContactInfoPageSetting["key"], string> = {
    firstName: "Jane",
    lastName: "Doe",
    email: "jane@example.com",
    phone: "(555) 000-0000",
    company: "Acme Inc.",
}
