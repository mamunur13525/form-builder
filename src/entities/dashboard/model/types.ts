/** Dashboard types that match the backend API documentation. */

export interface DashboardRecentForm {
    id: string
    title: string
    status: string
    createdAt: string
}

export interface DashboardOverview {
    totalForms: number
    totalResponses: number
    totalUsers: number
    recentForms: DashboardRecentForm[]
}

export interface DashboardResponses {
    total: number
    today: number
    thisWeek: number
    thisMonth: number
}

export interface DashboardUsers {
    total: number
    active: number
    admins: number
    editors: number
    viewers: number
}

export interface DashboardActivity {
    id: string
    formId: { title: string }
    submittedAt: string
}
