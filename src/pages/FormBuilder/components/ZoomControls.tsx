import { Maximize2, ZoomIn, ZoomOut } from "lucide-react";

const BUTTON_CLASS =
  "flex h-6 w-6 items-center justify-center rounded-lg text-slate-500 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer";

interface ZoomControlsProps {
  zoomLevel: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
}

/** Floating zoom controls anchored to the bottom-right of the canvas. */
export function ZoomControls({
  zoomLevel,
  onZoomIn,
  onZoomOut,
  onReset,
}: ZoomControlsProps) {
  return (
    <div className="absolute bottom-5 right-5 z-20 flex items-center gap-3 rounded-lg border border-slate-200/90 dark:border-zinc-800/90 bg-white/95 dark:bg-[#16161a]/95 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-zinc-300 shadow-xl dark:shadow-2xl backdrop-blur-md">
      <button
        type="button"
        onClick={onZoomOut}
        aria-label="Zoom out"
        className={BUTTON_CLASS}
      >
        <ZoomOut className="h-3.5 w-3.5" />
      </button>
      <span className="w-9 text-center tabular-nums select-none font-medium text-slate-800 dark:text-zinc-200">
        {zoomLevel}%
      </span>
      <button
        type="button"
        onClick={onZoomIn}
        aria-label="Zoom in"
        className={BUTTON_CLASS}
      >
        <ZoomIn className="h-3.5 w-3.5" />
      </button>
      <div className="h-3.5 w-px bg-slate-200 dark:bg-zinc-800" />
      <button
        type="button"
        onClick={onReset}
        aria-label="Reset zoom"
        className={BUTTON_CLASS}
      >
        <Maximize2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
