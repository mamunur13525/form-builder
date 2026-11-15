import { apiRequest } from "./client"

export interface UploadedImage {
    url: string
    thumbnailUrl: string
    fileId: string
    width?: number
    height?: number
}

/**
 * Upload an image to ImageKit via backend endpoint POST /uploads/image.
 * Returns the CDN hosted URL.
 */
export async function uploadImage(file: File): Promise<UploadedImage> {
    const form = new FormData()
    form.append("file", file)
    return apiRequest<UploadedImage>("/uploads/image", {
        method: "POST",
        body: form,
    })
}
