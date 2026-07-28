import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import { Button } from "../../components/ui/button"
import { Badge } from "../../components/ui/badge"
import { FormView } from "../../shared/components/FormView"
import { useForm } from "../../features/forms/hooks/useForms"
import { adaptApiForm } from "../../features/forms/model/adapters"

export function FormPreviewPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { data: apiForm, isLoading } = useForm(id || "")
    console.log('form preveiw page.')
    if (isLoading) {
        return (
            <div className="text-center py-20">
                <p className="text-muted-foreground">Loading form...</p>
            </div>
        )
    }

    if (!apiForm) {
        return (
            <div className="text-center py-20">
                <h2 className="text-2xl font-bold">Form not found</h2>
                <Button className="mt-4" onClick={() => navigate("/dashboard")}>
                    Back to Dashboard
                </Button>
            </div>
        )
    }

    const form = adaptApiForm(apiForm)

    return (
        <div className="min-h-screen flex flex-col bg-muted/30">
            <div className="flex items-center justify-between p-4 border-b bg-background">
                <Button variant="ghost" size="icon" onClick={() => navigate(`/form-builder/${form.id}`)}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <Badge variant="outline">Preview Mode</Badge>
            </div>
            <div className="flex-1">
                <FormView form={form} mode="preview" />
            </div>
        </div>
    )
}
