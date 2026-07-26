/** Notification types that match the backend API documentation. */

export interface Notification {
    id: number
    userId: string
    title: string
    message: string
    read: boolean
    createdAt: string
}
