import { useState } from "react";
import { DeleteFormDialog } from "./components/DeleteFormDialog";
import { FormDialog } from "./components/FormDialog";
import { FormCard, FormCardSkeleton } from "./components/FormCard";
import { DuplicateFormDialog } from "./components/DuplicateFormDialog";
import { PlusCircle, FileText, Eye, BarChart3 } from "lucide-react";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useForms } from "../../features/forms/hooks/useForms";
import { useFormPermissions } from "../../features/forms/hooks/useFormPermissions";
import { PageLayout } from "@/shared/components/PageLayout";

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
  const { canCreate } = useFormPermissions();

  const publishedForms = forms.filter((f) => f.status === "published").length;
  const draftForms = forms.filter((f) => f.status === "draft").length;
  const totalResponses = forms.reduce(
    (acc, form) => acc + (form.responses_count || 0),
    0,
  );

  return (
    <PageLayout
      title="Dashboard"
      description="Manage your forms and view responses"
      actions={
        // A viewer sees the same dashboard, minus the ways to change it.
        canCreate && (
          <Button onClick={() => setCreateDialogOpen(true)}>
            <PlusCircle className="h-5 w-5" />
            <span className="hidden sm:inline">New Form</span>
            <span className="sm:hidden">New</span>
          </Button>
        )
      }
    >
      <FormDialog
        type="create"
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />

      {isLoading ? (
        <>
          <div className="grid gap-3 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
            {[0, 1, 2].map((index) => (
              <Card
                key={index}
                className="editorial-shadow-sm animate-in fade-in duration-300 border-[var(--border)] bg-[var(--card)]"
                style={{
                  animationDelay: `${index * 80}ms`,
                  animationFillMode: "backwards",
                }}
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 sm:p-6">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-5 w-5" />
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  <Skeleton className="h-9 w-16 sm:h-10" />
                  <Skeleton className="mt-3 h-4 w-40" />
                </CardContent>
              </Card>
            ))}
          </div>

          <div>
            <Skeleton className="mb-4 h-8 w-40 sm:mb-6" />
            <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {[0, 1, 2, 3, 4, 5].map((index) => (
                <FormCardSkeleton key={index} index={index} />
              ))}
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
            <Card className="editorial-shadow-sm border-[var(--border)] bg-[var(--card)]">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 sm:p-6">
                <CardTitle className="editorial-eyebrow text-[var(--editorial-subtle)]">
                  Total Forms
                </CardTitle>
                <FileText className="h-4 w-4 text-[var(--editorial-subtle)] sm:h-5 sm:w-5" />
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <div className="font-display text-[28px] leading-none text-[var(--foreground)] sm:text-[40px]">
                  {forms.length}
                </div>
                <p className="mt-2 text-[13px] text-[var(--editorial-body)] sm:mt-3 sm:text-sm">
                  {publishedForms} published, {draftForms} drafts
                </p>
              </CardContent>
            </Card>
            <Card className="editorial-shadow-sm border-[var(--border)] bg-[var(--card)]">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 sm:p-6">
                <CardTitle className="editorial-eyebrow text-[var(--editorial-subtle)]">
                  Total Responses
                </CardTitle>
                <BarChart3 className="h-4 w-4 text-[var(--editorial-subtle)] sm:h-5 sm:w-5" />
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <div className="font-display text-[28px] leading-none text-[var(--foreground)] sm:text-[40px]">
                  {totalResponses}
                </div>
                <p className="mt-2 text-[13px] text-[var(--editorial-body)] sm:mt-3 sm:text-sm">
                  Across all forms
                </p>
              </CardContent>
            </Card>
            <Card className="editorial-shadow-sm border-[var(--border)] bg-[var(--card)]">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 sm:p-6">
                <CardTitle className="editorial-eyebrow text-[var(--editorial-subtle)]">
                  Published
                </CardTitle>
                <Eye className="h-4 w-4 text-[var(--editorial-subtle)] sm:h-5 sm:w-5" />
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <div className="font-display text-[28px] leading-none text-[var(--foreground)] sm:text-[40px]">
                  {publishedForms}
                </div>
                <p className="mt-2 text-[13px] text-[var(--editorial-body)] sm:mt-3 sm:text-sm">
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
                  <Button onClick={() => setCreateDialogOpen(true)}>
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
        </>
      )}

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
    </PageLayout>
  );
}
