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
import { FIELD_TYPE_ICONS } from "../../../shared/constants/form-types";
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

// Map field types to subtle accent colors for the icon badge
const FIELD_TYPE_COLORS: Record<string, string> = {
  shortText: "from-blue-500/20 to-blue-600/10 text-blue-600 dark:text-blue-400",
  longText: "from-sky-500/20 to-sky-600/10 text-sky-600 dark:text-sky-400",
  email:
    "from-violet-500/20 to-violet-600/10 text-violet-600 dark:text-violet-400",
  phone:
    "from-emerald-500/20 to-emerald-600/10 text-emerald-600 dark:text-emerald-400",
  number:
    "from-amber-500/20 to-amber-600/10 text-amber-600 dark:text-amber-400",
  date: "from-rose-500/20 to-rose-600/10 text-rose-600 dark:text-rose-400",
  time: "from-cyan-500/20 to-cyan-600/10 text-cyan-600 dark:text-cyan-400",
  radio:
    "from-orange-500/20 to-orange-600/10 text-orange-600 dark:text-orange-400",
  checkbox:
    "from-indigo-500/20 to-indigo-600/10 text-indigo-600 dark:text-indigo-400",
  select: "from-teal-500/20 to-teal-600/10 text-teal-600 dark:text-teal-400",
  multiSelect:
    "from-purple-500/20 to-purple-600/10 text-purple-600 dark:text-purple-400",
  file: "from-pink-500/20 to-pink-600/10 text-pink-600 dark:text-pink-400",
  rating:
    "from-yellow-500/20 to-yellow-600/10 text-yellow-600 dark:text-yellow-400",
  yesNo: "from-green-500/20 to-green-600/10 text-green-600 dark:text-green-400",
  url: "from-slate-500/20 to-slate-600/10 text-slate-600 dark:text-slate-400",
};

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
        group relative flex items-center gap-2.5 px-2 py-1.5 rounded-md text-sm
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
            w-fit min-w-10 h-5 rounded flex items-center justify-center
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
          <Icon className="h-3 w-3" />
          <span
            className={`
            text-[10px] font-semibold leading-none transition-colors duration-200
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
      <span className="flex-1 truncate min-w-0 text-xs font-normal leading-tight">
        {page.label || (
          <span className="italic opacity-50">Untitled {page.type}</span>
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
