import { useId } from "react"
import { cn } from "@/lib/utils"
import { DEFAULT_ADDRESS_PLACEHOLDERS } from "@/shared/constants/address"
import type { AddressPageSetting, FieldsPerRow } from "@/shared/types/common"
import { getFieldSpanClass } from "./fieldSpan"

type AddressValue = Record<string, string>

interface AddressPageProps {
    value?: AddressValue
    onChange?: (value: AddressValue) => void
    pages: AddressPageSetting[]
    fieldsPerRow?: FieldsPerRow
    isMobileView?: boolean
    disabled?: boolean
    color?: string
    fontSizeClass?: string
}

export function AddressPage({
    value,
    onChange,
    pages,
    fieldsPerRow,
    isMobileView,
    disabled,
    color,
    fontSizeClass,
}: AddressPageProps) {
    const idPrefix = useId()
    const current = value ?? {}
    const visible = pages
        .filter((f) => !f.hidden)
        .slice()
        .sort((a, b) => a.order - b.order)

    const mobileCols = fieldsPerRow?.mobile === 2 ? 2 : 1
    const desktopCols = fieldsPerRow?.desktop === 1 ? 1 : 2
    const defaultWideKeys = ["zip", "country"]

    return (
        <div
            className={cn(
                "grid gap-x-6 gap-y-6",
                isMobileView
                    ? mobileCols === 2 ? "grid-cols-2" : "grid-cols-1"
                    : [
                        "md:gap-y-8",
                        mobileCols === 2 ? "grid-cols-2" : "grid-cols-1",
                        desktopCols === 1 ? "md:grid-cols-1" : "md:grid-cols-2",
                    ],
            )}
        >
            {visible.map((page) => {
                const id = `${idPrefix}-${page.key}`
                const spanClass = getFieldSpanClass(
                    page.key,
                    page.width,
                    defaultWideKeys,
                    mobileCols,
                    desktopCols,
                    isMobileView,
                )
                return (
                    <div
                        key={page.key}
                        className={cn("space-y-2", spanClass)}
                    >
                        <label
                            htmlFor={id}
                            className={cn("text-base font-medium text-foreground", fontSizeClass)}
                        >
                            {page.label}
                            {page.required && <span className="ml-0.5 text-destructive">*</span>}
                        </label>
                        <input
                            id={id}
                            type="text"
                            value={current[page.key] ?? ""}
                            placeholder={page.placeholder || DEFAULT_ADDRESS_PLACEHOLDERS[page.key]}
                            disabled={disabled}
                            onChange={(e) =>
                                onChange?.({ ...current, [page.key]: e.target.value })
                            }
                            className={cn(
                                "h-9 w-full rounded-none border-0 border-b focus:border-b-2 bg-transparent px-0 text-base outline-none transition-colors duration-300 focus-visible:outline-none focus-visible:ring-0",
                                !color && "border-gray-500 focus:border-gray-200",
                                fontSizeClass,
                            )}
                            style={
                                color
                                    ? {
                                        color,
                                        borderColor: `color-mix(in oklab, ${color} 40%, transparent)`,
                                        ...({
                                            "--input-placeholder-color": `color-mix(in oklab, ${color} 40%, transparent)`,
                                        } as React.CSSProperties),
                                    }
                                    : undefined
                            }
                        />
                    </div>
                )
            })}
        </div>
    )
}
