import { useParams } from "react-router-dom"
import { FormView } from "../../shared/components/FormView"
import { usePublicForm } from "../../features/forms/hooks/usePublicForm"

export function FormFillPage() {
    const { slug } = useParams()
    const { data: form, isLoading, isError } = usePublicForm(slug || "")

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-muted/30">
                <p className="text-muted-foreground">Loading form...</p>
            </div>
        )
    }

    if (isError || !form) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-muted/30">
                <div className="text-center">
                    <h2 className="text-2xl font-bold">Form not found</h2>
                    <p className="text-muted-foreground mt-2">The form you're looking for doesn't exist.</p>
                </div>
            </div>
        )
    }

    return <FormView form={form} mode="published" />
}
