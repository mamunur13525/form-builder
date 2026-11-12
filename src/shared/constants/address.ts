import type { AddressPageSetting } from "@/shared/types/common"

/** Sample text shown when an address field has no configured placeholder. */
export const DEFAULT_ADDRESS_PLACEHOLDERS: Record<AddressPageSetting["key"], string> = {
    address1: "123 Main St",
    address2: "Apt., studio, or floor",
    city: "San Francisco",
    state: "California",
    zip: "Zip",
    country: "United States",
}
