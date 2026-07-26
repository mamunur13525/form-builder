/**
 * Notification API — wraps every endpoint documented under "Notifications Endpoints" in API_DOCUMENTATION.md.
 */

import { apiRequest, apiRequestVoid } from "@/shared/api/client"
import type { Notification } from "@/entities/notification/model/types"

/** GET /notifications — get all notifications for the current user. */
export async function getNotifications(): Promise<Notification[]> {
    return apiRequest<Notification[]>("/notifications")
}

/** PATCH /notifications/:id/read — mark a notification as read. */
export async function markNotificationAsRead(id: number): Promise<Notification> {
    return apiRequest<Notification>(`/notifications/${id}/read`, { method: "PATCH" })
}

/** PATCH /notifications/read-all — mark all notifications as read. */
export async function markAllNotificationsAsRead(): Promise<void> {
    return apiRequestVoid("/notifications/read-all", { method: "PATCH" })
}

/** DELETE /notifications/:id — delete a notification. */
export async function deleteNotification(id: number): Promise<void> {
    return apiRequestVoid(`/notifications/${id}`, { method: "DELETE" })
}
