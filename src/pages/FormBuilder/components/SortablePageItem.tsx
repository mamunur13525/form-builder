import { useSortable } from "@dnd-kit/sortable";
import {
  MoreVertical,
  Copy,
  Trash2,
  FileText,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "../../../components/ui/dropdown-menu";
import { FIELD_TYPE_ICONS, FIELD_TYPE_COLORS } from "../../../shared/constants/form-types";
import type { FormField } from "../../../shared/types/common";
import type { LucideIcon } from "lucide-react";

interface SortablePageItemProps {
  page: FormField;
  index: number;
  pagesCount: number;
  isSelected: boolean;
  onSelect: (index: number) => void;
  onDuplicate: (index: number) => void;
  onDelete: (index: number) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
}


export function SortablePageItem({
  page,
  index,
  pagesCount,
  isSelected,
  onSelect,
  onDuplicate,
  onDelete,
  onMoveUp,
  onMoveDown,
}: SortablePageItemProps) {
  const Icon: LucideIcon =
    FIELD_TYPE_ICONS[page.type as keyof typeof FIELD_TYPE_ICONS] || FileText;
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: page.fieldKey });

  const style = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    // Never animate the item being dragged — it must follow the pointer 1:1
    transition: isDragging ? "none" : transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : undefined,
  };

  const colorClass =
    FIELD_TYPE_COLORS[page.type] ||
    "from-gray-500/20 to-gray-600/10 text-gray-600 dark:text-gray-400";

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onSelect(index)}
      className={`
        group relative flex items-center gap-2.5 px-3 py-3.5 rounded-md text-sm
        transition-all duration-200 ease-out cursor-pointer select-none
        ${isSelected
          ? "bg-linear-to-br from-primary/10 to-primary/5 text-primary shadow-sm shadow-primary/5 ring-1 ring-primary/20"
          : "text-muted-foreground hover:bg-accent/50 hover:text-foreground hover:shadow-sm"
        }
        ${isDragging ? "shadow-lg shadow-black/10 scale-[1.02] cursor-grabbing" : ""}
      `}
    >
      {/* Required star indicator */}

      {/* Field type icon with page number below */}
      <div className="shrink-0 flex flex-col items-end gap-0.5">
        <div
          className={`
            w-fit min-w-12 h-7 rounded-md flex items-center justify-center
            bg-linear-to-br transition-all duration-200 gap-1 relative
            ${colorClass}
            ${isSelected ? "ring-1 ring-primary/20" : ""}
          `}
        >
          {page.required && (
            <span className="absolute top-0 -right-1 text-sm leading-none text-red-500 dark:text-red-400 font-bold drop-shadow-sm">
              *
            </span>
          )}
          <Icon className="h-4 w-4" />
          <span
            className={`
            text-xs font-semibold leading-none transition-colors duration-200
            ${isSelected
                ? "text-primary"
                : "text-muted-foreground/70 group-hover:text-muted-foreground"
              }
          `}
          >
            {index + 1}
          </span>
        </div>
      </div>

      {/* Label */}
      <span className="flex-1 truncate min-w-0 text-sm font-normal leading-tight">
        {page.label || (
          <span className="italic opacity-50">...</span>
        )}
      </span>

      {/* Actions dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
          className={`
            shrink-0 flex items-center justify-center w-6 h-6 rounded
            transition-all duration-150
            ${isSelected
              ? "opacity-70 hover:opacity-100 hover:bg-primary/15"
              : "opacity-0 group-hover:opacity-70 hover:opacity-100 hover:bg-accent"
            }
          `}
          aria-label="Page actions"
        >
          <MoreVertical className="h-3 w-3" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" side="right" sideOffset={4}>
          <DropdownMenuItem onClick={() => onDuplicate(index)} className="px-2 py-1 gap-1.5 text-xs">
            <Copy size={12} />
            Duplicate
          </DropdownMenuItem>
          {index !== 0 && (
            <DropdownMenuItem
              onClick={() => onMoveUp(index)}
              disabled={index === 0}
              className="px-2 py-1 gap-1.5 text-xs"
            >
              <ChevronUp size={12} />
              Move up
            </DropdownMenuItem>
          )}
          {index !== pagesCount - 1 && (
            <DropdownMenuItem
              onClick={() => onMoveDown(index)}
              disabled={index === pagesCount - 1}
              className="px-2 py-1 gap-1.5 text-xs"
            >
              <ChevronDown size={12} />
              Move down
            </DropdownMenuItem>
          )}

          <DropdownMenuItem
            onClick={() => onDelete(index)}
            variant="destructive"
            className="px-2 py-1 gap-1.5 text-xs"
          >
            <Trash2 size={12} />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
