import {
  GitBranch,
  Paintbrush,
  Plus,
  Smartphone,
  Monitor,
  PanelLeft,
  SlidersHorizontal,
  ChevronRight,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { cn } from "@/lib/utils";

interface PageContentTopbarProps {
  onAddPage: () => void;
  onPreview: () => void;
  isMobileView: boolean;
  onToggleView: () => void;
  /** Provided on compact layouts, where the pages list lives in a drawer. */
  onOpenPages?: () => void;
  /** Provided on compact layouts, where settings live in a drawer. */
  onOpenSettings?: () => void;
  onOpenDesignDrawer: () => void;
}

const PageContentTopbar = ({
  onAddPage,
  onPreview,
  isMobileView,
  onToggleView,
  onOpenPages,
  onOpenSettings,
  onOpenDesignDrawer,
}: PageContentTopbarProps) => {
  const isCompact = Boolean(onOpenPages || onOpenSettings);
  const route = useNavigate();
  const { formId } = useParams();

  return (
    <div className="light flex shrink-0 items-center justify-between gap-3 rounded-2xl border border-slate-200/90 bg-white/95 px-3 py-2 text-slate-800 shadow-xl backdrop-blur-md">
      <div className="flex min-w-0 items-center gap-2">
        {onOpenPages && (
          <button
            type="button"
            aria-label="Open pages"
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
            onClick={onOpenPages}
          >
            <PanelLeft className="h-5 w-5" />
          </button>
        )}

        {/* Add Page button */}
        <button
          type="button"
          onClick={onAddPage}
          className="flex items-center gap-2 rounded-xl bg-[#FF5722] hover:bg-[#F4511E] px-4 py-2 text-sm font-semibold text-white shadow-md shadow-[#FF5722]/20 transition-all cursor-pointer active:scale-95"
        >
          <Plus className="h-4 w-4 stroke-[2.5]" />
          <span>Add page</span>
        </button>

        {/* Design button */}
        <button
          type="button"
          onClick={onOpenDesignDrawer}
          className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <Paintbrush className="h-4 w-4 text-slate-400" />
          <span>Design</span>
        </button>

        {/* Divider */}
        <div className="h-4 w-px bg-slate-200 mx-1 hidden sm:block" />

        {/* Logic button */}
        <button
          type="button"
          onClick={() => route("/form-logic/" + formId)}
          className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <GitBranch className="h-4 w-4 text-slate-400" />
          <span>Logic</span>
        </button>
      </div>

      <div className="flex items-center gap-2">
        {/* Device view switcher & preview trigger */}
        {!isCompact && (
          <div className="flex items-center gap-1 rounded-xl bg-slate-100/90 border border-slate-200/80 p-1">
            <button
              type="button"
              onClick={() => isMobileView && onToggleView()}
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-lg transition-all cursor-pointer",
                !isMobileView
                  ? "bg-[#FF5722] text-white shadow-xs"
                  : "text-slate-400 hover:text-slate-700 hover:bg-slate-200/60",
              )}
              title="Desktop view"
            >
              <Monitor className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => !isMobileView && onToggleView()}
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-lg transition-all cursor-pointer",
                isMobileView
                  ? "bg-[#FF5722] text-white shadow-xs"
                  : "text-slate-400 hover:text-slate-700 hover:bg-slate-200/60",
              )}
              title="Mobile view"
            >
              <Smartphone className="h-4 w-4" />
            </button>
            <div className="h-4 w-px bg-slate-200 mx-0.5" />
            <button
              type="button"
              onClick={onPreview}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-200/60 transition-colors cursor-pointer"
              title="Open preview"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {onOpenSettings && (
          <button
            type="button"
            aria-label="Open settings"
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
            onClick={onOpenSettings}
          >
            <SlidersHorizontal className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default PageContentTopbar;
