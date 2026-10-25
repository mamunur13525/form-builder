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
  Pencil,
  CheckCheck,
  ChevronDown,
  ChevronRight,
  Send,
  Sun,
  Moon,
} from "lucide-react";
import { useTheme } from "@/app/providers/ThemeProvider";
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
  const { theme, setTheme } = useTheme();
  const { saveStatus, showSaveStatus, openPreview, hasUnpublishedChanges } =
    useFormContext();
  const activeTab =
    navLinks.find(({ to }) => pathname.startsWith(tabPrefix(to))) ?? navLinks[0];
  const ActiveTabIcon = activeTab.icon;
  const baseNavLinkClass =
    "transition-all flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-sm font-medium text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-zinc-800/50 border border-transparent";
  const activeNavLinkClass =
    "border-[#FF5722] text-[#FF5722] bg-transparent font-semibold shadow-xs hover:text-[#FF5722] hover:bg-transparent";
  const navLabelClass = "text-sm font-medium";

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
    <div className="bg-white dark:bg-[#141418] flex h-14 shrink-0 items-center justify-between gap-3 border-b border-slate-200 dark:border-zinc-800 px-4 lg:h-[64px] lg:gap-4 lg:px-6 select-none">
      <div className="flex min-w-0 items-center gap-3">
        {/* App Logo */}
        <div
          onClick={() => navigate("/dashboard")}
          className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-xl hover:opacity-90 transition-opacity p-1 active:scale-95"
          title="Dashboard"
        >
          <img src="/flogo.png" alt="FormFlow logo" className="h-full w-full object-contain" />
        </div>

        <nav className="flex min-w-0 items-center gap-2 text-sm">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex shrink-0 cursor-pointer items-center text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-100 font-medium transition-colors"
          >
            Forms
          </button>
          <ChevronRight className="h-4 w-4 shrink-0 text-slate-400 dark:text-zinc-600" />
          <button
            onClick={() => setDialogOpen(true)}
            className="group flex min-w-0 cursor-pointer items-center gap-1.5 font-semibold text-slate-900 dark:text-white hover:text-[#FF5722] dark:hover:text-[#FF5722] text-sm sm:text-base transition-colors"
          >
            <span className="truncate">{title || "Untitled form"}</span>
            <Pencil className="hidden h-3.5 w-3.5 shrink-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100 lg:block text-slate-400 dark:text-zinc-500" />
          </button>
        </nav>
      </div>

      {/* Section nav */}
      <nav className="hidden shrink-0 items-center gap-1 md:flex rounded-2xl bg-slate-100 dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800/80 p-1">
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
                "shrink-0 cursor-pointer px-3 md:hidden",
              )}
            >
              <ActiveTabIcon className="h-4 w-4 shrink-0" />
              <span className={navLabelClass}>{activeTab.label}</span>
              <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-70" />
            </button>
          }
        />
        <DropdownMenuContent
          align="center"
          className="w-52 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#18181c] p-2 shadow-xl text-slate-900 dark:text-zinc-100"
        >
          {navLinks.map(({ to, icon: Icon, label }) => (
            <DropdownMenuItem
              key={label}
              className={cn(
                "cursor-pointer rounded-xl px-3 py-2 text-sm font-medium",
                activeTab.label === label
                  ? "border border-[#FF5722] text-[#FF5722] font-semibold bg-transparent"
                  : "text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-white",
              )}
              onClick={() => navigate(to.replace(":formId", formId || "new"))}
            >
              <Icon className="h-4 w-4 mr-2" />
              {label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="flex shrink-0 items-center gap-2 lg:gap-3">
        <span
          className={cn(
            "flex shrink-0 items-center gap-1.5 overflow-hidden text-xs text-slate-500 dark:text-zinc-400 transition-opacity duration-200 ease-out",
            saveStatus !== "idle" ? "opacity-100" : "opacity-0",
          )}
        >
          {saveStatus === "saving" && (
            <Loader2 className="h-4 w-4 shrink-0 animate-spin text-[#FF5722]" />
          )}
          {saveStatus === "saved" && (
            <CheckCheck className="h-4 w-4 shrink-0 text-emerald-500 dark:text-emerald-400" />
          )}
          {saveStatus === "error" && (
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-500 dark:text-rose-400" />
          )}
          <span className="hidden lg:inline font-medium">
            {saveStatus === "saving"
              ? "Saving..."
              : saveStatus === "saved"
                ? "Saved"
                : "Error"}
          </span>
        </span>

        <button
          type="button"
          aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#18181c] text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
        >
          {theme === "dark" ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-600" />}
        </button>

        <button
          type="button"
          aria-label="Preview"
          onClick={() => openPreview()}
          className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#18181c] px-3.5 py-2 text-sm font-medium text-slate-800 dark:text-zinc-100 shadow-xs hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
        >
          <Play className="h-4 w-4 text-slate-500 dark:text-zinc-400" />
          <span className="hidden sm:inline">Preview</span>
        </button>

        {!isPublished ? (
          <button
            type="button"
            aria-label="Publish"
            className="flex items-center gap-2 rounded-xl bg-[#FF5722] hover:bg-[#F4511E] px-4 py-2 text-sm font-medium text-white shadow-md hover:shadow-lg transition-all cursor-pointer"
            onClick={onPublish}
          >
            <Send className="h-4 w-4" />
            <span className="hidden sm:inline">Publish</span>
          </button>
        ) : hasUnpublishedChanges ? (
          <button
            type="button"
            aria-label="Publish changes"
            className="flex items-center gap-2 rounded-xl bg-[#FF5722] hover:bg-[#F4511E] px-4 py-2 text-sm font-medium text-white shadow-md hover:shadow-lg transition-all cursor-pointer"
            onClick={onPublishedClick}
          >
            <AlertCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Publish changes</span>
          </button>
        ) : (
          <button
            type="button"
            aria-label="Published"
            className="flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-4 py-2 text-sm font-medium text-white shadow-xs transition-colors cursor-pointer"
            onClick={onPublishedClick}
          >
            <CheckCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Published</span>
          </button>
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
