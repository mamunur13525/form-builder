import { useState } from "react";
import { DeleteFormDialog } from "./components/DeleteFormDialog";
import { FormDialog } from "./components/FormDialog";
import { FormCard } from "./components/FormCard";
import { DuplicateFormDialog } from "./components/DuplicateFormDialog";
import { PlusCircle, FileText, Eye, BarChart3 } from "lucide-react";
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
  const [duplicateDialogOpen, setDuplicateDialogOpen] = useState(false);
  const [formToDuplicate, setFormToDuplicate] = useState<{
    id: string;
    title: string;
  } | null>(null);

  const { data: forms = [], isLoading } = useForms();

  const publishedForms = forms.filter((f) => f.status === "published").length;
  const draftForms = forms.filter((f) => f.status === "draft").length;
  const totalResponses = forms.reduce(
    (acc, form) => acc + (form.responses_count || 0),
    0,
  );

  if (isLoading) {
    return (
      <div className="editorial flex h-96 items-center justify-center">
        <p className="text-base text-[var(--editorial-subtle)]">
          Loading forms...
        </p>
      </div>
    );
  }

  return (
    <div className="editorial mx-auto w-full max-w-[1600px] space-y-8 px-4 pt-8 pb-12 sm:space-y-12 sm:px-6 sm:pt-12 sm:pb-16 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between sm:gap-8">
        <div>
          <h1 className="font-display text-[32px] leading-[1.1] sm:text-[48px] text-[var(--foreground)]">
            Dashboard
          </h1>
          <p className="mt-1 text-sm leading-6 sm:mt-2 sm:text-base text-[var(--editorial-body)]">
            Manage your forms and view responses
          </p>
        </div>
        <Button
          onClick={() => setCreateDialogOpen(true)}
        >
          <PlusCircle className="h-5 w-5" />
          <span className="hidden sm:inline">New Form</span>
          <span className="sm:hidden">New</span>
        </Button>
      </div>

      <FormDialog
        type="create"
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />

      <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="editorial-shadow-sm border-[var(--border)] bg-[var(--card)]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="editorial-eyebrow text-[var(--editorial-subtle)]">
              Total Forms
            </CardTitle>
            <FileText className="h-5 w-5 text-[var(--editorial-subtle)]" />
          </CardHeader>
          <CardContent >
            <div className="font-display text-[32px] leading-none sm:text-[40px] text-[var(--foreground)]">
              {forms.length}
            </div>
            <p className="mt-3 text-sm text-[var(--editorial-body)]">
              {publishedForms} published, {draftForms} drafts
            </p>
          </CardContent>
        </Card>
        <Card className="editorial-shadow-sm border-[var(--border)] bg-[var(--card)]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 ">
            <CardTitle className="editorial-eyebrow text-[var(--editorial-subtle)]">
              Total Responses
            </CardTitle>
            <BarChart3 className="h-5 w-5 text-[var(--editorial-subtle)]" />
          </CardHeader>
          <CardContent>
            <div className="font-display text-[32px] leading-none sm:text-[40px] text-[var(--foreground)]">
              {totalResponses}
            </div>
            <p className="mt-3 text-sm text-[var(--editorial-body)]">
              Across all forms
            </p>
          </CardContent>
        </Card>
        <Card className="editorial-shadow-sm border-[var(--border)] bg-[var(--card)]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 ">
            <CardTitle className="editorial-eyebrow text-[var(--editorial-subtle)]">
              Published
            </CardTitle>
            <Eye className="h-5 w-5 text-[var(--editorial-subtle)]" />
          </CardHeader>
          <CardContent>
            <div className="font-display text-[32px] leading-none sm:text-[40px] text-[var(--foreground)]">
              {publishedForms}
            </div>
            <p className="mt-3 text-sm text-[var(--editorial-body)]">
              Forms live and accepting responses
            </p>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="mb-4 font-display text-[24px] leading-tight sm:mb-6 sm:text-[32px] text-[var(--foreground)]">
          Your Forms
        </h2>
        {forms.length === 0 ? (
          <Card className="editorial-shadow-sm border-[var(--border)] bg-[var(--card)]">
            <CardContent className="py-16 text-center space-y-5">
              <p className="text-base text-[var(--editorial-subtle)]">
                No forms yet
              </p>
              <Button
                onClick={() => setCreateDialogOpen(true)}
              >
                Create your first form
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {forms.map((form) => (
              <FormCard
                key={form.id}
                form={form}
                onDeleteClick={(formId) => {
                  setFormToDelete(formId);
                  setDeleteAlertOpen(true);
                }}
                onDuplicateClick={(formId) => {
                  setFormToDuplicate({ id: formId, title: form.title });
                  setDuplicateDialogOpen(true);
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

      <DuplicateFormDialog
        formId={formToDuplicate?.id || ""}
        formTitle={formToDuplicate?.title + " copy" || ""}
        open={duplicateDialogOpen}
        onOpenChange={setDuplicateDialogOpen}
      />
    </div>
  );
}
