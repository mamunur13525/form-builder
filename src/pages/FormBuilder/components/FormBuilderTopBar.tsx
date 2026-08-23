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
  CheckCheck,
  ChevronDown,
} from "lucide-react";
import { Button } from "../../../components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NavLink, useLocation, useNavigate, useParams } from "react-router-dom";
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

/**
 * The static head of a tab's route, e.g. "/form-response". Every section lives
 * under its own top-level prefix, so this is enough to resolve the active tab —
 * and unlike `NavLink`'s own matching it keeps Results active on the summary and
 * analytics sub-routes too.
 */
const tabPrefix = (to: string) => to.split("/:formId")[0];

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
  const { pathname } = useLocation();
  const { saveStatus, showSaveStatus, openPreview, hasUnpublishedChanges } =
    useFormContext();
  const activeTab =
    navLinks.find(({ to }) => pathname.startsWith(tabPrefix(to))) ?? navLinks[0];
  const ActiveTabIcon = activeTab.icon;
  const baseNavLinkClass =
    "editorial-transition flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-[var(--editorial-body)] hover:bg-[var(--secondary)] hover:text-[var(--foreground)]";
  const activeNavLinkClass =
    "border border-[var(--editorial-primary-ring)] bg-[var(--editorial-primary-selected)] text-[var(--primary)] hover:bg-[var(--editorial-primary-selected)] hover:text-[var(--primary)]";
  const navLabelClass = "text-[10px] font-semibold uppercase tracking-[0.08em]";
  // Publish CTA accent — green gradient (#4a7f11); overrides the monochrome default button
  const publishButtonClass =
    "border-0 from-[#4a7f11] to-[#355b0c]";

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
    <div className="bg-white editorial flex h-14 shrink-0 items-center justify-between gap-2 border-b border-[var(--border)] px-3 lg:h-[72px] lg:gap-4 lg:px-8">
      <div className="flex min-w-0 items-center gap-2">
        <nav className="flex min-w-0 items-center gap-2 text-sm">
          <button
            onClick={() => navigate("/dashboard")}
            className="editorial-transition flex shrink-0 cursor-pointer items-center gap-1.5 text-[var(--editorial-body)] hover:text-[var(--primary)]"
          >
            <Home className="h-4 w-4" />
            <span className="hidden sm:inline">Forms</span>
          </button>
          <span className="hidden shrink-0 text-[var(--editorial-disabled)] sm:inline">
            /
          </span>
          <button
            onClick={() => setDialogOpen(true)}
            className="editorial-transition group flex min-w-0 cursor-pointer items-center gap-1.5 font-display text-base text-[var(--foreground)] hover:text-[var(--primary)] sm:text-lg lg:text-xl"
          >
            <span className="truncate">{title}</span>
            {/* Hover affordance only — hidden on touch widths, where it would
                just eat room the title needs. */}
            <Pencil className="hidden h-4 w-4 shrink-0 opacity-0 transition-opacity duration-250 group-hover:opacity-100 lg:block" />
          </button>
        </nav>
      </div>

      {/* Section nav. Five tabs need ~500px, so below `lg` they collapse into a
          menu that shows the active section and opens the full list. */}
      <nav className="hidden shrink-0 items-center gap-1 md:flex">
        {navLinks.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={label}
            to={to.replace(":formId", formId || "new")}
            className={cn(
              baseNavLinkClass,
              "shrink-0",
              activeTab.label === label && activeNavLinkClass,
            )}
          >
            <Icon className="h-4 w-4" />
            <span className={navLabelClass}>{label}</span>
          </NavLink>
        ))}
      </nav>

      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <button
              type="button"
              aria-label={`Section: ${activeTab.label}`}
              className={cn(
                baseNavLinkClass,
                activeNavLinkClass,
                "shrink-0 cursor-pointer px-2.5 md:hidden",
              )}
            >
              <ActiveTabIcon className="h-4 w-4 shrink-0" />
              <span className={navLabelClass}>{activeTab.label}</span>
              <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-60" />
            </button>
          }
        />
        <DropdownMenuContent
          align="center"
          className="editorial w-52 rounded-[18px] border border-[var(--border)] bg-[var(--popover)] p-2"
        >
          {navLinks.map(({ to, icon: Icon, label }) => (
            <DropdownMenuItem
              key={label}
              className={cn(
                "cursor-pointer rounded-[12px] px-3 py-2",
                activeTab.label === label &&
                  "bg-[var(--editorial-primary-selected)] text-[var(--primary)]",
              )}
              onClick={() => navigate(to.replace(":formId", formId || "new"))}
            >
              <Icon className="h-4 w-4" />
              {label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="flex shrink-0 items-center gap-2 lg:gap-3">
        <span
          className={cn(
            "flex w-4 shrink-0 items-center gap-1.5 overflow-hidden text-xs text-[var(--editorial-subtle)] transition-opacity duration-250 ease-out lg:w-16",
            saveStatus !== "idle" ? "opacity-100" : "opacity-0",
          )}
        >
          {saveStatus === "saving" && (
            <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
          )}
          {saveStatus === "saved" && (
            <CheckCheck className="h-4 w-4 shrink-0 text-[var(--editorial-success)]" />
          )}
          {saveStatus === "error" && (
            <AlertCircle className="h-4 w-4 shrink-0 text-[var(--destructive)]" />
          )}
          <span className="hidden lg:inline">
            {saveStatus === "saving"
              ? "Saving..."
              : saveStatus === "saved"
                ? "Saved"
                : "Error"}
          </span>
        </span>

        <Button
          variant="outline"
          aria-label="Preview"
          onClick={() => openPreview()}
        >
          <Play className="h-5 w-5" />
          <span className="hidden xl:inline">Preview</span>
        </Button>
        {!isPublished ? (
          <Button
            aria-label="Publish"
            className={publishButtonClass}
            onClick={onPublish}
          >
            <Share2 className="h-5 w-5" />
            <span className="hidden xl:inline">Publish</span>
          </Button>
        ) : hasUnpublishedChanges ? (
          <Button
            variant="default"
            aria-label="Publish changes"
            className={publishButtonClass}
            onClick={onPublishedClick}
          >
            <AlertCircle className="h-5 w-5" />
            <span className="hidden xl:inline">Publish changes</span>
          </Button>
        ) : (
          <Button
            variant="default"
            aria-label="Published"
            className={publishButtonClass}
            onClick={onPublishedClick}
          >
            <CheckCircle className="h-5 w-5" />
            <span className="hidden xl:inline">Published</span>
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
