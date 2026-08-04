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
import { showError, showInfo, showSuccess, showWarning } from "@/shared/hooks/useToast";

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
      <div className="editorial flex h-96 items-center justify-center">
        <p className="text-base text-[var(--editorial-subtle)]">Loading forms...</p>
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
          className="editorial-transition h-[48px] shrink-0 gap-2 rounded-[16px] bg-[var(--primary)] px-5 text-sm font-medium text-white shadow-[0_8px_24px_rgba(238,125,105,.25)] hover:-translate-y-0.5 hover:bg-[var(--editorial-primary-hover)] active:translate-y-0 active:scale-[.98] active:bg-[var(--editorial-primary-pressed)] sm:h-[52px] sm:px-6"
        >
          <PlusCircle className="h-5 w-5" />
          <span className="hidden sm:inline">New Form</span>
          <span className="sm:hidden">New</span>
        </Button>
      </div>

      <FormDialog type="create" open={createDialogOpen} onOpenChange={setCreateDialogOpen} />

      <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="editorial-shadow-sm rounded-[24px] border-[var(--border)] bg-[var(--card)] p-6">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-0 pb-4">
            <CardTitle className="editorial-eyebrow text-[var(--editorial-subtle)]">
              Total Forms
            </CardTitle>
            <FileText className="h-5 w-5 text-[var(--editorial-subtle)]" />
          </CardHeader>
          <CardContent className="p-0">
            <div className="font-display text-[32px] leading-none sm:text-[40px] text-[var(--foreground)]">
              {forms.length}
            </div>
            <p className="mt-3 text-sm text-[var(--editorial-body)]">
              {publishedForms} published, {draftForms} drafts
            </p>
          </CardContent>
        </Card>
        <Card className="editorial-shadow-sm rounded-[24px] border-[var(--border)] bg-[var(--card)] p-6">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-0 pb-4">
            <CardTitle className="editorial-eyebrow text-[var(--editorial-subtle)]">
              Total Responses
            </CardTitle>
            <BarChart3 className="h-5 w-5 text-[var(--editorial-subtle)]" />
          </CardHeader>
          <CardContent className="p-0">
            <div className="font-display text-[32px] leading-none sm:text-[40px] text-[var(--foreground)]">
              {totalResponses}
            </div>
            <p className="mt-3 text-sm text-[var(--editorial-body)]">Across all forms</p>
          </CardContent>
        </Card>
        <Card className="editorial-shadow-sm rounded-[24px] border-[var(--border)] bg-[var(--card)] p-6">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-0 pb-4">
            <CardTitle className="editorial-eyebrow text-[var(--editorial-subtle)]">
              Published
            </CardTitle>
            <Eye className="h-5 w-5 text-[var(--editorial-subtle)]" />
          </CardHeader>
          <CardContent className="p-0">
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
          <Card className="editorial-shadow-sm rounded-[24px] border-[var(--border)] bg-[var(--card)]">
            <CardContent className="py-16 text-center">
              <p className="text-base text-[var(--editorial-subtle)]">No forms yet</p>
              <Button
                className="editorial-transition mt-8 h-[52px] rounded-[16px] bg-[var(--primary)] px-6 text-sm font-medium text-white shadow-[0_8px_24px_rgba(238,125,105,.25)] hover:-translate-y-0.5 hover:bg-[var(--editorial-primary-hover)] active:translate-y-0 active:scale-[.98] active:bg-[var(--editorial-primary-pressed)]"
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