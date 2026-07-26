/**
 * Form Block (Section) API — wraps every endpoint documented under "Form Blocks (Sections) Endpoints" in API_DOCUMENTATION.md.
 */

import { apiRequest, apiRequestVoid } from "@/shared/api/client"
import type {
    CreateBlockRequest,
    FormBlock,
    ReorderBlocksRequest,
    UpdateBlockRequest,
} from "@/entities/form/model/types"

/** POST /forms/:formId/blocks — create a new block/section in a form. */
export async function createBlock(formId: string, data: CreateBlockRequest): Promise<FormBlock> {
    return apiRequest<FormBlock>(`/forms/${formId}/blocks`, {
        method: "POST",
        body: JSON.stringify(data),
    })
}

/** GET /forms/:formId/blocks — get all blocks for a form. */
export async function getBlocks(formId: string): Promise<FormBlock[]> {
    return apiRequest<FormBlock[]>(`/forms/${formId}/blocks`)
}

/** PATCH /forms/:formId/blocks/:blockId — update a block. */
export async function updateBlock(
    formId: string,
    blockId: string,
    data: UpdateBlockRequest,
): Promise<FormBlock> {
    return apiRequest<FormBlock>(`/forms/${formId}/blocks/${blockId}`, {
        method: "PATCH",
        body: JSON.stringify(data),
    })
}

/** DELETE /forms/:formId/blocks/:blockId — delete a block. */
export async function deleteBlock(formId: string, blockId: string): Promise<void> {
    return apiRequestVoid(`/forms/${formId}/blocks/${blockId}`, { method: "DELETE" })
}

/** PATCH /forms/:formId/blocks/reorder — reorder blocks in a form. */
export async function reorderBlocks(formId: string, data: ReorderBlocksRequest): Promise<void> {
    return apiRequestVoid(`/forms/${formId}/blocks/reorder`, {
        method: "PATCH",
        body: JSON.stringify(data),
    })
}
