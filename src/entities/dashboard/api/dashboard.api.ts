/**
 * Dashboard API — wraps every endpoint documented under "Dashboard Endpoints (Admin Only)" in API_DOCUMENTATION.md.
 */

import { apiRequest } from "@/shared/api/client"
import type {
    DashboardActivity,
    DashboardOverview,
    DashboardResponses,
    DashboardUsers,
} from "@/entities/dashboard/model/types"
import type { Form } from "@/entities/form/model/types"

/** GET /dashboard/overview — get dashboard overview statistics (admin only). */
export async function getDashboardOverview(): Promise<DashboardOverview> {
    return apiRequest<DashboardOverview>("/dashboard/overview")
}

/** GET /dashboard/forms — get recent forms for dashboard (admin only). */
export async function getDashboardForms(): Promise<Form[]> {
    return apiRequest<Form[]>("/dashboard/forms")
}

/** GET /dashboard/responses — get response statistics for dashboard (admin only). */
export async function getDashboardResponses(): Promise<DashboardResponses> {
    return apiRequest<DashboardResponses>("/dashboard/responses")
}

/** GET /dashboard/users — get user statistics for dashboard (admin only). */
export async function getDashboardUsers(): Promise<DashboardUsers> {
    return apiRequest<DashboardUsers>("/dashboard/users")
}

/** GET /dashboard/activity — get recent activity for dashboard (admin only). */
export async function getDashboardActivity(): Promise<DashboardActivity[]> {
    return apiRequest<DashboardActivity[]>("/dashboard/activity")
}
