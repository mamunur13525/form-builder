import { useState } from "react";
import { Trash2, GripVertical, ChevronUp, ChevronDown } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../../components/ui/popover";
import { Button } from "../../../components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../../../components/ui/tooltip";
import {
  PAGE_TYPE_ICONS,
  PAGE_TYPE_LABELS,
  PAGE_TYPE_COLORS,
} from "../../../shared/constants/form-types";
import type { FormPage } from "../../../shared/types/common";
import type { IItemProps } from "react-movable";

interface SortablePageItemProps {
  /** Props provided by react-movable, spread over the root element. */
  itemProps: Omit<IItemProps, "key">;
  page: FormPage;
  index: number;
  pagesCount: number;
  isSelected: boolean;
  /** True while this item follows the pointer (the portaled ghost). */
  isDragged: boolean;
  /** True while this item is lifted via keyboard (space bar). */
  isLifted: boolean;
  onSelect: (index: number) => void;
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
  onDelete,
  onMoveUp,
  onMoveDown,
}: SortablePageItemProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  const TypeIcon = PAGE_TYPE_ICONS[page.type];
  const typeLabel = PAGE_TYPE_LABELS[page.type];

  const isActive = isDragged || isLifted;
  const isFirst = index === 0;
  const isLast = index === pagesCount - 1;
  const { style: itemStyle, ...restItemProps } = itemProps;

  // CRITICAL FIX FOR DRAG LAG:
  // react-movable sets inline `transform: translate3d(...)` on every mousemove.
  // If `editorial-transition` (or any CSS transition rule) is active on `transform`,
  // the browser animates every single pixel movement over 250ms, causing massive drag lag.
  // Disabling CSS transitions during drag guarantees 1:1 real-time 60-120fps tracking.
  const combinedStyle: React.CSSProperties = {
    ...itemStyle,
    willChange: isDragged ? "transform" : undefined,
    zIndex: isDragged ? 9999 : undefined,
    transition: isDragged ? "none" : itemStyle?.transition,
  };

  // Shared styling for the small square action buttons on the right.
  const actionBtn =
    "editorial-transition flex h-7 w-7 items-center justify-center rounded-md text-[var(--editorial-subtle)] hover:bg-[var(--card)] hover:text-[var(--foreground)] disabled:pointer-events-none disabled:opacity-30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]";

  return (
    <div
      {...restItemProps}
      style={combinedStyle}
      onClick={() => onSelect(index)}
      aria-current={isSelected ? "true" : undefined}
      className={`
        editorial group relative flex flex-col gap-3 rounded-xl border px-4 py-3.5
        cursor-pointer select-none
        ${!isDragged ? "editorial-transition" : ""}
        ${isSelected
          ? "border-green-900/50 bg-green-700/5! shadow-[0_1px_2px_rgba(0,0,0,0.06)]"
          : "border-[var(--border)] bg-[var(--secondary)] hover:border-[var(--editorial-primary-ring)] hover:shadow-[0_2px_8px_rgba(0,0,0,0.05)]"
        }
        ${isDragged ? "border-[var(--primary)] bg-[var(--card)] shadow-[0_20px_50px_rgba(0,0,0,0.14)] scale-[1.02] cursor-grabbing" : ""}
        ${isLifted && !isDragged ? "border-[var(--primary)] bg-[var(--card)] shadow-[0_12px_40px_rgba(0,0,0,0.08)]" : ""}
      `}
    >
      {/* Numbered page label — wraps to two lines, then truncates. */}
      <p className="line-clamp-2 text-sm leading-snug text-[var(--foreground)]">
        <span className="text-[var(--editorial-body)]">{index + 1}.</span>{" "}
        {page.label || (
          <span className="italic text-[var(--editorial-disabled)]">
            Untitled page
          </span>
        )}
        {page.required && (
          <span
            aria-label="Required"
            className="ml-0.5 font-semibold text-[var(--destructive)]"
          >
            *
          </span>
        )}
      </p>

      {/* Action row — type badge + drag handle on the left, delete/move on the right. */}
      <div className="flex items-center justify-between gap-2">
        {/* Left: page-type badge + drag handle */}
        <div className="flex min-w-0 items-center gap-1.5">
          <span className={`inline-flex min-w-0 items-center gap-1 rounded-md border border-[var(--editorial-border-light)] bg-gradient-to-br ${PAGE_TYPE_COLORS[page.type]} px-1.5 py-0.5 text-[11px] font-medium`}>
            <TypeIcon className="h-3 w-3 shrink-0" />
            <span className="truncate">{typeLabel}</span>
          </span>

          {/* Drag handle — dragging only starts from here, so clicks still select. */}
          <Tooltip>
            <TooltipTrigger
              render={
                <span
                  data-movable-handle
                  aria-hidden="true"
                  tabIndex={-1}
                  onClick={(e) => e.stopPropagation()}
                  className={`
              editorial-transition flex h-7 w-7 shrink-0 items-center justify-center rounded-md
              text-[var(--editorial-subtle)] hover:bg-[var(--card)] hover:text-[var(--foreground)]
              touch-none select-none
              ${isActive ? "cursor-grabbing" : "cursor-grab"}
            `}
                >
                  <GripVertical className="h-[18px] w-[18px]" />
                </span>
              }
            />
            <TooltipContent>Drag to reorder</TooltipContent>
          </Tooltip>
        </div>

        {/* Right: delete (with confirm) + move up + move down */}
        <div className="flex shrink-0 items-center gap-0.5">
          <Popover open={confirmOpen} onOpenChange={setConfirmOpen}>
            <Tooltip>
              <TooltipTrigger
                render={
                  <PopoverTrigger
                    type="button"
                    aria-label="Delete page"
                    onClick={(e) => e.stopPropagation()}
                    className={`${actionBtn} hover:bg-[var(--destructive)]/10 hover:text-[var(--destructive)] data-[popup-open]:bg-[var(--destructive)]/10 data-[popup-open]:text-[var(--destructive)]`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </PopoverTrigger>
                }
              />
              <TooltipContent>Delete</TooltipContent>
            </Tooltip>
            <PopoverContent
              side="top"
              align="end"
              sideOffset={8}
              onClick={(e) => e.stopPropagation()}
              className="editorial w-64 gap-3 rounded-2xl p-4"
            >
              <div className="flex flex-col gap-1">
                <p className="text-sm font-semibold text-[var(--foreground)]">
                  Delete this page?
                </p>
                <p className="text-[13px] leading-snug text-[var(--muted-foreground)]">
                  This can't be undone.
                </p>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setConfirmOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    setConfirmOpen(false);
                    onDelete(index);
                  }}
                >
                  Delete
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          <Tooltip>
            <TooltipTrigger
              render={
                <button
                  type="button"
                  aria-label="Move page up"
                  disabled={isFirst}
                  onClick={(e) => {
                    e.stopPropagation();
                    onMoveUp(index);
                  }}
                  className={actionBtn}
                >
                  <ChevronUp className="h-4 w-4" />
                </button>
              }
            />
            <TooltipContent>Move up</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger
              render={
                <button
                  type="button"
                  aria-label="Move page down"
                  disabled={isLast}
                  onClick={(e) => {
                    e.stopPropagation();
                    onMoveDown(index);
                  }}
                  className={actionBtn}
                >
                  <ChevronDown className="h-4 w-4" />
                </button>
              }
            />
            <TooltipContent>Move down</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </div>
  );
}
