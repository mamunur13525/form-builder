import { useCallback } from "react";
import { Plus } from "lucide-react";
import { List } from "react-movable";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "../../../components/ui/resizable";
import { SortablePageItem } from "./SortablePageItem";
import { EndPageList } from "./EndPage/EndPageList";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../../../components/ui/tooltip";
import type { FormPage, EndPage } from "../../../shared/types/common";
import { showWarning } from "@/shared/hooks/useToast";

interface FormBuilderSidebarProps {
  pages: FormPage[];
  selectedPageIndex: number;
  /** True when the active builder selection is a page (not an end page). */
  isPageSelected: boolean;
  onSelectPage: (index: number) => void;
  /**
   * Called when a page is opened by tapping it (not when selection follows a
   * reorder), so a drawer host can close itself.
   */
  onPageOpened?: () => void;
  /** Applies a reordered page list and persists the new order. */
  onReorderPages: (pages: FormPage[]) => void;
  onAddPage: () => void;
  onDeletePage: (index: number) => void;
  /** Retained for API compatibility; duplicate is no longer surfaced here. */
  onDuplicatePage: (index: number) => void;

  // --- End pages (bottom section) ---
  endPages: EndPage[];
  selectedEndPageIndex: number;
  /** True when the active builder selection is an end page. */
  isEndPageSelected: boolean;
  onSelectEndPage: (index: number) => void;
  onAddEndPage: () => void;
  onDeleteEndPage: (index: number) => void;
  /** Moves an end page to the top so it becomes the one shown on submit. */
  onReorderEndPageToFirst: (index: number) => void;
  /** True while a new end page is being created on the backend. */
  isAddingEndPage?: boolean;
}

export function FormBuilderSidebar({
  pages,
  selectedPageIndex,
  isPageSelected,
  onSelectPage,
  onPageOpened,
  onReorderPages,
  onAddPage,
  onDeletePage,
  onDuplicatePage,
  endPages,
  selectedEndPageIndex,
  isEndPageSelected,
  onSelectEndPage,
  onAddEndPage,
  onDeleteEndPage,
  onReorderEndPageToFirst,
  isAddingEndPage,
}: FormBuilderSidebarProps) {
  const selectPage = useCallback(
    (index: number) => {
      onSelectPage(index);
      onPageOpened?.();
    },
    [onSelectPage, onPageOpened],
  );

  const removePage = useCallback(
    async (index: number) => {
      if (pages.length <= 1) {
        showWarning("You can't delete the last page!");
        return;
      }
      await onDeletePage(index);
    },
    [onDeletePage, pages.length],
  );

  const movePage = useCallback(
    (from: number, to: number) => {
      if (to < 0 || to >= pages.length || from === to) return;
      const updated = [...pages];
      const [moved] = updated.splice(from, 1);
      updated.splice(to, 0, moved);
      const reordered = updated.map((page, idx) => ({
        ...page,
        order: idx + 1,
      }));
      onReorderPages(reordered);

      // Keep the moved page selected after the reorder settles.
      onSelectPage(to);
    },
    [pages, onReorderPages, onSelectPage],
  );

  const movePageUp = useCallback(
    (index: number) => movePage(index, index - 1),
    [movePage],
  );

  const movePageDown = useCallback(
    (index: number) => movePage(index, index + 1),
    [movePage],
  );

  return (
    <div className="flex h-full w-full flex-col overflow-hidden border-r border-slate-200/90 dark:border-zinc-800/90 bg-white dark:bg-[#141418] text-slate-800 dark:text-zinc-100">
      <ResizablePanelGroup orientation="vertical" className="h-full w-full">
        {/* Top: pages */}
        <ResizablePanel defaultSize={340} minSize={160}>
          <div className="flex h-full w-full flex-col overflow-hidden">
            {/* Header — "Pages" with a count and an add button */}
            <div className="flex items-center justify-between gap-2 px-5 py-4 border-b border-slate-200/80 dark:border-zinc-800/80 bg-white dark:bg-[#141418]">
              <div className="flex items-center gap-2">
                <span className="text-base font-semibold text-slate-900 dark:text-white tracking-tight">Pages</span>
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-slate-100 dark:bg-zinc-800 px-2 text-xs font-semibold text-slate-600 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700/50">
                  {pages.length}
                </span>
              </div>

              <Tooltip>
                <TooltipTrigger
                  render={
                    <button
                      type="button"
                      onClick={onAddPage}
                      aria-label="Add page"
                      className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 dark:border-zinc-700/80 bg-slate-100 dark:bg-zinc-800/90 text-slate-600 dark:text-zinc-300 hover:text-white hover:border-[#FF5722] hover:bg-[#FF5722] transition-all shadow-xs cursor-pointer active:scale-95"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  }
                />
                <TooltipContent>Add page</TooltipContent>
              </Tooltip>
            </div>

            <List
              values={pages}
              onChange={({ oldIndex, newIndex }) => movePage(oldIndex, newIndex)}
              transitionDuration={150}
              lockVertically
              renderList={({ children, props }) => (
                <div
                  {...props}
                  className="flex-1 space-y-2.5 overflow-y-auto overflow-x-hidden p-3 select-none"
                >
                  {children}
                </div>
              )}
              renderItem={({ value, index = 0, props, isDragged, isSelected }) => {
                const { key, ...itemProps } = props;
                return (
                  <SortablePageItem
                    key={key}
                    itemProps={itemProps}
                    page={value}
                    index={index}
                    pagesCount={pages.length}
                    isSelected={isPageSelected && index === selectedPageIndex}
                    isDragged={isDragged}
                    isLifted={isSelected}
                    onSelect={selectPage}
                    onDelete={removePage}
                    onDuplicate={onDuplicatePage}
                    onMoveUp={movePageUp}
                    onMoveDown={movePageDown}
                  />
                );
              }}
            />
          </div>
        </ResizablePanel>

        {/* Separator line with 4 dots handle */}
        <div className="relative flex items-center justify-center border-y border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-[#111114] h-3">
          <ResizableHandle
            className="absolute inset-0 h-full w-full opacity-0 cursor-row-resize"
          />
          <span className="absolute -top-1 text-slate-400 dark:text-zinc-600 text-xs font-bold select-none pointer-events-none">
            ••••
          </span>
        </div>

        {/* Bottom: end pages */}
        <ResizablePanel defaultSize={240} minSize={150}>
          <EndPageList
            endPages={endPages}
            selectedIndex={selectedEndPageIndex}
            isActiveSelection={isEndPageSelected}
            onSelect={(index) => {
              onSelectEndPage(index);
              onPageOpened?.();
            }}
            onAdd={onAddEndPage}
            onDelete={onDeleteEndPage}
            onReorderToFirst={onReorderEndPageToFirst}
            isAdding={isAddingEndPage}
          />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
