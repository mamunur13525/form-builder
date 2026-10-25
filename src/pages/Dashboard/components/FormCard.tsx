import { useNavigate } from "react-router-dom";
import {
    BarChart3,
    Copy,
    EllipsisVertical,
    List,
    Puzzle,
    Settings,
    Share2,
    Trash2,
} from "lucide-react";
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
import { useFormPermissions } from "@/features/forms/hooks/useFormPermissions";
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
    /** Omitted from the menu when false. */
    enabled?: boolean;
  }
  | { isSeparator: true };

export function FormCard({ form, onDeleteClick, onDuplicateClick }: FormCardProps) {
  const navigate = useNavigate();
  const { canCreate, canEdit, canDelete, canViewResponses } = useFormPermissions();

  // Built as one list and then filtered, so the separator can be dropped along
  // with the group it introduces rather than left dangling at the bottom.
  const menuItems: MenuItemData[] = [
    {
      label: "View Responses",
      icon: List,
      enabled: canViewResponses,
      onClick: () =>
        navigate(`/form-response/${form.id}/submissions`),
    },
    {
      label: "Analytics",
      icon: BarChart3,
      enabled: canViewResponses,
      onClick: () => navigate(`/form-response/${form.id}/analytics`),
    },
    {
      label: "Settings",
      icon: Settings,
      enabled: canEdit,
      onClick: () => navigate(`/form-settings/${form.id}`),
    },
    {
      label: "Share Form",
      icon: Share2,
      enabled: canEdit,
      onClick: () => navigate(`/form-share/${form.id}`),
    },
    {
      label: "Integrations",
      icon: Puzzle,
      enabled: canEdit,
      onClick: () => navigate(`/form-integrate/${form.id}`),
    },
    ...(canCreate || canDelete ? [{ isSeparator: true } as MenuItemData] : []),
    {
      label: "Duplicate",
      icon: Copy,
      enabled: canCreate,
      onClick: () => onDuplicateClick(form.id),
    },
    {
      label: "Delete",
      icon: Trash2,
      variant: "destructive" as const,
      enabled: canDelete,
      onClick: () => onDeleteClick(form.id),
    },
  ].filter((item) => "isSeparator" in item || item.enabled !== false);

  return (
    <Card
      className="editorial editorial-transition cursor-pointer border-[var(--border)] bg-[var(--card)] p-6 hover:-translate-y-0.5 hover:border-[#FF5722]/50 hover:shadow-[0_12px_32px_rgba(255,87,34,0.08)] transition-all flex flex-col justify-between rounded-2xl"
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
                ? "whitespace-nowrap rounded-lg border border-emerald-500/30 bg-emerald-500/15 px-3 py-1 text-[12px] font-semibold uppercase tracking-[0.08em] text-emerald-400"
                : "whitespace-nowrap rounded-lg border border-zinc-800 bg-zinc-900/80 px-3 py-1 text-[12px] font-semibold uppercase tracking-[0.08em] text-zinc-400"
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
