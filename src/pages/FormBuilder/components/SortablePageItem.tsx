import { useState, useRef, useEffect } from "react";
import {
  Trash2,
  GripVertical,
  ChevronUp,
  ChevronDown,
  Copy,
  MoreVertical,
  Type,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../../components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "../../../components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../../../components/ui/tooltip";
import {
  PAGE_TYPE_LABELS,
  PAGE_TYPE_VISUALS,
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
  onDuplicate?: (index: number) => void;
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
  onDuplicate,
  onMoveUp,
  onMoveDown,
}: SortablePageItemProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const wasDraggedRef = useRef(false);

  useEffect(() => {
    if (isDragged) {
      wasDraggedRef.current = true;
    } else if (wasDraggedRef.current) {
      const timer = setTimeout(() => {
        wasDraggedRef.current = false;
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isDragged]);

  const visual = PAGE_TYPE_VISUALS[page.type] ?? {
    icon: Type,
    bgColor: "bg-[#64748b]",
  };
  const Icon = visual.icon;
  const typeLabel = visual.displayName ?? PAGE_TYPE_LABELS[page.type] ?? page.type;

  const isFirst = index === 0;
  const isLast = index === pagesCount - 1;
  const { style: itemStyle, ...restItemProps } = itemProps;

  const combinedStyle: React.CSSProperties = {
    ...itemStyle,
    willChange: isDragged ? "transform" : undefined,
    zIndex: isDragged ? 9999 : undefined,
    transition: isDragged ? "none" : itemStyle?.transition,
  };

  return (
    <div
      {...restItemProps}
      style={combinedStyle}
      onClick={() => {
        if (isDragged || wasDraggedRef.current) return;
        onSelect(index);
      }}
      aria-current={isSelected ? "true" : undefined}
      className={`
        group relative flex items-center gap-2.5 rounded-lg border p-3
        cursor-pointer select-none transition-all
        ${isSelected
          ? "border-[#D84315] bg-white dark:bg-[#18181c] ring-2 ring-[#FF5722]/20 shadow-xs"
          : "border-neutral-200/90 dark:border-zinc-800/90 bg-white dark:bg-[#18181c] shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:border-neutral-300 dark:hover:border-zinc-700 hover:shadow-xs"
        }
        ${isDragged ? "border-[#D84315] bg-white dark:bg-[#18181c] shadow-2xl scale-[1.02] cursor-grabbing z-50" : ""}
        ${isLifted && !isDragged ? "border-[#D84315] bg-white dark:bg-[#18181c] shadow-xl" : ""}
      `}
    >
      {/* 1. Drag handle on far left (left of icon) */}
      <Tooltip>
        <TooltipTrigger
          render={
            <span
              data-movable-handle
              aria-hidden="true"
              tabIndex={-1}
              onClick={(e) => e.stopPropagation()}
              className="flex h-7 w-5 shrink-0 items-center justify-center -ml-0.5 text-slate-300 dark:text-zinc-600 hover:text-slate-600 dark:hover:text-zinc-300 touch-none select-none cursor-grab active:cursor-grabbing transition-colors"
            >
              <GripVertical className="h-4 w-4" />
            </span>
          }
        />
        <TooltipContent>Drag to reorder</TooltipContent>
      </Tooltip>

      {/* 2. Icon box with solid vibrant background */}
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-white shadow-xs ${visual.bgColor}`}
      >
        <Icon className="h-5 w-5 stroke-[2]" />
      </div>

      {/* 3. Text block: Subtitle and Question Title */}
      <div className="flex min-w-0 flex-1 flex-col justify-center text-left">
        <div className="mb-0.5 flex items-center gap-1.5 min-w-0">
          <span className="inline-flex shrink-0 items-center justify-center rounded px-1.5 py-0.5 text-[10.5px] font-semibold leading-none border border-sky-400/60 dark:border-sky-500/50 bg-sky-50/80 dark:bg-sky-500/10 text-sky-600 dark:text-sky-300">
            Q{index + 1}
          </span>
          <span className="truncate text-xs font-normal text-neutral-400 dark:text-zinc-500">
            {typeLabel}
          </span>
        </div>
        <p className="line-clamp-2 text-sm font-semibold leading-snug text-neutral-900 dark:text-zinc-100">
          {page.label || (
            <span className="font-normal italic text-neutral-400 dark:text-zinc-500">
              Untitled question
            </span>
          )}
          {page.required && (
            <span
              aria-label="Required"
              className="ml-0.5 font-bold text-[#FF5722]"
            >
              *
            </span>
          )}
        </p>
      </div>

      {/* 4. Delete icon (hover reveal) + Three dot menu */}
      <div className="flex shrink-0 items-center gap-0.5">
        <Popover open={confirmOpen} onOpenChange={setConfirmOpen}>
          <Tooltip>
            <TooltipTrigger
              render={
                <PopoverTrigger
                  type="button"
                  aria-label="Delete page"
                  onClick={(e) => e.stopPropagation()}
                  className={`flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 dark:text-zinc-400 hover:bg-rose-500/10 hover:text-rose-500 dark:hover:text-rose-400 cursor-pointer transition-opacity duration-200 ${
                    confirmOpen ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                  }`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
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
            className="w-64 gap-3 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#18181c] p-4 shadow-xl dark:shadow-2xl text-slate-800 dark:text-zinc-100"
          >
            <div className="flex flex-col gap-1">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                Delete this page?
              </p>
              <p className="text-xs leading-snug text-slate-500 dark:text-zinc-400">
                This action cannot be undone.
              </p>
            </div>
            <div className="flex justify-end gap-2 mt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setConfirmOpen(false)}
                className="border-slate-200 dark:border-zinc-700 bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700 cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => {
                  setConfirmOpen(false);
                  onDelete(index);
                }}
                className="bg-rose-600 hover:bg-rose-700 text-white cursor-pointer"
              >
                Delete
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button
                type="button"
                onClick={(e) => e.stopPropagation()}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-slate-700 dark:hover:text-zinc-200 transition-colors cursor-pointer"
              >
                <MoreVertical className="h-4 w-4" />
              </button>
            }
          />
          <DropdownMenuContent
            align="end"
            className="w-40 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#18181c] p-1.5 shadow-xl dark:shadow-2xl text-slate-800 dark:text-zinc-200"
          >
            {onDuplicate && (
              <DropdownMenuItem
                className="cursor-pointer rounded-lg text-xs font-medium text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-white"
                onClick={(e) => {
                  e.stopPropagation();
                  onDuplicate(index);
                }}
              >
                <Copy className="h-3.5 w-3.5 mr-2 text-slate-400 dark:text-zinc-400" />
                Duplicate
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              disabled={isFirst}
              className="cursor-pointer rounded-lg text-xs font-medium text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-white disabled:opacity-40"
              onClick={(e) => {
                e.stopPropagation();
                onMoveUp(index);
              }}
            >
              <ChevronUp className="h-3.5 w-3.5 mr-2 text-slate-400 dark:text-zinc-400" />
              Move Up
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={isLast}
              className="cursor-pointer rounded-lg text-xs font-medium text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-white disabled:opacity-40"
              onClick={(e) => {
                e.stopPropagation();
                onMoveDown(index);
              }}
            >
              <ChevronDown className="h-3.5 w-3.5 mr-2 text-slate-400 dark:text-zinc-400" />
              Move Down
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
