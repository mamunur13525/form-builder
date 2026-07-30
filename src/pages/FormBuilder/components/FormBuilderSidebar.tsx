import { useCallback } from "react";
import { Plus } from "lucide-react";
import { Button } from "../../../components/ui/button";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { SortablePageItem } from "./SortablePageItem";
import type { FormField } from "../../../shared/types/common";

interface FormBuilderSidebarProps {
  pages: FormField[];
  selectedPageIndex: number;
  id: string | undefined;
  onSelectPage: (index: number) => void;
  onSetPages: (
    pages: FormField[] | ((prev: FormField[]) => FormField[]),
  ) => void;
  onAddPage: () => void;
  onDeletePage: (index: number) => void;
  onDuplicatePage: (index: number) => void;
  onShowSaveStatus: (status: "saving" | "saved" | "error") => void;
}

// Note: Field deletions and duplications are now handled locally.
// The form will be saved with updated fields array via updateForm.

export function FormBuilderSidebar({
  pages,
  selectedPageIndex,
  id: _id,
  onSelectPage,
  onSetPages,
  onAddPage,
  onDeletePage,
  onDuplicatePage,
  onShowSaveStatus: _onShowSaveStatus,
}: FormBuilderSidebarProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      // Require a small movement before a drag starts,
      // so plain clicks still select the page
      activationConstraint: { distance: 6 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const duplicatePage = useCallback(
    async (index: number) => {
      await onDuplicatePage(index);
    },
    [onDuplicatePage],
  );

  const removePage = useCallback(
    async (index: number) => {
      if (pages.length <= 1) return;
      await onDeletePage(index);
    },
    [onDeletePage, pages.length],
  );

  const movePage = useCallback(
    (from: number, to: number) => {
      if (to < 0 || to >= pages.length) return;
      const updated = [...pages];
      const [moved] = updated.splice(from, 1);
      updated.splice(to, 0, moved);
      const reordered = updated.map((page, idx) => ({
        ...page,
        order: idx + 1,
      }));
      onSetPages(reordered);

      // Select the moved page
      onSelectPage(to);
    },
    [pages, onSetPages, onSelectPage],
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

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (over && active.id !== over.id) {
        const oldIndex = pages.findIndex((p) => p.fieldKey === active.id);
        const newIndex = pages.findIndex((p) => p.fieldKey === over.id);
        if (oldIndex !== -1 && newIndex !== -1) {
          movePage(oldIndex, newIndex);
        }
      }
    },
    [pages, movePage],
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
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-2 space-y-2">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={pages.map((p) => p.fieldKey)}
            strategy={verticalListSortingStrategy}
          >
            {pages.map((page, index) => (
              <SortablePageItem
                key={page.fieldKey}
                page={page}
                index={index}
                isSelected={index === selectedPageIndex}
                onSelect={onSelectPage}
                onDuplicate={duplicatePage}
                onDelete={removePage}
                onMoveUp={movePageUp}
                pagesCount={pages.length}
                onMoveDown={movePageDown}
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>
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
