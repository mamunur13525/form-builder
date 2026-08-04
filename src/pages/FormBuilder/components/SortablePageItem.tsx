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
import { FIELD_TYPE_ICONS } from "../../../shared/constants/form-types";
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

  const isActive = isDragged || isLifted;

  return (
    <div
      {...itemProps}
      onClick={() => onSelect(index)}
      className={`
        editorial-transition group relative flex items-center gap-3 rounded-[18px] border px-4 py-3.5
        text-sm cursor-pointer
        ${isSelected
          ? "border-[var(--editorial-primary-ring)] bg-[var(--editorial-primary-selected)] text-[var(--foreground)]"
          : "border-transparent text-[var(--editorial-body)] hover:-translate-y-0.5 hover:border-[var(--editorial-border-light)] hover:bg-[var(--secondary)] hover:text-[var(--foreground)]"
        }
        ${isActive ? "border-[var(--editorial-primary-ring)] bg-[var(--card)] shadow-[0_12px_40px_rgba(90,70,50,.06)]" : ""}
      `}
    >
      {/* Drag handle — dragging only starts from here, so clicks still select */}
      <span
        data-movable-handle
        aria-hidden="true"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className={`
          editorial-transition -ml-2 flex w-4 shrink-0 items-center justify-center rounded
          text-[var(--editorial-disabled)]
          ${isDragged ? "cursor-grabbing" : "cursor-grab"}
          ${isSelected || isActive ? "opacity-80" : "opacity-0 group-hover:opacity-100"}
        `}
      >
        <GripVertical className="h-5 w-5" />
      </span>

      {/* Field type icon with page number */}
      <div className="shrink-0 flex flex-col items-end gap-0.5">
        <div
          className={`
            editorial-transition relative flex h-8 w-fit min-w-12 items-center justify-center gap-1
            rounded-[12px] border
            ${isSelected
              ? "border-[var(--editorial-primary-ring)] bg-[var(--card)] text-[var(--primary)]"
              : "border-[var(--editorial-border-light)] bg-[var(--secondary)] text-[var(--editorial-subtle)]"
            }
          `}
        >
          {page.required && (
            <span className="absolute -top-0.5 -right-1 text-sm leading-none font-semibold text-[var(--primary)]">
              *
            </span>
          )}
          <Icon className="h-5 w-5" />
          <span
            className={`
            editorial-transition text-xs font-semibold leading-none
            ${isSelected ? "text-[var(--primary)]" : "text-[var(--editorial-subtle)]"}
          `}
          >
            {index + 1}
          </span>
        </div>
      </div>

      {/* Label */}
      <span className="min-w-0 flex-1 truncate text-sm leading-tight">
        {page.label || (
          <span className="italic text-[var(--editorial-disabled)]">
            Untitled
          </span>
        )}
      </span>

      {/* Actions dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger
          onClick={(e) => e.stopPropagation()}
          className={`
            editorial-transition flex h-7 w-7 shrink-0 items-center justify-center rounded-full
            text-[var(--editorial-subtle)]
            ${isSelected
              ? "opacity-80 hover:bg-[var(--card)] hover:opacity-100"
              : "opacity-0 group-hover:opacity-100 hover:bg-[var(--muted)]"
            }
          `}
          aria-label="Page actions"
        >
          <MoreVertical className="h-4 w-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          side="right"
          sideOffset={8}
          className="editorial rounded-[18px] border-[var(--border)] bg-[var(--popover)] p-2"
        >
          <DropdownMenuItem
            onClick={() => onDuplicate(index)}
            className="gap-2 rounded-[12px] px-3 py-2"
          >
            <Copy size={16} />
            Duplicate
          </DropdownMenuItem>
          {index !== 0 && (
            <DropdownMenuItem
              onClick={() => onMoveUp(index)}
              disabled={index === 0}
              className="gap-2 rounded-[12px] px-3 py-2"
            >
              <ChevronUp size={16} />
              Move up
            </DropdownMenuItem>
          )}
          {index !== pagesCount - 1 && (
            <DropdownMenuItem
              onClick={() => onMoveDown(index)}
              disabled={index === pagesCount - 1}
              className="gap-2 rounded-[12px] px-3 py-2"
            >
              <ChevronDown size={16} />
              Move down
            </DropdownMenuItem>
          )}

          <DropdownMenuItem
            onClick={() => onDelete(index)}
            variant="destructive"
            className="gap-2 rounded-[12px] px-3 py-2"
          >
            <Trash2 size={16} />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
