/**
 * Form Blocks feature hooks — TanStack Query wrappers around the block entity API.
 *
 * Query keys:
 *   ["forms", formId, "blocks"]                 — list of blocks
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import type {
    CreateBlockRequest,
    FormBlock,
    ReorderBlocksRequest,
    UpdateBlockRequest,
} from "@/entities/form/model/types"
import {
    createBlock,
    deleteBlock,
    getBlocks,
    reorderBlocks,
    updateBlock,
} from "@/entities/form/api/block.api"

const BLOCKS_QUERY_KEY = (formId: string) => ["forms", formId, "blocks"]

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

/** GET /forms/:formId/blocks — get all blocks for a form. */
export function useBlocks(formId: string) {
    return useQuery({
        queryKey: BLOCKS_QUERY_KEY(formId),
        queryFn: () => getBlocks(formId),
        enabled: !!formId,
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
    })
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

/** POST /forms/:formId/blocks — create a new block/section in a form. */
export function useCreateBlock() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ formId, data }: { formId: string; data: CreateBlockRequest }) =>
            createBlock(formId, data),
        onSuccess: (_updated: FormBlock, { formId }) => {
            queryClient.invalidateQueries({ queryKey: BLOCKS_QUERY_KEY(formId) })
        },
    })
}

/** PATCH /forms/:formId/blocks/:blockId — update a block. */
export function useUpdateBlock() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ formId, blockId, data }: { formId: string; blockId: string; data: UpdateBlockRequest }) =>
            updateBlock(formId, blockId, data),
        onSuccess: (updated: FormBlock, { formId }) => {
            queryClient.setQueryData([...BLOCKS_QUERY_KEY(formId), updated.id], updated)
        },
    })
}

/** DELETE /forms/:formId/blocks/:blockId — delete a block. */
export function useDeleteBlock() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ formId, blockId }: { formId: string; blockId: string }) =>
            deleteBlock(formId, blockId),
        onSuccess: (_void: void, { formId }) => {
            queryClient.invalidateQueries({ queryKey: BLOCKS_QUERY_KEY(formId) })
        },
    })
}

/** PATCH /forms/:formId/blocks/reorder — reorder blocks in a form. */
export function useReorderBlocks() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ formId, data }: { formId: string; data: ReorderBlocksRequest }) =>
            reorderBlocks(formId, data),
        onSuccess: (_void: void, { formId }) => {
            queryClient.invalidateQueries({ queryKey: BLOCKS_QUERY_KEY(formId) })
        },
    })
}
