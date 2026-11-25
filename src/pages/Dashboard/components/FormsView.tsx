import type { ReactNode } from "react";
import { LayoutGrid, List } from "lucide-react";
import type { Form } from "@/entities/form/model/types";
import { cn } from "@/lib/utils";
import { FormCard, FormCardSkeleton } from "./FormCard";
import { FormList, FormListSkeleton } from "./FormList";

export type FormsViewMode = "card" | "list";

interface FormsViewProps {
  forms: Form[];
  view: FormsViewMode;
  isLoading?: boolean;
  /** Page-specific empty state, shown once loading finishes. */
  emptyState?: ReactNode;
  onDeleteClick: (formId: string) => void;
  onDuplicateClick: (formId: string) => void;
}

/**
 * The one forms collection shared by the dashboard and the forms page.
 * It owns neither the data nor the view preference, so both pages can place
 * the same toggle where it fits their layout.
 */
export function FormsView({
  forms,
  view,
  isLoading,
  emptyState,
  onDeleteClick,
  onDuplicateClick,
}: FormsViewProps) {
  if (isLoading) {
    return view === "list" ? (
      <FormListSkeleton />
    ) : (
      <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map((index) => (
          <FormCardSkeleton key={index} index={index} />
        ))}
      </div>
    );
  }

  if (forms.length === 0) {
    return <>{emptyState}</>;
  }

  return view === "list" ? (
    <FormList
      forms={forms}
      onDeleteClick={onDeleteClick}
      onDuplicateClick={onDuplicateClick}
    />
  ) : (
    <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {forms.map((form) => (
        <FormCard
          key={form.id}
          form={form}
          onDeleteClick={onDeleteClick}
          onDuplicateClick={onDuplicateClick}
        />
      ))}
    </div>
  );
}

interface FormViewToggleProps {
  value: FormsViewMode;
  onChange: (value: FormsViewMode) => void;
}

export function FormViewToggle({ value, onChange }: FormViewToggleProps) {
  const button =
    "flex h-8 w-8 items-center justify-center rounded-lg transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5722]/50";
  const selected = "bg-[#FF5722] text-white shadow-xs";
  const unselected =
    "text-slate-500 hover:bg-slate-200/60 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-zinc-800 dark:hover:text-white";

  return (
    <div
      className="flex shrink-0 items-center gap-1 rounded-xl border border-slate-200/80 bg-white p-1 dark:border-zinc-800 dark:bg-zinc-900/80 "
      role="group"
      aria-label="Form view"
    >
      <button
        type="button"
        className={cn(button, value === "card" ? selected : unselected)}
        aria-label="Card view"
        aria-pressed={value === "card"}
        onClick={() => onChange("card")}
      >
        <LayoutGrid className="size-4" />
      </button>
      <button
        type="button"
        className={cn(button, value === "list" ? selected : unselected)}
        aria-label="List view"
        aria-pressed={value === "list"}
        onClick={() => onChange("list")}
      >
        <List className="size-4" />
      </button>
    </div>
  );
}
