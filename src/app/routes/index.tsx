import { createBrowserRouter, Outlet, Navigate } from "react-router-dom"
import { AppProvider } from "../providers/AppProvider"
import { MainLayout } from "../layouts/MainLayout"
import { AuthLayout } from "../layouts/AuthLayout"
import { HomePage } from "../../pages/Home"
import { LoginPage } from "../../pages/Login"
import { SignupPage } from "../../pages/Signup"
import { ForgotPasswordPage } from "../../pages/ForgotPassword"
import { DashboardPage } from "../../pages/Dashboard"
import { FormsPage } from "../../pages/Forms"
import { TemplatesPage } from "../../pages/Templates"
import { SettingsPage } from "../../pages/Settings"
import { PricingPage } from "../../pages/Pricing"
import { FormBuilderPage } from "../../pages/FormBuilder"
import { SubmissionsPage } from "../../pages/FormResponse"
import { SummaryPage } from "../../pages/FormResponse"
import { AnalyticsPage } from "../../pages/FormResponse"
import { FormSettingsPage } from "../../pages/FormSettings/FormSettingsPage"
import { FormIntegrationsPage } from "../../pages/FormIntegrations/FormIntegrationsPage"
import { FormSharePage } from "../../pages/FormShare/FormSharePage"
import { FormFillPage } from "../../pages/FormFill"
import { FormLayout } from "../layouts/FormLayout"
import { ROUTES } from "@/shared/constants/routes"
import { tokenStorage } from "@/shared/utils/storage"

function AppShell() {
    return (
        <AppProvider>
            <Outlet />
        </AppProvider>
    )
}

function ProtectedLayout() {
    const hasToken = !!tokenStorage.getAccessToken()
    
    if (!hasToken) {
        return <Navigate to={ROUTES.LOGIN} replace />
    }
    
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
                    { path: ROUTES.FORGOT_PASSWORD, element: <ForgotPasswordPage /> },
                ],
            },
            {
                element: <ProtectedLayout />,
                children: [
                    { path: ROUTES.DASHBOARD, element: <DashboardPage /> },
                    { path: ROUTES.FORMS, element: <FormsPage /> },
                    { path: ROUTES.TEMPLATES, element: <TemplatesPage /> },
                    { path: ROUTES.SETTINGS, element: <SettingsPage /> },
                    { path: ROUTES.PRICING, element: <PricingPage /> },
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
                ],
            },
            { path: ROUTES.FORM_FILL, element: <FormFillPage /> },
            { path: "*", element: <Navigate to={ROUTES.HOME} replace /> },
        ],
    },
])
