import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import { Button } from "../../components/ui/button"
import { Badge } from "../../components/ui/badge"
import { FormView } from "../../shared/components/FormView"
import { mockForms } from "../../shared/utils/mockData"

export function FormPreviewPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const form = mockForms.find((f) => f._id === id)

    if (!form) {
        return (
            <div className="text-center py-20">
                <h2 className="text-2xl font-bold">Form not found</h2>
                <Button className="mt-4" onClick={() => navigate("/dashboard")}>
                    Back to Dashboard
                </Button>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex flex-col bg-muted/30">
            <div className="flex items-center justify-between p-4 border-b bg-background">
                <Button variant="ghost" size="icon" onClick={() => navigate(`/form-builder/${form._id}`)}>
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
