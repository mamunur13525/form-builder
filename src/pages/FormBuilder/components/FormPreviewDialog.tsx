import { useState, useMemo } from "react";
import { X, Monitor, Smartphone, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { Dialog } from "@/components/ui/dialog";
import { FormView } from "@/shared/components/FormView";
import type { Form } from "@/shared/types/common";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface FormPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: Form | null;
}

export function FormPreviewDialog({
  open,
  onOpenChange,
  form,
}: FormPreviewDialogProps) {
  const [isMobileView, setIsMobileView] = useState(false);
  const [skipValidation, setSkipValidation] = useState(false);
  const formKey = useMemo(() => {
    return form ? JSON.stringify(form) : "no-form";
  }, [form]);

  const [restartCount, setRestartCount] = useState(0);

  const handleRestart = () => {
    setRestartCount((prev) => prev + 1);
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} className="max-w-[90vw] w-full min-w-[90vw] h-[90vh] p-0 gap-0"
    >
      <div className="h-full w-full flex flex-col bg-muted/30 ">
        {/* Centered Dock */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", delay: 0 }}
          className="absolute top-4 left-1/2 -translate-x-1/2 z-50 duration-100"
        >
          <div className="w-full h-full flex items-center gap-1 px-3 py-1.5 rounded-full border bg-background/80 backdrop-blur-lg shadow-lg">
            <Tooltip>
              <TooltipTrigger render={<span />}>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleClose}
                  className="h-12 w-12"
                >
                  <X className="h-5! w-5!" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Exit</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger render={<span />}>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMobileView((prev) => !prev)}
                  className="h-12 -12 hidden sm:block"
                >
                  {isMobileView ? (
                    <Monitor className="h-5! w-5!" />
                  ) : (
                    <Smartphone className="h-5! w-5!" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isMobileView ? "Desktop view" : "Mobile view"}
              </TooltipContent>
            </Tooltip>

            <div className="w-px h-5 bg-border mx-0.5" />

            <Tooltip>
              <TooltipTrigger render={<span />}>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleRestart}
                  className="h-12 -12"
                >
                  <RotateCcw className="h-5! w-5!" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Restart</TooltipContent>
            </Tooltip>

            <div className="w-px h-5 bg-border mx-0.5" />

            <div className="flex items-center gap-2 pl-1 pr-1">
              <Badge variant="outline" className="text-sm font-normal">
                Preview
              </Badge>
              <label
                htmlFor="skip-validation"
                className="text-base text-muted-foreground cursor-pointer select-none whitespace-nowrap"
              >
                Skip validation
              </label>
              <Switch
                id="skip-validation"
                checked={skipValidation}
                onCheckedChange={setSkipValidation}

              />
            </div>
          </div>
        </motion.div>

        {/* Preview Content */}
        <div className="w-full flex-1 flex items-stretch justify-center px-10 pb-14 pt-28 ">
          <div className={cn("w-full flex-1 grid place-items-center")}>
            <div
              style={{
                width: isMobileView ? "450px" : "100%",
                height: "100%",
              }}
              className="w-full flex-1  bg-background transition-all duration-500 ease-in-out overflow-hidden rounded-md border shadow-sm"
            >
              {form && <FormView key={`${formKey}-${restartCount}`} form={form} mode="preview" />}
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
