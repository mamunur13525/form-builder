import type { FieldWidth } from "@/shared/types/common"

/** Column span for an address/contact-info field in the responsive grid. */
export function getFieldSpanClass(
    key: string,
    width?: FieldWidth,
    defaultWideKeys: string[] = [],
    mobileCols: number = 1,
    desktopCols: number = 2,
    isMobileView?: boolean,
): string {
    const isFull = width ? width === "100%" : defaultWideKeys.includes(key)
    if (isMobileView) {
        return mobileCols === 2 && isFull ? "col-span-2" : "col-span-1"
    }
    const mobileSpan = mobileCols === 2 && isFull ? "col-span-2" : "col-span-1"
    const desktopSpan = desktopCols === 2 && isFull ? "md:col-span-2" : "md:col-span-1"
    return `${mobileSpan} ${desktopSpan}`
}
