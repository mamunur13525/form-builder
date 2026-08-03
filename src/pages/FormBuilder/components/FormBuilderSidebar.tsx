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
  onReorderPages,
  onAddPage,
  onDeletePage,
  onDuplicatePage,
}: FormBuilderSidebarProps) {
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
    <div className="w-full h-full flex flex-col bg-background border rounded-md overflow-hidden">
      <div className="p-3 py-2 border-b flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Pages
        </h3>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 bg-gray-200/80 rounded-md cursor-pointer"
          onClick={onAddPage}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <List
        values={pages}
        onChange={({ oldIndex, newIndex }) => movePage(oldIndex, newIndex)}
        lockVertically
        renderList={({ children, props }) => (
          <div
            {...props}
            className="flex-1 overflow-y-auto overflow-x-hidden p-2 space-y-2"
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
              onSelect={onSelectPage}
              onDuplicate={duplicatePage}
              onDelete={removePage}
              onMoveUp={movePageUp}
              pagesCount={pages.length}
              onMoveDown={movePageDown}
            />
          );
        }}
      />
      <div className="p-3 border-t">
        <Button
          variant="outline"
          className="w-full"
          size="sm"
          onClick={onAddPage}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Page
        </Button>
      </div>
    </div>
  );
}
