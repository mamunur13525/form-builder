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
  const { saveStatus, showSaveStatus, openPreview } = useFormContext();
  const baseNavLinkClass =
    "flex flex-col items-center gap-0.5 text-muted-foreground hover:text-primary transition-colors px-2.5 py-1.5 rounded-md";
  const activeNavLinkClass = "text-primary bg-primary/10";

  const [title, setTitle] = useState(initialTitle);
  const [saveError, setSaveError] = useState<string | null>(null);
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
    <div className="flex items-center justify-between px-4 py-2 shrink-0 bg-background border-b">
      <div className="flex items-center gap-2">
        <nav className="flex items-center gap-1.5 text-sm">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-0.5 text-muted-foreground hover:text-primary transition-colors font-medium cursor-pointer"
          >
            <Home className="w-3 h-3 mb-0.5" />
            forms
          </button>
          <span className="text-muted-foreground">/</span>
          <button
            onClick={() => setDialogOpen(true)}
            className="text-foreground hover:text-primary transition-colors font-semibold flex items-center gap-1 cursor-pointer group"
          >
            {title}
            <Pencil className="w-3 h-3 opacity-0 group-hover:opacity-100 duration-300" />
          </button>
        </nav>
        {saveError && (
          <span className="text-sm text-destructive">{saveError}</span>
        )}
      </div>

      <nav className="flex items-center gap-1">
        {navLinks.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={label}
            to={to.replace(":formId", formId || "new")}
            className={({ isActive }) =>
              cn(baseNavLinkClass, isActive && activeNavLinkClass)
            }
            end={to === ROUTES.FORM_BUILDER}
          >
            <Icon className="h-4 w-4" />
            <span className="text-xs tracking-wider">
              {label}
            </span>
          </NavLink>
        ))}
      </nav>

      <div className="flex items-center gap-2">
        <span
          className={cn(
            "text-sm flex items-center gap-1.5 text-muted-foreground w-18",
            saveStatus !== "idle" ? "opacity-100" : "opacity-0",
          )}
        >
          {saveStatus === "saving" && (
            <Loader2 className="h-4 w-4 animate-spin" />
          )}
          {saveStatus === "saved" && (
            <CheckCircle className="h-4 w-4 text-green-600" />
          )}
          {saveStatus === "error" && (
            <AlertCircle className="h-4 w-4 text-red-600" />
          )}
          {saveStatus === "saving"
            ? "Saving..."
            : saveStatus === "saved"
              ? "Saved"
              : "Error"}
        </span>

        <Button
          variant="outline"
          size="sm"
          className="h-9 gap-1.5 text-sm px-3"
          onClick={() => openPreview()}
        >
          <Play className="h-4 w-4" />
          Preview
        </Button>
        {!isPublished ? (
          <Button
            size="sm"
            className="h-9 gap-1.5 text-sm font-medium px-3"
            onClick={onPublish}
          >
            <Share2 className="h-4 w-4" />
            Publish
          </Button>
        ) : (
          <Button
            size="sm"
            variant="default"
            className="h-9 gap-1.5 text-sm font-medium px-3 bg-green-600 hover:bg-green-700"
            onClick={onPublishedClick}
          >
            <CheckCircle className="h-4 w-4" />
            Published
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
