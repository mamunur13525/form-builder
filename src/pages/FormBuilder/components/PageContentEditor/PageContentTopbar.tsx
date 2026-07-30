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
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface PageContentTopbarProps {
  onAddPage: () => void;
  onPreview: () => void;
  isMobileView: boolean;
  onToggleView: () => void;
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

const PageContentTopbar = ({
  onAddPage,
  onPreview,
  isMobileView,
  onToggleView,
}: PageContentTopbarProps) => {
  const rightButtons: RightButton[] = [
    {
      icon: isMobileView ? Monitor : Smartphone,
      tooltip: isMobileView ? "Desktop view" : "Mobile view",
      type: "view",
    },
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
    <div className="flex items-center justify-between px-4 py-2 shrink-0 bg-background border rounded-md">
      <div className="flex items-center gap-1">
        {leftButtons.map((button) => (
          <Button
            key={button.label}
            size="sm"
            variant={button.variant ?? "ghost"}
            className={
              button.variant === "default"
                ? "h-8 gap-1.5 text-xs font-medium"
                : "h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
            }
            onClick={() => handleBtnClick(button.type)}
          >
            <button.icon className="h-3.5 w-3.5" />
            {button.label}
          </Button>
        ))}
      </div>
      <TooltipProvider delay={200}>
        <div className="flex items-center gap-1">
          {rightButtons.map((button) => (
            <Tooltip key={button.tooltip}>
              <TooltipTrigger render={<span />}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  onClick={() => handleBtnClick(button.type)}
                >
                  <button.icon className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{button.tooltip}</TooltipContent>
            </Tooltip>
          ))}
        </div>
      </TooltipProvider>
    </div>
  );
};

export default PageContentTopbar;
