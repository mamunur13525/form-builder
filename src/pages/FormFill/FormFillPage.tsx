import { useParams } from "react-router-dom";
import { FormView } from "../../shared/components/FormView";
import { usePublicForm } from "../../features/forms/hooks/usePublicForm";
import { cn } from "@/shared/utils/cn";

export function FormFillPage() {
  const { slug } = useParams();
  const { data: form, isLoading, isError } = usePublicForm(slug || "");

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <p className="text-base text-muted-foreground">Loading form...</p>
      </div>
    );
  }

  if (isError || !form) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <div className="text-center">
          <h2 className="text-3xl font-bold">Form not found</h2>
          <p className="text-base text-muted-foreground mt-2">
            The form you're looking for doesn't exist.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <div className="w-full flex-1 flex items-stretch justify-center">
        <div className={cn("w-full flex-1 grid place-items-center")}>
          <div
            style={{ width: "100%", height: "100%" }}
            className="w-full flex-1  bg-background transition-all duration-500 ease-in-out overflow-hidden rounded-md border shadow-sm"
          >
            <FormView form={form} mode="published" />
          </div>
        </div>
      </div>
    </div>
  );
}
