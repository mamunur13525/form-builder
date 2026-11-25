import { apiRequest, apiRequestVoid } from "./client"

export type GalleryMediaType = "image" | "gif" | "icon"
export type GallerySource = "upload" | "link" | "cover" | "unsplash"

export interface GalleryItem {
    id: string
    url: string
    thumbnailUrl: string
    fileId: string
    name: string
    source: GallerySource
    mediaType: GalleryMediaType
    width?: number
    height?: number
    lastUsedAt: string
    createdAt: string
}

export interface SaveGalleryItemInput {
    url: string
    thumbnailUrl?: string
    fileId?: string
    name?: string
    source?: GallerySource
    mediaType?: GalleryMediaType
    width?: number
    height?: number
}

export const GALLERY_QUERY_KEY = ["gallery"] as const

export async function listGalleryItems(): Promise<GalleryItem[]> {
    return apiRequest<GalleryItem[]>("/gallery", { method: "GET" })
}

export async function saveGalleryItem(input: SaveGalleryItemInput): Promise<GalleryItem> {
    return apiRequest<GalleryItem>("/gallery", {
        method: "POST",
        body: JSON.stringify(input),
    })
}

export async function deleteGalleryItem(id: string): Promise<void> {
    return apiRequestVoid(`/gallery/${id}`, { method: "DELETE" })
}
