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
import type { ComponentProps } from "react";

interface FormCardProps {
  form: Form;
  onDeleteClick: (formId: string) => void;
  onDuplicateClick: (formId: string) => void;
}

type MenuItemData =
  | {
    label: string;
    icon: React.ForwardRefExoticComponent<
      React.PropsWithRef<React.SVGProps<SVGSVGElement>>
    >;
    onClick: () => void;
    variant?: ComponentProps<typeof DropdownMenuItem>["variant"];
  }
  | { isSeparator: true };

export function FormCard({ form, onDeleteClick, onDuplicateClick }: FormCardProps) {
  const navigate = useNavigate();

  const menuItems: MenuItemData[] = [
    {
      label: "View Responses",
      icon: BarChart3,
      onClick: () =>
        navigate(`/form-response/6a74af911e8b59bb1c8c4152/submissions`),
    },
    {
      label: "Form Analytics",
      icon: BarChart3,
      onClick: () => navigate(`/form-response/${form.id}/analytics`),
    },
    {
      label: "Form Settings",
      icon: FileText,
      onClick: () => navigate(`/form-settings/${form.id}`),
    },
    {
      label: "Form Share",
      icon: Eye,
      onClick: () => navigate(`/form-share/${form.id}`),
    },
    {
      label: "Form Integrations",
      icon: FileText,
      onClick: () => navigate(`/form-integrate/${form.id}`),
    },
    { isSeparator: true },
    {
      label: "Duplicate Form",
      icon: FileText,
      onClick: () => onDuplicateClick(form.id),
    },
    {
      label: "Delete Form",
      icon: FileText,
      variant: "destructive" as const,
      onClick: () => onDeleteClick(form.id),
    },
  ];

  return (
    <Card
      className="editorial editorial-transition editorial-shadow-sm cursor-pointer border-[var(--border)] bg-[var(--card)] p-6 hover:-translate-y-0.5 hover:shadow-[0_20px_60px_rgba(110,80,60,.08)] flex flex-col justify-between"
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
      <CardContent className="flex items-end justify-between p-0 pt-6">
        <div className="flex gap-2 text-sm text-[var(--editorial-body)]">
          <span>{form.pages?.length || 0} pages</span>
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
              />
            }
            onClick={(e) => e.stopPropagation()}
          >
            <EllipsisVertical className="h-5 w-5" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="editorial rounded-[18px] border-[var(--border)] bg-[var(--popover)] p-2"
            onClick={(e) => e.stopPropagation()}
          >
            {menuItems.map((item, index) => {
              if ("isSeparator" in item) {
                return (
                  <DropdownMenuSeparator
                    key={index}
                    className="bg-[var(--editorial-border-light)]"
                  />
                );
              }

              const Icon = item.icon;

              return (
                <DropdownMenuItem
                  key={index}
                  className="rounded-[12px] px-3 py-2"
                  variant={item.variant}
                  onClick={item.onClick}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </CardContent>
    </Card>
  );
}
