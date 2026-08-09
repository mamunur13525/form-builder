import { useState, useMemo } from "react";
import { X, Monitor, Smartphone, RotateCcw, Maximize2 } from "lucide-react";
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
import { motion, AnimatePresence } from "framer-motion";

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
  const [isFullscreen, setIsFullscreen] = useState(false);
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

  const toggleFullscreen = () => {
    setIsFullscreen((prev) => !prev);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      className={cn(
        "max-w-[90vw] w-full min-w-[90vw] h-[90vh] p-0 gap-0",
        isFullscreen &&
        "max-w-none min-w-0 w-screen h-screen rounded-none mx-0 border-0",
      )}
    >
      <motion.div
        layout
        transition={{ type: "spring", stiffness: 220, damping: 28 }}
        className={cn(
          "relative h-full w-full flex flex-col overflow-hidden",
          isFullscreen && "bg-background",
        )}
      >
        {/* Centered Dock — hidden (animated) in fullscreen mode */}
        <AnimatePresence>
          {!isFullscreen && (
            <motion.div
              key="centered-dock"
              initial={{ y: -50, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -60, opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 260, damping: 24 }}
              className="absolute top-4 left-1/2 -translate-x-1/2 z-50 duration-100"
            >
              <div className="w-full h-full flex items-center gap-1 px-3 py-1.5 rounded-full border bg-background/80 backdrop-blur-lg shadow-lg">
                <Tooltip >
                  <TooltipTrigger delay={200} render={<span className="flex size-12 items-center justify-center" />}>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleClose}
                      className="size-12"
                    >
                      <X className="size-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Exit</TooltipContent>
                </Tooltip>
                <div className="w-px h-5 bg-border mx-0.5" />

                <Tooltip>
                  <TooltipTrigger delay={200} render={<span className="flex size-12 items-center justify-center hidden sm:flex" />}>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsMobileView((prev) => !prev)}
                      className="size-12"
                    >
                      {isMobileView ? (
                        <Monitor className="size-5" />
                      ) : (
                        <Smartphone className="size-5" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {isMobileView ? "Desktop view" : "Mobile view"}
                  </TooltipContent>
                </Tooltip>

                <div className="w-px h-5 bg-border mx-0.5" />

                <Tooltip>
                  <TooltipTrigger delay={200} render={<span className="flex size-12 items-center justify-center" />}>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={toggleFullscreen}
                      className="size-12"
                    >
                      <Maximize2 className="size-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Fullscreen preview</TooltipContent>
                </Tooltip>

                <div className="w-px h-5 bg-border mx-0.5" />

                <Tooltip>
                  <TooltipTrigger delay={200} render={<span className="flex size-12 items-center justify-center" />}>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleRestart}
                      className="size-12"
                    >
                      <RotateCcw className="size-5" />
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
          )}
        </AnimatePresence>

        {/* Close icon at top-right in fullscreen mode — animated in/out */}
        <AnimatePresence>
          {isFullscreen && (
            <motion.div
              key="fullscreen-close"
              initial={{ opacity: 0, scale: 0.6, y: -12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.6, y: -12 }}
              transition={{ type: "spring", stiffness: 300, damping: 22 }}
              className="absolute top-4 right-4 z-50"
            >
              <Tooltip>
                <TooltipTrigger render={<span className="flex size-12 items-center justify-center" />}>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsFullscreen(false)}
                    className="size-12 rounded-full bg-background/80 shadow-lg backdrop-blur-lg"
                  >
                    <X className="size-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Exit fullscreen</TooltipContent>
              </Tooltip>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Preview Content — no padding in fullscreen mode */}
        <motion.div
          layout
          transition={{ type: "spring", stiffness: 220, damping: 28 }}
          className={cn(
            "w-full flex-1 flex items-stretch justify-center",
            isFullscreen ? "p-0" : "px-10 pb-14 pt-28 ",
          )}
        >
          <motion.div layout className={cn("w-full flex-1 grid place-items-center")}>
            <motion.div
              layout
              style={{
                width: isMobileView ? "450px" : "100%",
                height: "100%",
              }}
              className={cn(
                "w-full flex-1 bg-background transition-all duration-500 ease-in-out overflow-hidden",
                isFullscreen ? "rounded-none border-0" : "rounded-md border shadow-sm",
              )}
            >
              {form && <FormView key={`${formKey}-${restartCount}`} form={form} mode="preview" />}
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>
    </Dialog>
  );
}