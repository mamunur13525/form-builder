import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { showWarning } from "@/shared/hooks/useToast";
import {
  GitBranch,
  Paintbrush,
  Play,
  Plus,
  Smartphone,
  Monitor,
  PanelLeft,
  SlidersHorizontal,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface PageContentTopbarProps {
  onAddPage: () => void;
  onPreview: () => void;
  isMobileView: boolean;
  onToggleView: () => void;
  /** Provided on compact layouts, where the pages list lives in a drawer. */
  onOpenPages?: () => void;
  /** Provided on compact layouts, where settings live in a drawer. */
  onOpenSettings?: () => void;
}

interface LeftButton {
  icon: LucideIcon;
  label: string;
  variant?: "default" | "ghost";
  type: string;
}

interface RightButton {
  icon: LucideIcon;
  tooltip: string;
  type: string;
}

const leftButtons: LeftButton[] = [
  { icon: Plus, label: "Add Page", variant: "default", type: "add_page" },
  { icon: Paintbrush, label: "Design", variant: "ghost", type: "design" },
  { icon: GitBranch, label: "Logic", variant: "ghost", type: "logic" },
];

const iconButtonClass =
  "editorial-transition h-10 w-10 shrink-0 rounded-full border border-[var(--editorial-border-light)] bg-[var(--secondary)] text-[var(--editorial-body)] hover:-translate-y-0.5 hover:border-[var(--editorial-primary-ring)] hover:bg-[var(--editorial-primary-light)] hover:text-[var(--primary)] active:translate-y-0 active:scale-[.98] sm:h-11 sm:w-11";

const PageContentTopbar = ({
  onAddPage,
  onPreview,
  isMobileView,
  onToggleView,
  onOpenPages,
  onOpenSettings,
}: PageContentTopbarProps) => {
  // The drawer triggers are only passed on compact layouts, where the canvas is
  // already phone-sized and the desktop/mobile toggle would be meaningless.
  const isCompact = Boolean(onOpenPages || onOpenSettings);

  const rightButtons: RightButton[] = [
    ...(isCompact
      ? []
      : [
          {
            icon: isMobileView ? Monitor : Smartphone,
            tooltip: isMobileView ? "Desktop view" : "Mobile view",
            type: "view",
          },
        ]),
    {
      icon: Play,
      tooltip: "Preview",
      type: "preview",
    },
  ];

  const handleDesign = () => {
    showWarning("Coming Soon!");
  };

  const handleLogic = () => {
    showWarning("Coming Soon!");
  };

  const handleBtnClick = (type: string) => {
    switch (type) {
      case "add_page":
        onAddPage();
        break;
      case "preview":
        onPreview();
        break;
      case "view":
        onToggleView();
        break;
      case "design":
        handleDesign();
        break;
      case "logic":
        handleLogic();
        break;

      default:
        break;
    }
  };

  return (
    <div className="editorial-shadow-sm flex shrink-0 items-center justify-between gap-2 rounded-[20px] border border-[var(--border)] bg-[var(--card)] px-3 py-3 sm:rounded-[24px] sm:px-6 sm:py-4">
      <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
        {onOpenPages && (
          <Button
            variant="ghost"
            size="icon"
            aria-label="Open pages"
            className={iconButtonClass}
            onClick={onOpenPages}
          >
            <PanelLeft className="h-5 w-5" />
          </Button>
        )}
        {leftButtons.map((button) => (
          <Button
            key={button.label}
            variant={button.variant ?? "ghost"}
            aria-label={button.label}
            className={
              button.variant === "default"
                ? "editorial-transition h-10 shrink-0 gap-2 rounded-[16px] bg-[var(--primary)] px-3 text-sm font-medium text-white shadow-[0_8px_24px_rgba(238,125,105,.25)] hover:-translate-y-0.5 hover:bg-[var(--editorial-primary-hover)] active:translate-y-0 active:scale-[.98] active:bg-[var(--editorial-primary-pressed)] sm:h-11 sm:px-5"
                : "editorial-transition h-10 shrink-0 gap-2 rounded-[16px] px-3 text-sm text-[var(--editorial-body)] hover:bg-[var(--secondary)] hover:text-[var(--foreground)] sm:h-11 sm:px-4"
            }
            onClick={() => handleBtnClick(button.type)}
          >
            <button.icon className="h-5 w-5" />
            <span className="hidden md:inline">{button.label}</span>
          </Button>
        ))}
      </div>
      <TooltipProvider delay={200}>
        <div className="flex items-center gap-1.5 sm:gap-2">
          {rightButtons.map((button) => (
            <Tooltip key={button.tooltip}>
              <TooltipTrigger render={<span />}>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={button.tooltip}
                  className={iconButtonClass}
                  onClick={() => handleBtnClick(button.type)}
                >
                  <button.icon className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="editorial rounded-[12px] border border-[var(--border)] bg-[var(--popover)] text-[var(--foreground)]">
                {button.tooltip}
              </TooltipContent>
            </Tooltip>
          ))}
          {onOpenSettings && (
            <Button
              variant="ghost"
              size="icon"
              aria-label="Open settings"
              className={iconButtonClass}
              onClick={onOpenSettings}
            >
              <SlidersHorizontal className="h-5 w-5" />
            </Button>
          )}
        </div>
      </TooltipProvider>
    </div>
  );
};

export default PageContentTopbar;
