import { useState, type ComponentProps } from "react";
import { useNavigate } from "react-router-dom";
import {
    BarChart3,
    Copy,
    EllipsisVertical,
    List,
    Puzzle,
    Settings,
    Share2,
    Shield,
    Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import type { Form } from "@/entities/form/model/types";
import { useFormPermissions } from "@/features/forms/hooks/useFormPermissions";
import { useActiveWorkspace } from "@/features/workspaces/hooks/useWorkspaces";
import { FormAccessDialog } from "./FormAccessDialog";

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
  const [accessDialogOpen, setAccessDialogOpen] = useState(false);
  const { canCreate, canEdit, canDelete, canViewResponses, isReady } = useFormPermissions();
  const { activeWorkspace } = useActiveWorkspace();

  const isAdmin = activeWorkspace?.currentUserRole === "admin";
  const isFormEditable = form.canEdit !== false && (!isReady || canEdit);

  // Until the workspace context is ready, default permissions to true so items are not prematurely hidden.
  const allowCreate = !isReady || canCreate;
  const allowDelete = !isReady || canDelete;
  const allowViewResponses = !isReady || canViewResponses;

  // Built as one list and then filtered, so the separator can be dropped along
  // with the group it introduces rather than left dangling at the bottom.
  const menuItems: MenuItemData[] = [
    {
      label: "View Responses",
      icon: List,
      enabled: allowViewResponses,
      onClick: () =>
        navigate(`/form-response/${form.id}/submissions`),
    },
    {
      label: "Analytics",
      icon: BarChart3,
      enabled: allowViewResponses,
      onClick: () => navigate(`/form-response/${form.id}/analytics`),
    },
    {
      label: "Settings",
      icon: Settings,
      enabled: isFormEditable,
      onClick: () => navigate(`/form-settings/${form.id}`),
    },
    {
      label: "Share Form",
      icon: Share2,
      enabled: isFormEditable,
      onClick: () => navigate(`/form-share/${form.id}`),
    },
    {
      label: "Integrations",
      icon: Puzzle,
      enabled: isFormEditable,
      onClick: () => navigate(`/form-integrate/${form.id}`),
    },
    {
      label: "Manage Access",
      icon: Shield,
      enabled: isAdmin,
      onClick: () => setAccessDialogOpen(true),
    },
    ...(allowCreate || allowDelete ? [{ isSeparator: true } as MenuItemData] : []),
    {
      label: "Duplicate",
      icon: Copy,
      enabled: allowCreate,
      onClick: () => onDuplicateClick(form.id),
    },
    {
      label: "Delete",
      icon: Trash2,
      variant: "destructive" as const,
      enabled: allowDelete,
      onClick: () => onDeleteClick(form.id),
    },
  ].filter((item) => "isSeparator" in item || item.enabled !== false);

  return (
    <>
      <Card
        className="editorial editorial-transition cursor-pointer border-[var(--border)] bg-[var(--card)] p-6 hover:-translate-y-0.5 hover:border-[#FF5722]/50 hover:shadow-[0_12px_32px_rgba(255,87,34,0.08)] transition-all flex flex-col justify-between rounded-lg"
        onClick={() => navigate(`/form-builder/${form.id}`)}
      >
        <CardHeader className="p-0">
          <div className="flex items-start justify-between gap-4">
            <CardTitle className="font-display text-2xl leading-tight text-[var(--foreground)]">
              {form.title}
            </CardTitle>
            <div className="flex items-center gap-2 shrink-0">
              {form.canEdit === false && (
                <Badge
                  variant="outline"
                  className="whitespace-nowrap rounded-lg border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-medium text-amber-500"
                >
                  View Only
                </Badge>
              )}
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
                >
                  <EllipsisVertical className="h-5 w-5" />
                </Button>
              }
              onClick={(e) => e.stopPropagation()}
            />
            <DropdownMenuContent
              align="end"
              className="editorial rounded-lg border-[var(--border)] bg-[var(--popover)] p-2"
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
                    className="rounded-lg px-3 py-2 cursor-pointer"
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

      {accessDialogOpen && (
        <FormAccessDialog
          formId={form.id}
          formTitle={form.title}
          open={accessDialogOpen}
          onOpenChange={setAccessDialogOpen}
        />
      )}
    </>
  );
}

/** Same footprint as a FormCard, used while a form list is loading. */
export function FormCardSkeleton({ index = 0 }: { index?: number }) {
  return (
    <Card
      className="editorial animate-in fade-in duration-300 border-[var(--border)] bg-[var(--card)] p-6 rounded-lg"
      style={{
        animationDelay: `${index * 80}ms`,
        animationFillMode: "backwards",
      }}
    >
      <div className="flex items-start justify-between gap-4">
        <Skeleton className="h-7 w-2/3" />
        <Skeleton className="h-6 w-16 rounded-lg" />
      </div>
      <div className="flex items-end justify-between pt-6">
        <div className="flex gap-3">
          <Skeleton className="h-4 w-14" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Skeleton className="h-8 w-8 rounded-lg" />
      </div>
    </Card>
  );
}
