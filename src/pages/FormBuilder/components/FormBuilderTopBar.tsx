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
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Link, NavLink, useNavigate, useParams } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import { updateForm } from "@/entities/form/api/form.api";
import { useFormContext } from "@/features/forms/hooks/useFormContext";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogContent,
} from "../../../components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";

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
  const { updateFormData, saveStatus, showSaveStatus } = useFormContext();
  const baseNavLinkClass =
    "flex flex-col items-center gap-0.5 text-muted-foreground hover:text-primary transition-colors px-2.5 py-1.5 rounded-md";
  const activeNavLinkClass = "text-primary bg-primary/10";

  const [title, setTitle] = useState(initialTitle);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const prevInitialTitleRef = useRef(initialTitle);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTitle, setEditTitle] = useState("");

  // Update local state when initial values change from external source
  useEffect(() => {
    if (initialTitle !== prevInitialTitleRef.current) {
      setTitle(initialTitle);
      prevInitialTitleRef.current = initialTitle;
    }
  }, [initialTitle]);

  const handleTitleSave = async () => {
    const trimmed = editTitle.trim();
    if (!trimmed || trimmed === title) {
      setDialogOpen(false);
      return;
    }

    setSaveError(null);

    if (formId && formId !== "new") {
      setIsSaving(true);
      showSaveStatus("saving");
      try {
        await updateForm(formId, { title: trimmed });
        setTitle(trimmed);
        updateFormData({ title: trimmed });
        showSaveStatus("saved");
      } catch (error) {
        console.error("Failed to update form title:", error);
        setSaveError("Failed to save changes");
        showSaveStatus("error");
      } finally {
        setIsSaving(false);
      }
    } else {
      setTitle(trimmed);
      updateFormData({ title: trimmed });
    }

    setDialogOpen(false);
  };

  const openTitleDialog = () => {
    setEditTitle(title);
    setDialogOpen(true);
  };

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
            onClick={openTitleDialog}
            className="text-foreground hover:text-primary transition-colors font-semibold flex items-center gap-1 cursor-pointer group"
          >
            {title}
            <Pencil className="w-3 h-3 opacity-0 group-hover:opacity-100 duration-300" />
          </button>
        </nav>
        {saveError && (
          <span className="text-[11px] text-destructive">{saveError}</span>
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
            <Icon className="h-3 w-3" />
            <span className="text-[8px] font-semibold uppercase tracking-wider">
              {label}
            </span>
          </NavLink>
        ))}
      </nav>

      <div className="flex items-center gap-2">
        <span
          className={cn(
            "text-[11px] flex items-center gap-1.5 text-muted-foreground w-14",
            saveStatus !== "idle" ? "opacity-100" : "opacity-0",
          )}
        >
          {saveStatus === "saving" && (
            <Loader2 className="h-3 w-3 animate-spin" />
          )}
          {saveStatus === "saved" && (
            <CheckCircle className="h-3 w-3 text-green-600" />
          )}
          {saveStatus === "error" && (
            <AlertCircle className="h-3 w-3 text-red-600" />
          )}
          {saveStatus === "saving"
            ? "Saving..."
            : saveStatus === "saved"
              ? "Saved"
              : "Error"}
        </span>

        <Link to={`/form-preview/${formId || "new"}`}>
          <Button
            variant="outline"
            size="sm"
            className="h-7 gap-1 text-[11px] px-2"
          >
            <Play className="h-3 w-3" />
            Preview
          </Button>
        </Link>
        {!isPublished ? (
          <Button
            size="sm"
            className="h-7 gap-1 text-[11px] font-medium px-2"
            onClick={onPublish}
          >
            <Share2 className="h-3 w-3" />
            Publish
          </Button>
        ) : (
          <Button
            size="sm"
            variant="default"
            className="h-7 gap-1 text-[11px] font-medium px-2 bg-green-600 hover:bg-green-700"
            onClick={onPublishedClick}
          >
            <CheckCircle className="h-3 w-3" />
            Published
          </Button>
        )}
      </div>

      {/* Title Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Form Title</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Form Title</Label>
              <Input
                id="edit-title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Enter form title"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleTitleSave();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleTitleSave} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save"}
              {isSaving && <Spinner data-icon="inline-start" />}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
