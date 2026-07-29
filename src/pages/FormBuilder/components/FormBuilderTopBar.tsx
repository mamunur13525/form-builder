import { ROUTES } from "@/shared/constants/routes";
import {
  ArrowLeft,
  CheckCircle,
  Play,
  Wrench,
  Settings,
  Puzzle,
  Share2,
  BarChart3,
} from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Link, NavLink, useNavigate, useParams } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useCallback, useEffect, useRef, useState } from "react";
import { updateForm } from "@/entities/form/api/form.api";

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
  initialDescription?: string;
}

export function FormBuilderTopBar({
  isPublished,
  onPublish,
  onPublishedClick,
  initialTitle = "",
  initialDescription = "",
}: FormBuilderTopBarProps) {
  const { formId } = useParams<{ formId: string }>();
  const navigate = useNavigate();

  const baseNavLinkClass =
    "flex flex-col items-center gap-0.5 text-muted-foreground hover:text-primary transition-colors px-2.5 py-1.5 rounded-md";
  const activeNavLinkClass = "text-primary bg-primary/10";

  const [formTitleDesc, setFormTitleDesc] = useState({
    title: initialTitle,
    description: initialDescription,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const prevInitialTitleRef = useRef(initialTitle);
  const prevInitialDescriptionRef = useRef(initialDescription);

  // Update local state when initial values change from external source
  useEffect(() => {
    const hasInitialChanged = 
      initialTitle !== prevInitialTitleRef.current || 
      initialDescription !== prevInitialDescriptionRef.current;
    
    if (hasInitialChanged) {
      setFormTitleDesc({
        title: initialTitle,
        description: initialDescription,
      });
      prevInitialTitleRef.current = initialTitle;
      prevInitialDescriptionRef.current = initialDescription;
    }
  }, [initialTitle, initialDescription]);

  const handleTitleDescriptionChange = async (
    field: "title" | "description",
    value: string,
  ) => {
    // Optimistically update local state
    setFormTitleDesc((prev) => ({
      ...prev,
      [field]: value,
    }));
    setSaveError(null);

    // Auto-save if form has been persisted to server
    if (formId && formId !== "new") {
      setIsSaving(true);
      try {
        const updateData: { title?: string; description?: string } = {};
        
        // Only send the field that changed
        if (field === "title") {
          updateData.title = value;
          updateData.description = formTitleDesc.description;
        } else {
          updateData.description = value;
          updateData.title = formTitleDesc.title;
        }

        await updateForm(formId, updateData);
      } catch (error) {
        console.error("Failed to update form:", error);
        setSaveError("Failed to save changes");
        // Revert the change on error
        setFormTitleDesc((prev) => ({
          ...prev,
          [field]: field === "title" ? initialTitle : initialDescription,
        }));
      } finally {
        setIsSaving(false);
      }
    }
  };

  const onBack = useCallback(() => {
    navigate("/dashboard");
  }, [navigate]);

  return (
    <div className="flex items-center justify-between px-4 py-2 shrink-0 bg-background border-b">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={onBack}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex flex-col gap-1">
          <Input
            value={formTitleDesc.title}
            onChange={(e) => handleTitleDescriptionChange("title", e.target.value)}
            placeholder="Form title"
            className="h-7 text-sm font-semibold border-0 shadow-none focus-visible:ring-1 px-0 py-0 w-64"
            disabled={isSaving}
          />
          <Input
            value={formTitleDesc.description}
            onChange={(e) => handleTitleDescriptionChange("description", e.target.value)}
            placeholder="Form description"
            className="h-6 text-xs text-muted-foreground border-0 shadow-none focus-visible:ring-1 px-0 py-0 w-64"
            disabled={isSaving}
          />
        </div>
        {isSaving && (
          <span className="text-[11px] text-muted-foreground flex items-center gap-1">
            <span className="animate-spin">⏳</span>
            Saving...
          </span>
        )}
        {saveError && (
          <span className="text-[11px] text-destructive">
            {saveError}
          </span>
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
            <span className="text-[10px] font-semibold uppercase tracking-wider">
              {label}
            </span>
          </NavLink>
        ))}
      </nav>

      <div className="flex items-center gap-2">
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
    </div>
  );
}