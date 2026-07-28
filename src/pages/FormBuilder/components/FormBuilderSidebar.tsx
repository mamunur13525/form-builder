import { useCallback } from "react"
import { Plus } from "lucide-react"
import { Button } from "../../../components/ui/button"
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core"
import type { DragEndEvent } from "@dnd-kit/core"
import {
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { SortablePageItem } from "./SortablePageItem"
import type { FormField } from "../../../shared/types/common"

interface FormBuilderSidebarProps {
    pages: FormField[]
    selectedPageIndex: number
    id: string | undefined
    onSelectPage: (index: number) => void
    onSetPages: (pages: FormField[] | ((prev: FormField[]) => FormField[])) => void
    onAddPage: () => void
    onDeletePage: (index: number) => void
    onDuplicatePage: (index: number) => void
    onShowSaveStatus: (status: "saving" | "saved" | "error") => void
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
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )

    const duplicatePage = useCallback(
        async (index: number) => {
            await onDuplicatePage(index)
        },
        [onDuplicatePage]
    )

    const removePage = useCallback(
        async (index: number) => {
            if (pages.length <= 1) return
            await onDeletePage(index)
        },
        [onDeletePage, pages.length]
    )

    const handleDragEnd = useCallback(
        (event: DragEndEvent) => {
            const { active, over } = event
            if (over && active.id !== over.id) {
                const oldIndex = pages.findIndex((p) => p.fieldKey === active.id)
                const newIndex = pages.findIndex((p) => p.fieldKey === over.id)
                if (oldIndex !== -1 && newIndex !== -1) {
                    const updated = [...pages]
                    const [moved] = updated.splice(oldIndex, 1)
                    updated.splice(newIndex, 0, moved)
                    const reordered = updated.map((page, idx) => ({ ...page, order: idx + 1 }))
                    onSetPages(reordered)
                }
            }
        },
        [pages, onSetPages]
    )

    return (
        <div className="w-full h-full flex flex-col bg-background border rounded-xl shadow-sm overflow-hidden">
            <div className="p-3 border-b">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    Pages
                </h3>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
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
    )
}