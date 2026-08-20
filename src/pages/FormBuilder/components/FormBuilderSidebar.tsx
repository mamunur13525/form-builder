import { useCallback } from "react";
import { Plus } from "lucide-react";
import { List } from "react-movable";
import { SortablePageItem } from "./SortablePageItem";
import type { FormField } from "../../../shared/types/common";
import { showWarning } from "@/shared/hooks/useToast";

interface FormBuilderSidebarProps {
  pages: FormField[];
  selectedPageIndex: number;
  onSelectPage: (index: number) => void;
  /**
   * Called when a page is opened by tapping it (not when selection follows a
   * reorder), so a drawer host can close itself.
   */
  onPageOpened?: () => void;
  /** Applies a reordered page list and persists the new order. */
  onReorderPages: (pages: FormField[]) => void;
  onAddPage: () => void;
  onDeletePage: (index: number) => void;
  /** Retained for API compatibility; duplicate is no longer surfaced here. */
  onDuplicatePage: (index: number) => void;
}

export function FormBuilderSidebar({
  pages,
  selectedPageIndex,
  onSelectPage,
  onPageOpened,
  onReorderPages,
  onAddPage,
  onDeletePage,
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
    <div className="flex h-full w-full flex-col overflow-hidden border-r border-[var(--border)] bg-[var(--card)]">
      {/* Header — "Pages" with a count and an add button. */}
      <div className="flex items-center justify-between gap-2 px-4 py-4">
        <div className="flex items-center gap-2 text-[var(--foreground)]">
          <span className="text-[15px] font-semibold">Pages</span>
          <span className="rounded-md border border-[var(--border)] bg-[var(--secondary)] px-1.5 py-0.5 text-xs font-medium tabular-nums text-[var(--muted-foreground)]">
            {pages.length}
          </span>
        </div>

        <button
          type="button"
          onClick={onAddPage}
          aria-label="Add page"
          className="editorial-transition flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--editorial-body)] hover:-translate-y-0.5 hover:border-[var(--editorial-primary-ring)] hover:text-[var(--foreground)] active:translate-y-0 active:scale-[.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>

      <List
        values={pages}
        onChange={({ oldIndex, newIndex }) => movePage(oldIndex, newIndex)}
        transitionDuration={150}
        lockVertically
        renderList={({ children, props }) => (
          <div
            {...props}
            className="flex-1 space-y-2.5 overflow-y-auto overflow-x-hidden px-3 pb-4 select-none"
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
              isSelected={index === selectedPageIndex}
              isDragged={isDragged}
              isLifted={isSelected}
              onSelect={selectPage}
              onDelete={removePage}
              onMoveUp={movePageUp}
              onMoveDown={movePageDown}
            />
          );
        }}
      />
    </div>
  );
}
