import { createBrowserRouter, Outlet, Navigate } from "react-router-dom"
import { AppProvider } from "../providers/AppProvider"
import { MainLayout } from "../layouts/MainLayout"
import { AuthLayout } from "../layouts/AuthLayout"
import { HomePage } from "../../pages/Home"
import { LoginPage } from "../../pages/Login"
import { SignupPage } from "../../pages/Signup"
import { DashboardPage } from "../../pages/Dashboard"
import { FormBuilderPage } from "../../pages/FormBuilder"
import { FormPreviewPage } from "../../pages/FormPreview"
import { SubmissionsPage } from "../../pages/FormResponse"
import { SummaryPage } from "../../pages/FormResponse"
import { AnalyticsPage } from "../../pages/FormResponse"
import { FormSettingsPage } from "../../pages/FormSettings/FormSettingsPage"
import { FormIntegrationsPage } from "../../pages/FormIntegrations/FormIntegrationsPage"
import { FormSharePage } from "../../pages/FormShare/FormSharePage"
import { FormFillPage } from "../../pages/FormFill"
import { FormLayout } from "../layouts/FormLayout"
import { ROUTES } from "@/shared/constants/routes"

function AppShell() {
    return (
        <AppProvider>
            <Outlet />
        </AppProvider>
    )
}

function ProtectedLayout() {
    return (
        <MainLayout>
            <Outlet />
        </MainLayout>
    )
}

function PublicLayout() {
    return (
        <AuthLayout>
            <Outlet />
        </AuthLayout>
    )
}

export const router = createBrowserRouter([
    {
        element: <AppShell />,
        children: [
            { path: ROUTES.HOME, element: <HomePage /> },
            {
                element: <PublicLayout />,
                children: [
                    { path: ROUTES.LOGIN, element: <LoginPage /> },
                    { path: ROUTES.SIGNUP, element: <SignupPage /> },
                ],
            },
            {
                element: <ProtectedLayout />,
                children: [
                    { path: ROUTES.DASHBOARD, element: <DashboardPage /> },
                    {
                        element: <FormLayout />,
                        children: [
                            { path: ROUTES.FORM_BUILDER, element: <FormBuilderPage /> },
                            { path: ROUTES.FORM_SETTINGS, element: <FormSettingsPage /> },
                            { path: ROUTES.FORM_INTEGRATIONS, element: <FormIntegrationsPage /> },
                            { path: ROUTES.FORM_SHARE, element: <FormSharePage /> },
                            { path: ROUTES.FORM_RESPONSE_SUBMISSIONS, element: <SubmissionsPage /> },
                            { path: ROUTES.FORM_RESPONSE_SUMMARY, element: <SummaryPage /> },
                            { path: ROUTES.FORM_RESPONSE_ANALYTICS, element: <AnalyticsPage /> },
                        ]
                    },
                    { path: ROUTES.FORM_PREVIEW, element: <FormPreviewPage /> },
                ],
            },
            { path: ROUTES.FORM_FILL, element: <FormFillPage /> },
            { path: "*", element: <Navigate to={ROUTES.HOME} replace /> },
        ],
    },
])
