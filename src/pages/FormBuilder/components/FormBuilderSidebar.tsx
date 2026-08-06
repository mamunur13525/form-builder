import { useCallback } from "react";
import { Plus } from "lucide-react";
import { Button } from "../../../components/ui/button";
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
  onDuplicatePage,
}: FormBuilderSidebarProps) {
  const selectPage = useCallback(
    (index: number) => {
      onSelectPage(index);
      onPageOpened?.();
    },
    [onSelectPage, onPageOpened],
  );

  const duplicatePage = useCallback(
    async (index: number) => {
      await onDuplicatePage(index);
    },
    [onDuplicatePage],
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

      // Select the moved page
      onSelectPage(to);
    },
    [pages, onReorderPages, onSelectPage],
  );

  const movePageUp = useCallback(
    (index: number) => {
      movePage(index, index - 1);
    },
    [movePage],
  );

  const movePageDown = useCallback(
    (index: number) => {
      movePage(index, index + 1);
    },
    [movePage],
  );

  return (
    <div className="editorial-shadow-md flex h-full w-full flex-col overflow-hidden rounded-[24px] border border-[var(--border)] bg-[var(--card)]">
      <div className="flex items-center justify-between border-b border-[var(--editorial-border-light)] px-6 py-5">
        <h3 className="editorial-eyebrow text-[var(--editorial-subtle)]">
          Pages
        </h3>
        <button
          type="button"
          onClick={onAddPage}
          aria-label="Add page"
          className="editorial-transition flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--secondary)] text-[var(--editorial-body)] hover:-translate-y-0.5 hover:border-[var(--editorial-primary-ring)] hover:bg-[var(--editorial-primary-light)] hover:text-[var(--primary)] active:translate-y-0 active:scale-[.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
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
            className="flex-1 space-y-2 overflow-y-auto overflow-x-hidden px-4 py-4 select-none"
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
              isSelected={index === selectedPageIndex}
              isDragged={isDragged}
              isLifted={isSelected}
              onSelect={selectPage}
              onDuplicate={duplicatePage}
              onDelete={removePage}
              onMoveUp={movePageUp}
              pagesCount={pages.length}
              onMoveDown={movePageDown}
            />
          );
        }}
      />
      <div className="border-t border-[var(--editorial-border-light)] p-4">
        <Button
          variant="outline"
          className="editorial-transition h-[52px] w-full rounded-[16px] border-[var(--border)] bg-[var(--secondary)] text-sm font-medium text-[var(--foreground)] hover:-translate-y-0.5 hover:border-[var(--editorial-primary-ring)] hover:bg-[var(--editorial-primary-light)] hover:text-[var(--foreground)] active:translate-y-0 active:scale-[.98]"
          onClick={onAddPage}
        >
          <Plus className="mr-2 h-5 w-5" />
          Add Page
        </Button>
      </div>
    </div>
  );
}
