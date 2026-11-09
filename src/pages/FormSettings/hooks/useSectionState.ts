import { useEffect, useRef, useState } from "react"

/**
 * Local editing state for one settings section, wired to server data.
 *
 * Responsibilities:
 *  - Hold the editable copy of the section's values (`values` / `setValues`).
 *  - Seed those values from the server (`loaded`) once it arrives, and re-seed
 *    on later refetches — but only while the user has no unsaved edits, so a
 *    background refetch never discards in-progress changes.
 *  - Expose `dirty` (local values differ from the last loaded/saved baseline).
 *  - Expose `commit(next)` to adopt `next` as the new clean baseline after a
 *    successful save.
 *
 * `loaded` should be the fully-normalized section value (merge server data with
 * your defaults at the call site, memoized so its identity is stable between
 * renders). Pass `undefined` while the data is still loading.
 *
 * Equality is a structural JSON comparison, which is sufficient for the plain,
 * serializable shapes these sections hold.
 */
export function useSectionState<T>(loaded: T | undefined, defaults: T) {
    const [values, setValues] = useState<T>(defaults)
    const [baseline, setBaseline] = useState<T>(defaults)

    // Track the latest values without making them an effect dependency of the loader.
    const valuesRef = useRef<T>(values)
    useEffect(() => {
        valuesRef.current = values
    })

    useEffect(() => {
        if (loaded === undefined) return
        setBaseline((prevBaseline) => {
            const isClean =
                JSON.stringify(valuesRef.current) === JSON.stringify(prevBaseline)
            if (isClean) setValues(loaded)
            return loaded
        })
    }, [loaded])

    const dirty = JSON.stringify(values) !== JSON.stringify(baseline)

    const commit = (next: T) => {
        setBaseline(next)
        setValues(next)
    }

    return { values, setValues, dirty, commit }
}
