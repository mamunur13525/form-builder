/**
 * Upload API — wraps every endpoint documented under "Uploads Endpoints" in API_DOCUMENTATION.md.
 */

import { apiRequest, apiRequestVoid } from "@/shared/api/client"
import type { UploadResponse } from "@/entities/upload/model/types"

/** POST /uploads — upload a file. */
export async function uploadFile(file: File): Promise<UploadResponse> {
    const formData = new FormData()
    formData.append("file", file)

    return apiRequest<UploadResponse>("/uploads", {
        method: "POST",
        body: formData,
    })
}

/** GET /uploads/:fileId — get/download a file (public, no auth). */
export function getFileUrl(fileId: string): string {
    return `/api/v1/uploads/${fileId}`
}

/** DELETE /uploads/:fileId — delete a file. */
export async function deleteFile(fileId: string): Promise<void> {
    return apiRequestVoid(`/uploads/${fileId}`, { method: "DELETE" })
}
