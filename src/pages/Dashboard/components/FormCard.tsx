import { useNavigate } from "react-router-dom";
import { FileText, Eye, BarChart3, EllipsisVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import type { Form } from "@/entities/form/model/types";

interface FormCardProps {
  form: Form;
  onDeleteClick: (formId: string) => void;
}

export function FormCard({ form, onDeleteClick }: FormCardProps) {
  const navigate = useNavigate();

  return (
    <Card
      className="editorial editorial-transition editorial-shadow-sm cursor-pointer rounded-[24px] border-[var(--border)] bg-[var(--card)] p-6 hover:-translate-y-0.5 hover:shadow-[0_20px_60px_rgba(110,80,60,.08)]"
      onClick={() => navigate(`/form-builder/${form.id}`)}
    >
      <CardHeader className="p-0">
        <div className="flex items-start justify-between gap-4">
          <CardTitle className="font-display text-2xl leading-tight text-[var(--foreground)]">
            {form.title}
          </CardTitle>
          <Badge
            className={
              form.status === "published"
                ? "whitespace-nowrap rounded-lg border border-[var(--editorial-success)]/30 bg-[var(--editorial-success)]/12 px-3 py-1 text-[12px] font-semibold uppercase tracking-[0.08em] text-[#4E7F62]"
                : "whitespace-nowrap rounded-lg border border-[var(--border)] bg-[var(--secondary)] px-3 py-1 text-[12px] font-semibold uppercase tracking-[0.08em] text-[var(--editorial-subtle)]"
            }
          >
            {form.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex items-center justify-between p-0 pt-6">
        <div className="flex gap-2 text-sm text-[var(--editorial-body)]">
          <span>{form.fields?.length || 0} pages</span>
          <span className="text-[var(--editorial-disabled)]">•</span>
          <span>{form.responses_count || 0} responses</span>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                aria-label="Form actions"
                className="editorial-transition h-9 w-9 rounded-xl border border-[var(--editorial-border-light)] bg-[var(--secondary)] text-[var(--editorial-body)] hover:border-[var(--editorial-primary-ring)] hover:bg-[var(--editorial-primary-light)] hover:text-[var(--primary)] active:scale-[.98]"
              />
            }
            onClick={(e) => e.stopPropagation()}
          >
            <EllipsisVertical className="h-5 w-5" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="editorial rounded-[18px] border-[var(--border)] bg-[var(--popover)] p-2"
          >
            <DropdownMenuItem
              className="rounded-[12px] px-3 py-2"
              onClick={() => navigate(`/form-response/${form.id}/submissions`)}
            >
              <BarChart3 className="h-4 w-4" />
              <span>View Responses</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="rounded-[12px] px-3 py-2"
              onClick={() => navigate(`/form-response/${form.id}/analytics`)}
            >
              <BarChart3 className="h-4 w-4" />
              <span>Form Analytics</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="rounded-[12px] px-3 py-2"
              onClick={() => navigate(`/form-settings/${form.id}`)}
            >
              <FileText className="h-4 w-4" />
              <span>Form Settings</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="rounded-[12px] px-3 py-2"
              onClick={() => navigate(`/form-share/${form.id}`)}
            >
              <Eye className="h-4 w-4" />
              <span>Form Share</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="rounded-[12px] px-3 py-2"
              onClick={() => navigate(`/form-integrate/${form.id}`)}
            >
              <FileText className="h-4 w-4" />
              <span>Form Integrations</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-[var(--editorial-border-light)]" />
            <DropdownMenuItem className="rounded-[12px] px-3 py-2">
              <FileText className="h-4 w-4" />
              <span>Duplicate Form</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="rounded-[12px] px-3 py-2">
              <BarChart3 className="h-4 w-4" />
              <span>Resubmissions</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="rounded-[12px] px-3 py-2">
              <Eye className="h-4 w-4" />
              <span>Theme</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="rounded-[12px] px-3 py-2">
              <Eye className="h-4 w-4" />
              <span>Translations</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="rounded-[12px] px-3 py-2">
              <FileText className="h-4 w-4" />
              <span>Export Responses</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-[var(--editorial-border-light)]" />
            <DropdownMenuItem
              variant="destructive"
              className="rounded-[12px] px-3 py-2"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteClick(form.id);
              }}
            >
              <FileText className="h-4 w-4" />
              <span>Delete Form</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardContent>
    </Card>
  );
}
