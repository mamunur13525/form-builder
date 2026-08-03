import {
  MoreVertical,
  Copy,
  Trash2,
  FileText,
  ChevronDown,
  ChevronUp,
  GripVertical,
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
import type { IItemProps } from "react-movable";

interface SortablePageItemProps {
  /** Props provided by react-movable, spread over the root element. */
  itemProps: Omit<IItemProps, "key">;
  page: FormField;
  index: number;
  pagesCount: number;
  isSelected: boolean;
  /** True while this item follows the pointer (the portaled ghost). */
  isDragged: boolean;
  /** True while this item is lifted via keyboard (space bar). */
  isLifted: boolean;
  onSelect: (index: number) => void;
  onDuplicate: (index: number) => void;
  onDelete: (index: number) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
}


export function SortablePageItem({
  itemProps,
  page,
  index,
  pagesCount,
  isSelected,
  isDragged,
  isLifted,
  onSelect,
  onDuplicate,
  onDelete,
  onMoveUp,
  onMoveDown,
}: SortablePageItemProps) {
  const Icon: LucideIcon =
    FIELD_TYPE_ICONS[page.type as keyof typeof FIELD_TYPE_ICONS] || FileText;

  const colorClass =
    FIELD_TYPE_COLORS[page.type] ||
    "from-gray-500/20 to-gray-600/10 text-gray-600 dark:text-gray-400";

  const isActive = isDragged || isLifted;

  return (
    <div
      {...itemProps}
      onClick={() => onSelect(index)}
      className={`
        group relative flex items-center gap-2 px-3 py-3.5 rounded-md text-sm
        transition-colors duration-200 ease-out cursor-pointer
        ${isSelected
          ? "bg-linear-to-br from-primary/10 to-primary/5 text-primary shadow-sm shadow-primary/5 ring-1 ring-primary/20"
          : "text-muted-foreground hover:bg-accent/50 hover:text-foreground hover:shadow-sm"
        }
        ${isActive ? "bg-background shadow-lg shadow-black/10 ring-1 ring-primary/20" : ""}
      `}
    >
      {/* Drag handle — dragging only starts from here, so clicks still select */}
      <span
        data-movable-handle
        aria-hidden="true"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className={`
          shrink-0 flex items-center justify-center -ml-1.5 w-4 rounded
          transition-opacity duration-150 text-muted-foreground/60
          ${isDragged ? "cursor-grabbing" : "cursor-grab"}
          ${isSelected || isActive ? "opacity-70" : "opacity-0 group-hover:opacity-60"}
        `}
      >
        <GripVertical className="h-4 w-4" />
      </span>

      {/* Field type icon with page number */}
      <div className="shrink-0 flex flex-col items-end gap-0.5">
        <div
          className={`
            w-fit min-w-12 h-7 rounded-md flex items-center justify-center
            bg-linear-to-br transition-colors duration-200 gap-1 relative
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
          <DropdownMenuItem onClick={() => onDuplicate(index)} className="px-2 py-1 gap-1.5">
            <Copy size={12} />
            Duplicate
          </DropdownMenuItem>
          {index !== 0 && (
            <DropdownMenuItem
              onClick={() => onMoveUp(index)}
              disabled={index === 0}
              className="px-2 py-1 gap-1.5"
            >
              <ChevronUp size={12} />
              Move up
            </DropdownMenuItem>
          )}
          {index !== pagesCount - 1 && (
            <DropdownMenuItem
              onClick={() => onMoveDown(index)}
              disabled={index === pagesCount - 1}
              className="px-2 py-1 gap-1.5"
            >
              <ChevronDown size={12} />
              Move down
            </DropdownMenuItem>
          )}

          <DropdownMenuItem
            onClick={() => onDelete(index)}
            variant="destructive"
            className="px-2 py-1 gap-1.5"
          >
            <Trash2 size={12} />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
