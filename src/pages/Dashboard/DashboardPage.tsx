import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { PlusCircle, FileText, Eye, BarChart3 } from "lucide-react"
import { Button } from "../../components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/ui/card"
import { Badge } from "../../components/ui/badge"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Textarea } from "../../components/ui/textarea"
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../../components/ui/dialog"
import { useForms, useCreateForm } from "../../features/forms/hooks/useForms"

export function DashboardPage() {
    const navigate = useNavigate()
    const [dialogOpen, setDialogOpen] = useState(false)
    const [newTitle, setNewTitle] = useState("")
    const [newDesc, setNewDesc] = useState("")
    console.log('dashboard')

    const { data: forms = [], isLoading } = useForms()
    const createForm = useCreateForm()

    const publishedForms = forms.filter((f) => f.status === "published").length
    const draftForms = forms.filter((f) => f.status === "draft").length

    const handleCreateForm = () => {
        const title = newTitle.trim() || "Untitled Form"
        createForm.mutate(
            { title, description: newDesc },
            {
                onSuccess: (created) => {
                    navigate(`/form-builder/${created.id}`)
                },
            },
        )
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <p className="text-muted-foreground">Loading forms...</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Dashboard</h1>
                    <p className="text-muted-foreground">Manage your forms and view responses</p>
                </div>
                <Button onClick={() => setDialogOpen(true)}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    New Form
                </Button>
            </div>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogHeader>
                    <DialogTitle>Create New Form</DialogTitle>
                    <DialogDescription>Give your form a name and description to get started.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-2">
                    <div className="space-y-2">
                        <Label htmlFor="form-name">Form Name</Label>
                        <Input
                            id="form-name"
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            placeholder="e.g. Customer Feedback Survey"
                            autoFocus
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="form-desc">Description (optional)</Label>
                        <Textarea
                            id="form-desc"
                            value={newDesc}
                            onChange={(e) => setNewDesc(e.target.value)}
                            placeholder="Brief description of your form"
                            rows={3}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setDialogOpen(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleCreateForm} disabled={createForm.isPending}>
                        {createForm.isPending ? "Creating..." : "Create Form"}
                    </Button>
                </DialogFooter>
            </Dialog>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Forms</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{forms.length}</div>
                        <p className="text-xs text-muted-foreground">
                            {publishedForms} published, {draftForms} drafts
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Responses</CardTitle>
                        <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">—</div>
                        <p className="text-xs text-muted-foreground">Across all forms</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Published</CardTitle>
                        <Eye className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{publishedForms}</div>
                        <p className="text-xs text-muted-foreground">Forms live and accepting responses</p>
                    </CardContent>
                </Card>
            </div>

            <div>
                <h2 className="text-xl font-semibold mb-4">Your Forms</h2>
                {forms.length === 0 ? (
                    <Card>
                        <CardContent className="text-center py-12">
                            <p className="text-muted-foreground">No forms yet</p>
                            <Button
                                className="mt-4"
                                onClick={() => setDialogOpen(true)}
                            >
                                Create your first form
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {forms.map((form) => (
                            <Card key={form.id} className="cursor-pointer hover:shadow-md transition-shadow">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-lg">{form.title}</CardTitle>
                                        <Badge
                                            variant={
                                                form.status === "published"
                                                    ? "default"
                                                    : form.status === "draft"
                                                        ? "secondary"
                                                        : "secondary"
                                            }
                                        >
                                            {form.status}
                                        </Badge>
                                    </div>
                                    <CardDescription className="line-clamp-2">
                                        {form.description}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex gap-2 mt-3">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => navigate(`/form-builder/${form.id}`)}
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => navigate(`/form-preview/${form.id}`)}
                                        >
                                            Preview
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => navigate(`/form-response/${form.id}`)}
                                        >
                                            Responses
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
