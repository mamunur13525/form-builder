import { memo, useMemo, useState, type CSSProperties } from "react";
import type {
  EndPage,
  FormPage,
  IFormTheme,
} from "@/shared/types/common";
import type { VariableItem } from "@/shared/components/pages";
import { cn } from "@/lib/utils";
import {
  getCoverImageStyle,
  resolveCoverImageLayout,
  resolveFormTheme,
} from "@/shared/utils/theme";
import {
  CoverImageHoverBar,
  CoverImageSide,
} from "@/shared/components/CoverImageBlock";
import PageContentTopbar from "./PageContentEditor/PageContentTopbar";
import { PageContentEditor } from "./PageContentEditor/PageContentEditor";
import { EndPageContentEditor } from "./EndPage/EndPageContentEditor";
import { ImagePickerDialog } from "./settings/ImagePickerDialog";
import { ImageEditorDialog } from "./settings/ImageEditorDialog";
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
  onAddPaymentPage?: () => void;
  onPreview: () => void;
  onOpenDesignDrawer: () => void;
  onOpenPages?: () => void;
  onOpenSettings?: () => void;
  isDesktop: boolean;
  isMobileView: boolean;
  onToggleMobileView: () => void;
}

/**
 * Middle column: the artboard window with its own view/zoom controls.
 *
 * Zoom lives here rather than in the page so toggling it never re-renders
 * the page list or the settings panel.
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
  onAddPaymentPage,
  onPreview,
  onOpenDesignDrawer,
  onOpenPages,
  onOpenSettings,
  isDesktop,
  isMobileView,
  onToggleMobileView,
}: BuilderCanvasProps) {
  const [zoomLevel, setZoomLevel] = useState(100);
  const [coverPickerOpen, setCoverPickerOpen] = useState(false);
  const [coverEditorOpen, setCoverEditorOpen] = useState(false);

  const activeCoverImage = isEndPageSelected
    ? selectedEndPage?.coverImage
    : selectedPage?.coverImage;
  const activeCoverLayout = resolveCoverImageLayout(activeCoverImage, isMobileView);
  const hasCoverUrl = Boolean(activeCoverImage?.url);
  const isWallpaperActive = hasCoverUrl && activeCoverLayout === "wallpaper";
  const isSideCoverActive =
    hasCoverUrl && (activeCoverLayout === "left" || activeCoverLayout === "right");
  const isBannerActive = hasCoverUrl && activeCoverLayout === "banner";

  const updateActiveCoverImage = (nextCoverImage: FormPage["coverImage"]) => {
    if (isEndPageSelected && selectedEndPage) {
      onUpdateEndPage(selectedEndPageIndex, { coverImage: nextCoverImage });
    } else if (selectedPage) {
      onUpdatePage(selectedPageIndex, { coverImage: nextCoverImage });
    }
  };

  // The theme's canvas background lives on the window content itself so the
  // colour spans the whole artboard (including its padding) instead of only the
  // editable page surface.
  const canvasBackgroundStyle = useMemo<CSSProperties>(() => {
    const resolved = resolveFormTheme(theme);

    return {
      backgroundColor: resolved.backgroundColor,
      color: resolved.textColor,
    };
  }, [theme]);

  const canvasSelectionContent = isEndPageSelected && selectedEndPage ? (
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
        onAddPaymentPage={onAddPaymentPage}
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
  );

  const hoverBar = activeCoverImage?.url ? (
    <CoverImageHoverBar
      onChangeImage={() => setCoverPickerOpen(true)}
      onEditImage={() => setCoverEditorOpen(true)}
      onRemoveImage={() => updateActiveCoverImage(null)}
    />
  ) : null;

  return (
    <div className="relative flex h-full min-h-0 w-full flex-col gap-3 p-3 bg-slate-200/80 dark:bg-[#3f4255] bg-[radial-gradient(rgba(148,163,184,0.45)_1.2px,transparent_1.2px)] dark:bg-[radial-gradient(rgba(93,97,122,0.5)_1.2px,transparent_1.2px)] [background-size:24px_24px] overflow-hidden">
      {/* Neutral vignette: softly frames the canvas in light mode without muddying dots; hidden in dark mode */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(100,116,139,0.12)_100%)] dark:hidden" />

      <div className="relative z-10 w-full">
        <PageContentTopbar
          onAddPage={onAddPage}
          onPreview={onPreview}
          isMobileView={isMobileView}
          onToggleView={onToggleMobileView}
          onOpenPages={onOpenPages}
          onOpenSettings={onOpenSettings}
          onOpenDesignDrawer={onOpenDesignDrawer}
        />
      </div>

      <div className="relative z-10 flex min-h-0 w-full flex-1 items-center justify-center overflow-auto p-1 sm:p-3 sm:pb-10">
        <div
          className="light relative flex flex-col h-full max-h-[78vh]  w-full overflow-hidden rounded-lg border border-slate-200/90 bg-white shadow-xl dark:shadow-[0_30px_90px_-20px_rgba(0,0,0,0.9)] transition-[transform,width,box-shadow] duration-300"
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
            className={cn(
              "flex-1 min-h-0 relative overflow-hidden bg-white",
              isWallpaperActive && "group/wallpaper"
            )}
            style={canvasBackgroundStyle}
          >
            {isWallpaperActive && activeCoverImage?.url && (
              <>
                <img
                  src={activeCoverImage.url}
                  alt={activeCoverImage.alt || ""}
                  style={getCoverImageStyle(activeCoverImage)}
                  className="pointer-events-none absolute inset-0 z-0 h-full w-full object-cover transition-[object-position,transform] duration-500 ease-out"
                />
                {hoverBar && (
                  <div className="pointer-events-none absolute top-3 right-3 z-30 flex justify-end opacity-0 transition-opacity duration-200 group-hover/wallpaper:opacity-100">
                    {hoverBar}
                  </div>
                )}
              </>
            )}

            {isSideCoverActive && activeCoverImage ? (
              <div className="relative z-10 flex h-full w-full flex-col sm:flex-row">
                <CoverImageSide
                  coverImage={activeCoverImage}
                  side={activeCoverLayout}
                  hoverActions={hoverBar}
                />
                <div className="flex min-h-0 w-full flex-1 flex-col overflow-y-auto p-2 sm:h-full sm:w-1/2 sm:p-4">
                  {canvasSelectionContent}
                </div>
              </div>
            ) : isBannerActive && activeCoverImage?.url ? (
              <div className="relative z-10 flex h-full w-full flex-col overflow-hidden">
                <div className="group/cover relative h-44 w-full shrink-0 overflow-hidden sm:h-56">
                  <img
                    src={activeCoverImage.url}
                    alt={activeCoverImage.alt || ""}
                    style={getCoverImageStyle(activeCoverImage)}
                    className="h-full w-full object-cover transition-[object-position,transform] duration-500 ease-out"
                  />
                  {hoverBar && (
                    <div className="pointer-events-none absolute top-3 right-3 z-20 flex justify-end opacity-0 transition-opacity duration-200 group-hover/cover:opacity-100">
                      {hoverBar}
                    </div>
                  )}
                </div>
                <div className="min-h-0 flex-1 overflow-y-auto p-2 sm:p-4">
                  {canvasSelectionContent}
                </div>
              </div>
            ) : (
              <div className="relative z-10 h-full w-full overflow-y-auto p-2 sm:p-4">
                {canvasSelectionContent}
              </div>
            )}
          </div>
        </div>
      </div>

      <ImagePickerDialog
        open={coverPickerOpen}
        onOpenChange={setCoverPickerOpen}
        onSelect={(nextImage) =>
          updateActiveCoverImage({
            ...nextImage,
            layout: activeCoverImage?.layout ?? "top",
            mobileLayout: activeCoverImage?.mobileLayout,
          })
        }
      />
      {activeCoverImage?.url && (
        <ImageEditorDialog
          open={coverEditorOpen}
          onOpenChange={setCoverEditorOpen}
          coverImage={activeCoverImage}
          onSave={({ brightness, edits }) =>
            updateActiveCoverImage({
              ...activeCoverImage,
              brightness,
              edits,
            })
          }
        />
      )}

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
