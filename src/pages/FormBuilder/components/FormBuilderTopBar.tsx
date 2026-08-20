import { ROUTES } from "@/shared/constants/routes";
import {
  CheckCircle,
  Play,
  Wrench,
  Settings,
  Puzzle,
  Share2,
  BarChart3,
  Loader2,
  AlertCircle,
  Home,
  Pencil,
} from "lucide-react";
import { Button } from "../../../components/ui/button";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import { useFormContext } from "@/features/forms/hooks/useFormContext";
import { FormDialog } from "@/pages/Dashboard/components/FormDialog";

const navLinks = [
  { to: ROUTES.FORM_BUILDER, icon: Wrench, label: "Build" },
  { to: ROUTES.FORM_SETTINGS, icon: Settings, label: "Settings" },
  { to: ROUTES.FORM_INTEGRATIONS, icon: Puzzle, label: "Integrate" },
  { to: ROUTES.FORM_SHARE, icon: Share2, label: "Share" },
  { to: ROUTES.FORM_RESPONSE_SUBMISSIONS, icon: BarChart3, label: "Results" },
];

interface FormBuilderTopBarProps {
  isPublished: boolean;
  onPublish: () => void;
  onPublishedClick: () => void;
  initialTitle?: string;
}

export function FormBuilderTopBar({
  isPublished,
  onPublish,
  onPublishedClick,
  initialTitle = "",
}: FormBuilderTopBarProps) {
  const { formId } = useParams<{ formId: string }>();
  const navigate = useNavigate();
  const { saveStatus, showSaveStatus, openPreview, hasUnpublishedChanges } =
    useFormContext();
  const baseNavLinkClass =
    "editorial-transition flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-[var(--editorial-body)] hover:bg-[var(--secondary)] hover:text-[var(--foreground)]";
  const activeNavLinkClass =
    "border border-[var(--editorial-primary-ring)] bg-[var(--editorial-primary-selected)] text-[var(--primary)] hover:bg-[var(--editorial-primary-selected)] hover:text-[var(--primary)]";
  // Publish CTA accent — green gradient (#4a7f11); overrides the monochrome default button
  const publishButtonClass =
    "border-[#2f4f0a] from-[#4a7f11] to-[#355b0c]";

  const [title, setTitle] = useState(initialTitle);
  const prevInitialTitleRef = useRef(initialTitle);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);

  // Update local state when initial values change from external source
  useEffect(() => {
    if (initialTitle !== prevInitialTitleRef.current) {
      setTitle(initialTitle);
      prevInitialTitleRef.current = initialTitle;
    }
  }, [initialTitle]);


  return (
    <div className="bg-white editorial flex shrink-0 items-center justify-between border-b border-[var(--border)] px-3 py-2 lg:h-[72px] lg:flex-nowrap lg:gap-0 lg:px-8 lg:py-0">
      <div className="flex min-w-0 items-center gap-2">
        <nav className="flex min-w-0 items-center gap-2 text-sm">
          <button
            onClick={() => navigate("/dashboard")}
            className="editorial-transition cursor-pointer items-center gap-1.5 text-[var(--editorial-body)] hover:text-[var(--primary)] flex"
          >
            <Home className="h-4 w-4" />
            Forms
          </button>
          <span className="text-[var(--editorial-disabled)] inline">
            /
          </span>
          <button
            onClick={() => setDialogOpen(true)}
            className="editorial-transition group flex min-w-0 cursor-pointer items-center gap-1.5 font-display text-lg text-[var(--foreground)] hover:text-[var(--primary)] lg:text-xl"
          >
            <span className="truncate">{title}</span>
            <Pencil className="h-4 w-4 shrink-0 opacity-0 transition-opacity duration-250 group-hover:opacity-100" />
          </button>
        </nav>
      </div>

      <nav className="order-last flex w-full items-center gap-1 overflow-x-auto lg:order-none lg:w-auto lg:overflow-visible py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {navLinks.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={label}
            to={to.replace(":formId", formId || "new")}
            className={({ isActive }) =>
              cn(baseNavLinkClass, "shrink-0", isActive && activeNavLinkClass)
            }
            end={to === ROUTES.FORM_BUILDER}
          >
            <Icon className="h-4 w-4" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.08em]">
              {label}
            </span>
          </NavLink>
        ))}
      </nav>

      <div className="flex items-center gap-2 lg:gap-3">
        <span
          className={cn(
            "w-16 items-center gap-1.5 text-xs text-[var(--editorial-subtle)] transition-opacity duration-250 ease-out flex",
            saveStatus !== "idle" ? "opacity-100" : "opacity-0",
          )}
        >
          {saveStatus === "saving" && (
            <Loader2 className="h-4 w-4 animate-spin" />
          )}
          {saveStatus === "saved" && (
            <CheckCircle className="h-4 w-4 text-[var(--editorial-success)]" />
          )}
          {saveStatus === "error" && (
            <AlertCircle className="h-4 w-4 text-[var(--destructive)]" />
          )}
          {saveStatus === "saving"
            ? "Saving..."
            : saveStatus === "saved"
              ? "Saved"
              : "Error"}
        </span>

        <Button
          variant="outline"
          aria-label="Preview"
          onClick={() => openPreview()}
        >
          <Play className="h-5 w-5" />
          <span className="hidden sm:inline">Preview</span>
        </Button>
        {!isPublished ? (
          <Button
            aria-label="Publish"
            className={publishButtonClass}
            onClick={onPublish}
          >
            <Share2 className="h-5 w-5" />
            <span className="hidden sm:inline">Publish</span>
          </Button>
        ) : hasUnpublishedChanges ? (
          <Button
            variant="default"
            aria-label="Publish changes"
            className={publishButtonClass}
            onClick={onPublishedClick}
          >
            <AlertCircle className="h-5 w-5" />
            <span className="hidden sm:inline">Publish changes</span>
          </Button>
        ) : (
          <Button
            variant="default"
            aria-label="Published"
            className={publishButtonClass}
            onClick={onPublishedClick}
          >
            <CheckCircle className="h-5 w-5" />
            <span className="hidden sm:inline">Published</span>
          </Button>
        )}
      </div>

      {/* Title Edit Dialog */}
      <FormDialog
        type="rename"
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initialTitle={title}
        formId={formId || ""}
        onSuccess={(newTitle) => {
          if (newTitle) {
            setTitle(newTitle);
          }
          showSaveStatus("saved");
        }}
      />
    </div>
  );
}
