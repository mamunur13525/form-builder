import { useState } from "react";
import { DeleteFormDialog } from "./components/DeleteFormDialog";
import { FormDialog } from "./components/FormDialog";
import { FormCard } from "./components/FormCard";
import {
  PlusCircle,
  FileText,
  Eye,
  BarChart3,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../components/ui/card";
import { useForms } from "../../features/forms/hooks/useForms";

export function DashboardPage() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const [formToDelete, setFormToDelete] = useState<string | null>(null);

  const { data: forms = [], isLoading } = useForms();

  const publishedForms = forms.filter((f) => f.status === "published").length;
  const draftForms = forms.filter((f) => f.status === "draft").length;
  const totalResponses = forms.reduce(
    (acc, form) => acc + (form.responses_count || 0),
    0,
  );


  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Loading forms...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-base text-muted-foreground">

            Manage your forms and view responses
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Form
        </Button>
      </div>

      <FormDialog type="create" open={createDialogOpen} onOpenChange={setCreateDialogOpen} />

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-medium">Total Forms</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{forms.length}</div>
            <p className="text-sm text-muted-foreground">
              {publishedForms} published, {draftForms} drafts
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-medium">
              Total Responses
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalResponses}</div>
            <p className="text-sm text-muted-foreground">Across all forms</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-medium">Published</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{publishedForms}</div>
            <p className="text-sm text-muted-foreground">
              Forms live and accepting responses
            </p>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-4">Your Forms</h2>
        {forms.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">No forms yet</p>
              <Button className="mt-4" onClick={() => setCreateDialogOpen(true)}>
                Create your first form
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {forms.map((form) => (
              <FormCard
                key={form.id}
                form={form}
                onDeleteClick={(formId) => {
                  setFormToDelete(formId);
                  setDeleteAlertOpen(true);
                }}
              />
            ))}
          </div>
        )}
      </div>

      <DeleteFormDialog
        formId={formToDelete || ""}
        formTitle={forms.find((f) => f.id === formToDelete)?.title || ""}
        open={deleteAlertOpen}
        onOpenChange={setDeleteAlertOpen}
      />
    </div>
  );
}