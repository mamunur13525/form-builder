import { memo, useMemo, useState, type CSSProperties } from "react";
import type {
  EndPage,
  FormPage,
  IFormTheme,
} from "@/shared/types/common";
import type { VariableItem } from "@/shared/components/pages";
import { resolveFormTheme } from "@/shared/utils/theme";
import PageContentTopbar from "./PageContentEditor/PageContentTopbar";
import { PageContentEditor } from "./PageContentEditor/PageContentEditor";
import { EndPageContentEditor } from "./EndPage/EndPageContentEditor";
import { SelectionFrame } from "./SelectionFrame";
import { ZoomControls } from "./ZoomControls";

interface BuilderCanvasProps {
  selectedPage?: FormPage;
  selectedPageIndex: number;
  selectedEndPage?: EndPage;
  selectedEndPageIndex: number;
  isEndPageSelected: boolean;
  theme?: IFormTheme | null;
  variables: VariableItem[];
  selectedQuestionId: string | null;
  onUpdatePage: (index: number, updates: Partial<FormPage>) => void;
  onUpdateEndPage: (index: number, updates: Partial<EndPage>) => void;
  onSelectQuestion: (questionId: string | null) => void;
  onAddPage: () => void;
  onPreview: () => void;
  onOpenDesignDrawer: () => void;
  onOpenPages?: () => void;
  onOpenSettings?: () => void;
  isDesktop: boolean;
}

/**
 * Middle column: the artboard window with its own view/zoom controls.
 *
 * View and zoom live here rather than in the page so toggling them never
 * re-renders the page list or the settings panel.
 */
function BuilderCanvasComponent({
  selectedPage,
  selectedPageIndex,
  selectedEndPage,
  selectedEndPageIndex,
  isEndPageSelected,
  theme,
  variables,
  selectedQuestionId,
  onUpdatePage,
  onUpdateEndPage,
  onSelectQuestion,
  onAddPage,
  onPreview,
  onOpenDesignDrawer,
  onOpenPages,
  onOpenSettings,
  isDesktop,
}: BuilderCanvasProps) {
  const [isMobileView, setIsMobileView] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);

  // The theme's canvas background lives on the window content itself so the
  // image spans the whole artboard (including its padding) instead of only the
  // editable page surface.
  const canvasBackgroundStyle = useMemo<CSSProperties>(() => {
    const resolved = resolveFormTheme(theme);
    const image = resolved.backgroundImage;
    const brightness = image?.brightness ?? 0;
    const brightnessLayer =
      brightness > 0
        ? `linear-gradient(rgba(255,255,255,${Math.min(brightness, 100) / 100}), rgba(255,255,255,${Math.min(brightness, 100) / 100}))`
        : brightness < 0
          ? `linear-gradient(rgba(0,0,0,${Math.min(-brightness, 100) / 100}), rgba(0,0,0,${Math.min(-brightness, 100) / 100}))`
          : null;

    return {
      backgroundColor: resolved.backgroundColor,
      color: resolved.textColor,
      ...(image?.url
        ? {
            backgroundImage: brightnessLayer
              ? `${brightnessLayer}, url(${image.url})`
              : `url(${image.url})`,
            backgroundRepeat: image.tile ? "repeat" : "no-repeat",
            backgroundSize: image.tile ? "auto" : "cover",
            backgroundPosition: "center",
          }
        : {}),
    };
  }, [theme]);

  return (
    <div className="relative flex h-full min-h-0 w-full flex-col gap-3 p-3 bg-slate-200/80 dark:bg-[#3f4255] bg-[radial-gradient(rgba(148,163,184,0.45)_1.2px,transparent_1.2px)] dark:bg-[radial-gradient(rgba(93,97,122,0.5)_1.2px,transparent_1.2px)] [background-size:24px_24px] overflow-hidden">
      {/* Neutral vignette: softly frames the canvas in light mode without muddying dots; hidden in dark mode */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(100,116,139,0.12)_100%)] dark:hidden" />

      <div className="relative z-10 w-full">
        <PageContentTopbar
          onAddPage={onAddPage}
          onPreview={onPreview}
          isMobileView={isMobileView}
          onToggleView={() => setIsMobileView((prev) => !prev)}
          onOpenPages={onOpenPages}
          onOpenSettings={onOpenSettings}
          onOpenDesignDrawer={onOpenDesignDrawer}
        />
      </div>

      <div className="relative z-10 flex min-h-0 w-full flex-1 items-center justify-center overflow-auto p-1 sm:p-3">
        <div
          className="light relative flex flex-col h-full max-h-[78vh] -translate-y-7 w-full overflow-hidden rounded-lg border border-slate-200/90 bg-white shadow-xl dark:shadow-[0_30px_90px_-20px_rgba(0,0,0,0.9)] transition-[transform,width,box-shadow] duration-300"
          style={{
            width: isMobileView ? "min(420px, 100%)" : "100%",
            transform:
              zoomLevel !== 100 ? `scale(${zoomLevel / 100})` : undefined,
            transformOrigin: "top center",
          }}
        >
          {/* Browser Mockup Window Header Bar */}
          <div className="flex h-10 shrink-0 items-center justify-between border-b border-slate-200/80 bg-slate-100/90 px-4">
            <div className="h-5 w-48 sm:w-64 rounded-full bg-slate-200/80 border border-slate-300/60 mx-auto flex items-center justify-center text-[11px] text-slate-500 font-mono tracking-tight">
              forms.studio/preview
            </div>
            <div className="w-12" />
          </div>

          {/* Window Canvas Content with Studio Bounding Box */}
          <div
            className="flex-1 min-h-0 overflow-y-auto relative p-2 sm:p-4 bg-white"
            style={canvasBackgroundStyle}
          >
            {isEndPageSelected && selectedEndPage ? (
              <SelectionFrame label="End Page">
                <EndPageContentEditor
                  endPage={selectedEndPage}
                  endPageIndex={selectedEndPageIndex}
                  onUpdate={onUpdateEndPage}
                  isMobileView={isMobileView}
                  theme={theme}
                  variables={variables}
                  withBackground={false}
                />
              </SelectionFrame>
            ) : selectedPage ? (
              <SelectionFrame label={`Page ${selectedPageIndex + 1}`}>
                <PageContentEditor
                  page={selectedPage}
                  pageIndex={selectedPageIndex}
                  onUpdate={onUpdatePage}
                  isMobileView={isMobileView}
                  theme={theme}
                  variables={variables}
                  withBackground={false}
                  selectedQuestionId={selectedQuestionId}
                  onSelectQuestion={onSelectQuestion}
                />
              </SelectionFrame>
            ) : (
              <div className="flex h-full flex-col items-center justify-center px-4 text-center">
                <p className="font-semibold text-xl text-slate-800 sm:text-2xl">
                  Nothing selected
                </p>
                <p className="mt-2 text-sm text-slate-500 sm:text-base">
                  {isDesktop
                    ? "Choose a page from the left to begin editing."
                    : "Open the pages panel to choose a page."}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <ZoomControls
        zoomLevel={zoomLevel}
        onZoomIn={() => setZoomLevel((prev) => Math.min(150, prev + 10))}
        onZoomOut={() => setZoomLevel((prev) => Math.max(50, prev - 10))}
        onReset={() => setZoomLevel(100)}
      />
    </div>
  );
}

export const BuilderCanvas = memo(BuilderCanvasComponent);
