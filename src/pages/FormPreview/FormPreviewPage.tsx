import { useState } from "react";
import { motion } from "framer-motion";
import { ROUTES } from "@/shared/constants/routes";
import { useParams, useNavigate } from "react-router-dom";
import { X, Monitor, Smartphone, RotateCcw } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Switch } from "../../components/ui/switch";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "../../components/ui/tooltip";
import { FormView } from "../../shared/components/FormView";
import { useForm } from "../../features/forms/hooks/useForms";
import { adaptApiForm } from "../../features/forms/model/adapters";
import { cn } from "@/lib/utils";

export function FormPreviewPage() {
  const { formId } = useParams();
  const navigate = useNavigate();
  const { data: apiForm, isLoading, isFetching } = useForm(formId || "");
  const [isMobileView, setIsMobileView] = useState(false);
  const [skipValidation, setSkipValidation] = useState(false);
  const [key, setKey] = useState(0);
  console.log("form preveiw page.");

  const handleRestart = () => {
    setKey((prev) => prev + 1);
  };

  if (isLoading || isFetching) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Loading form...</p>
      </div>
    );
  }

  if (!apiForm) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold">Form not found</h2>
        <Button className="mt-4" onClick={() => navigate(ROUTES.DASHBOARD)}>
          Back to Dashboard
        </Button>
      </div>
    );
  }

  const form = adaptApiForm(apiForm);

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      {/* Centered Dock */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring",  delay: 0 }}
        className="fixed top-4 left-1/2 -translate-x-1/2 z-50 duration-100"
      >
        <div className="flex items-center gap-1 px-3 py-1.5 rounded-full border bg-background/80 backdrop-blur-lg shadow-lg">
          <Tooltip>
            <TooltipTrigger render={<span/>}>
              <Button
                variant="ghost"
                size="icon"
                onClick={() =>
                  navigate(
                    ROUTES.FORM_BUILDER.replace(":formId", form.id ?? ""),
                  )
                }
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Exit</TooltipContent>
          </Tooltip>

          <div className="w-px h-5 bg-border mx-0.5" />

          <Tooltip>
            <TooltipTrigger render={<span/>}>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileView((prev) => !prev)}
                className="h-8 w-8"
              >
                {isMobileView ? (
                  <Monitor className="h-4 w-4" />
                ) : (
                  <Smartphone className="h-4 w-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {isMobileView ? "Desktop view" : "Mobile view"}
            </TooltipContent>
          </Tooltip>

          <div className="w-px h-5 bg-border mx-0.5" />

          <Tooltip>
            <TooltipTrigger render={<span/>}>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleRestart}
                className="h-8 w-8"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Restart</TooltipContent>
          </Tooltip>

          <div className="w-px h-5 bg-border mx-0.5" />

          <div className="flex items-center gap-2 pl-1 pr-1">
            <Badge variant="outline" className="text-[10px] font-normal">
              Preview
            </Badge>
            <label
              htmlFor="skip-validation"
              className="text-[11px] text-muted-foreground cursor-pointer select-none whitespace-nowrap"
            >
              Skip validation
            </label>
            <Switch
              id="skip-validation"
              checked={skipValidation}
              onCheckedChange={setSkipValidation}
              size="sm"
            />
          </div>
        </div>
      </motion.div>

      {/* Preview Content */}
      <div className="w-full flex-1 flex items-stretch justify-center px-10 py-20 ">
        <div
          className={cn(
            "w-full flex-1 grid place-items-center",
          )}
        >
          <div
            style={{ width: isMobileView ? "384px" : "100%", height: "100%" }}
            className="w-full flex-1  bg-background transition-all duration-500 ease-in-out overflow-hidden rounded-md border shadow-sm"
          >
            <FormView key={key} form={form} mode="preview" />
          </div>
        </div>
      </div>
    </div>
  );
}
