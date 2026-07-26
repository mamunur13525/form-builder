import { createBrowserRouter, Outlet, Navigate } from "react-router-dom"
import { AppProvider } from "../providers/AppProvider"
import { MainLayout } from "../layouts/MainLayout"
import { AuthLayout } from "../layouts/AuthLayout"
import { HomePage } from "../../pages/Home"
import { LoginPage } from "../../pages/Login"
import { DashboardPage } from "../../pages/Dashboard"
import { FormBuilderPage } from "../../pages/FormBuilder"
import { FormPreviewPage } from "../../pages/FormPreview"
import { FormResponsePage } from "../../pages/FormResponse"
import { FormFillPage } from "../../pages/FormFill"

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
            { path: "/", element: <HomePage /> },
            {
                element: <PublicLayout />,
                children: [
                    { path: "/login", element: <LoginPage /> },
                ],
            },
            {
                element: <ProtectedLayout />,
                children: [
                    { path: "/dashboard", element: <DashboardPage /> },
                    { path: "/form-builder/:id", element: <FormBuilderPage /> },
                    { path: "/form-preview/:id", element: <FormPreviewPage /> },
                    { path: "/form-response/:id", element: <FormResponsePage /> },
                ],
            },
            { path: "/form/:slug", element: <FormFillPage /> },
            { path: "*", element: <Navigate to="/" replace /> },
        ],
    },
])