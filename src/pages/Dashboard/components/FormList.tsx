import { useNavigate } from "react-router-dom";
import { Link2, MoreHorizontal, Share2, SquarePen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Form } from "@/entities/form/model/types";
import { showError, showSuccess } from "@/shared/hooks/useToast";
import { formatDate } from "@/shared/utils/formatDate";
import { cn } from "@/lib/utils";
import { FormActionsMenu } from "./FormCard";

interface FormListProps {
  forms: Form[];
  onDeleteClick: (formId: string) => void;
  onDuplicateClick: (formId: string) => void;
}

const STATUS_BADGE: Record<Form["status"], string> = {
  draft: "border-[var(--border)] bg-[var(--muted)] text-[var(--editorial-body)]",
  published:
    "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  archived:
    "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400",
};

// Each cell draws its own slice of the row so the rows can be separated,
// rounded cards instead of one continuous table block.
const CELL =
  "border-y border-[var(--border)] bg-[var(--card)] py-3 transition-colors group-hover:border-[#FF5722]/40 group-hover:bg-[var(--editorial-primary-light)]";

const numberOrDash = (value: number | undefined) => (value ? value : "—");

export function FormList({ forms, onDeleteClick, onDuplicateClick }: FormListProps) {
  return (
    <Table className="border-separate border-spacing-y-2">
      <TableHeader className="[&_tr]:border-0">
        <TableRow className="border-0 hover:bg-transparent">
          <TableHead className="h-9 pl-3 text-[11px] font-medium uppercase tracking-[0.12em] text-[var(--editorial-subtle)]">
            <span className="sr-only">Form</span>
          </TableHead>
          <TableHead className="hidden h-9 w-20 text-right text-[11px] font-medium uppercase tracking-[0.12em] text-[var(--editorial-subtle)] lg:table-cell">
            Views
          </TableHead>
          <TableHead className="hidden h-9 w-24 text-right text-[11px] font-medium uppercase tracking-[0.12em] text-[var(--editorial-subtle)] sm:table-cell">
            Responses
          </TableHead>
          <TableHead className="hidden h-9 w-20 text-right text-[11px] font-medium uppercase tracking-[0.12em] text-[var(--editorial-subtle)] lg:table-cell">
            Partial
          </TableHead>
          <TableHead className="hidden h-9 w-24 text-right text-[11px] font-medium uppercase tracking-[0.12em] text-[var(--editorial-subtle)] sm:table-cell">
            Completion
          </TableHead>
          <TableHead className="hidden h-9 w-32 text-[11px] font-medium uppercase tracking-[0.12em] text-[var(--editorial-subtle)] xl:table-cell">
            Updated
          </TableHead>
          <TableHead className="h-9 w-[148px] pr-3">
            <span className="sr-only">Actions</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {forms.map((form) => (
          <FormListRow
            key={form.id}
            form={form}
            onDeleteClick={onDeleteClick}
            onDuplicateClick={onDuplicateClick}
          />
        ))}
      </TableBody>
    </Table>
  );
}

