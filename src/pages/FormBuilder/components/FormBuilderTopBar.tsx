import { ROUTES } from "@/shared/constants/routes";
import {
  ArrowLeft,
  CheckCircle,
  Loader2,
  AlertCircle,
  Play,
  Wrench,
  Settings,
  Puzzle,
  Share2,
  BarChart3,
} from "lucide-react";
import { Button } from "../../../components/ui/button";
import { NavLink, useParams } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useState } from "react";
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
  saveStatus: "idle" | "saving" | "saved" | "error";
  onPreview: () => void;
  onPublish: () => void;
  onPublishedClick: () => void;
  onBack: () => void;
}

export function FormBuilderTopBar({
  isPublished,
  saveStatus,
  onPreview,
  onPublish,
  onPublishedClick,
  onBack,
}: FormBuilderTopBarProps) {
  const { formId } = useParams<{ formId: string }>();
  console.log({ formId });
  const baseNavLinkClass =
    "flex flex-col items-center gap-0.5 text-muted-foreground hover:text-primary transition-colors px-2.5 py-1.5 rounded-md";
  const activeNavLinkClass = "text-primary bg-primary/10";

  const [formTitleDesc, setFormTitleDesc] = useState({
    title: "",
    description: "",
  });

  const handleTitleDescripitonChange = async (
    type: string,
    newDescription: string,
  ) => {
    setFormTitleDesc((prev) => {
      return { ...prev, [type]: newDescription };
    });
    // Auto-save description if form has been persisted to server
    if (formId && formId !== "new") {
      await updateForm(formId, {
        title: formTitleDesc.title,
        description: formTitleDesc.description,
      });
    }
  };

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
        <span className="text-sm font-semibold">{formTitleDesc.title}</span>
        <span className="text-sm font-semibold">
          {formTitleDesc.description}
        </span>
      </div>

      <nav className="flex items-center gap-1">
        {navLinks.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={label}
            to={to.replace(":formId", formId!)}
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
        {saveStatus !== "idle" && (
          <span className="text-[11px] flex items-center gap-1.5 text-muted-foreground">
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
        )}
        <Button
          variant="outline"
          size="sm"
          className="h-7 gap-1 text-[11px] px-2"
          onClick={onPreview}
        >
          <Play className="h-3 w-3" />
          Preview
        </Button>
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
