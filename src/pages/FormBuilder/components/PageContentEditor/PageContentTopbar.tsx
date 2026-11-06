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
    <div className="flex shrink-0 items-center justify-between gap-3 rounded-2xl border border-slate-200/90 bg-white/95 px-3 py-2 text-slate-800 shadow-xl backdrop-blur-md dark:border-zinc-800 dark:bg-[#141418]/95 dark:text-zinc-100 dark:shadow-[0_20px_60px_-20px_rgba(0,0,0,0.9)]">
      <div className="flex min-w-0 items-center gap-2">
        {onOpenPages && (
          <button
            type="button"
            aria-label="Open pages"
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
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
          className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
        >
          <Paintbrush className="h-4 w-4 text-slate-400 dark:text-zinc-500" />
          <span>Design</span>
        </button>

        {/* Divider */}
        <div className="h-4 w-px bg-slate-200 dark:bg-zinc-800 mx-1 hidden sm:block" />

        {/* Logic button */}
        <button
          type="button"
          onClick={() => route("/form-logic/" + formId)}
          className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
        >
          <GitBranch className="h-4 w-4 text-slate-400 dark:text-zinc-500" />
          <span>Logic</span>
        </button>
      </div>

      <div className="flex items-center gap-2">
        {/* Device view switcher */}
        {!isCompact && (
          <div className="flex items-center gap-1 rounded-xl border border-slate-200/80 bg-slate-100/90 p-1 dark:border-zinc-800 dark:bg-zinc-900/80">
            <button
              type="button"
              onClick={() => isMobileView && onToggleView()}
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-lg transition-all cursor-pointer",
                !isMobileView
                  ? "bg-[#FF5722] text-white shadow-xs"
                  : "text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 dark:hover:text-white dark:hover:bg-zinc-800",
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
                  : "text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 dark:hover:text-white dark:hover:bg-zinc-800",
              )}
              title="Mobile view"
            >
              <Smartphone className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Preview trigger */}
        {!isCompact && (
          <button
            type="button"
            onClick={onPreview}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/80 bg-white text-slate-500 shadow-xs transition-colors cursor-pointer hover:bg-slate-50 hover:text-slate-800 dark:border-zinc-800 dark:bg-[#18181c] dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
            title="Open preview"
            aria-label="Open preview"
          >
            <Play className="h-4 w-4" />
          </button>
        )}

        {onOpenSettings && (
          <button
            type="button"
            aria-label="Open settings"
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
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