function FormListRow({ form, onDeleteClick, onDuplicateClick }: Omit<FormListProps, "forms"> & { form: Form }) {
  const navigate = useNavigate();
  const completed = form.responses_count || 0;
  const partial = form.partial_count || 0;
  const total = completed + partial;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/form/${form.slug || form.id}`,
      );
      showSuccess("Link copied", "The form link is on your clipboard.");
    } catch {
      showError("Couldn't copy link");
    }
  };

  return (
    <TableRow
      className="group cursor-pointer border-0 hover:bg-transparent"
      tabIndex={0}
      onClick={() => navigate(`/form-builder/${form.id}`)}
      onKeyDown={(event) => {
        if (event.target !== event.currentTarget) return;
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          navigate(`/form-builder/${form.id}`);
        }
      }}
    >
      <TableCell className={cn(CELL, "rounded-l-lg border-l py-2 pl-3")}>
        <div className="flex min-w-[220px] items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--secondary)] font-display text-base text-[var(--foreground)]">
            {form.title.trim().charAt(0).toUpperCase() || "?"}
          </div>
          <div className="flex min-w-0 items-center gap-2">
            <span className="truncate font-medium text-[var(--foreground)]">
              {form.title}
            </span>
            {form.canEdit === false && (
              <Badge
                variant="outline"
                className="shrink-0 rounded-md border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-500"
              >
                View Only
              </Badge>
            )}
            <Badge
              className={cn(
                "shrink-0 rounded-md px-2 py-0.5 text-[11px] font-medium capitalize",
                STATUS_BADGE[form.status],
              )}
            >
              {form.status}
            </Badge>
          </div>
        </div>
      </TableCell>
      <TableCell className={cn(CELL, "hidden text-right tabular-nums text-[var(--editorial-body)] lg:table-cell")}>
        {numberOrDash(form.views_count)}
      </TableCell>
      <TableCell className={cn(CELL, "hidden text-right tabular-nums text-[var(--editorial-body)] sm:table-cell")}>
        {numberOrDash(form.responses_count)}
      </TableCell>
      <TableCell className={cn(CELL, "hidden text-right tabular-nums text-[var(--editorial-body)] lg:table-cell")}>
        {numberOrDash(form.partial_count)}
      </TableCell>
      <TableCell className={cn(CELL, "hidden text-right tabular-nums text-[var(--editorial-body)] sm:table-cell")}>
        {total > 0 ? `${Math.round((completed / total) * 100)}%` : "—"}
      </TableCell>
      <TableCell className={cn(CELL, "hidden whitespace-nowrap text-[var(--editorial-body)] xl:table-cell")}>
        {formatDate(form.updatedAt)}
      </TableCell>
      <TableCell className={cn(CELL, "rounded-r-lg border-r py-2 pr-2")}>
        <div
          className="flex items-center justify-end gap-0.5"
          onClick={(event) => event.stopPropagation()}
        >
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Open ${form.title}`}
            className="h-8 w-8 text-[var(--editorial-subtle)] hover:text-[var(--foreground)]"
            onClick={() => navigate(`/form-builder/${form.id}`)}
          >
            <SquarePen className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Copy link to ${form.title}`}
            className="h-8 w-8 text-[var(--editorial-subtle)] hover:text-[var(--foreground)]"
            onClick={() => void copyLink()}
          >
            <Link2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Share ${form.title}`}
            className="h-8 w-8 text-[var(--editorial-subtle)] hover:text-[var(--foreground)]"
            onClick={() => navigate(`/form-share/${form.id}`)}
          >
            <Share2 className="h-4 w-4" />
          </Button>
          <FormActionsMenu
            form={form}
            onDeleteClick={onDeleteClick}
            onDuplicateClick={onDuplicateClick}
            trigger={
              <Button
                variant="ghost"
                size="icon"
                aria-label={`More actions for ${form.title}`}
                className="h-8 w-8 text-[var(--editorial-subtle)] hover:text-[var(--foreground)]"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            }
          />
        </div>
      </TableCell>
    </TableRow>
  );
}

export function FormListSkeleton() {
  return (
    <div className="space-y-2" aria-hidden="true">
      <div className="flex items-center gap-4 px-3 pb-1">
        <Skeleton className="h-3 w-16" />
        <div className="ml-auto flex items-center gap-6">
          <Skeleton className="h-3 w-10" />
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
      {[0, 1, 2, 3, 4].map((index) => (
        <div
          key={index}
          className="flex items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-3"
        >
          <Skeleton className="h-10 w-10 shrink-0 rounded-lg" />
          <Skeleton className="h-4 w-48" />
          <div className="ml-auto flex items-center gap-8">
            <Skeleton className="h-4 w-6" />
            <Skeleton className="h-4 w-6" />
            <Skeleton className="h-4 w-6" />
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-8 w-8 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}
