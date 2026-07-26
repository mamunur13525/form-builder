/** Upload types that match the backend API documentation. */

export interface UploadResponse {
    fileId: string
    filename: string
    mimeType: string
    size: number
    url: string
}

export interface UploadFileRequest {
    file: File
}
