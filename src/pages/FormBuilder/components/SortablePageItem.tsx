import { useState } from "react";
import {
  Trash2,
  GripVertical,
  ChevronUp,
  ChevronDown,
  Copy,
  MoreVertical,
  FileText,
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
  PAGE_TYPE_ICONS,
  PAGE_TYPE_LABELS,
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

  const TypeIcon = PAGE_TYPE_ICONS[page.type] || FileText;
  const typeLabel = PAGE_TYPE_LABELS[page.type] || "Page";

  const isFirst = index === 0;
  const isLast = index === pagesCount - 1;
  const { style: itemStyle, ...restItemProps } = itemProps;

  const combinedStyle: React.CSSProperties = {
    ...itemStyle,
    willChange: isDragged ? "transform" : undefined,
    zIndex: isDragged ? 9999 : undefined,
    transition: isDragged ? "none" : itemStyle?.transition,
  };

  const actionBtn =
    "flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-slate-800 dark:hover:text-zinc-100 disabled:pointer-events-none disabled:opacity-30 transition-colors";

  return (
    <div
      {...restItemProps}
      style={combinedStyle}
      onClick={() => onSelect(index)}
      aria-current={isSelected ? "true" : undefined}
      className={`
        group relative flex flex-col gap-3 rounded-2xl border p-3.5
        cursor-pointer select-none transition-all
        ${isSelected
          ? "border-2 border-[#FF5722] bg-white dark:bg-[#1e1e24] ring-4 ring-[#FF5722]/15 shadow-md dark:shadow-lg dark:shadow-[#FF5722]/5"
          : "border-slate-200/90 dark:border-zinc-800/80 bg-slate-50/70 dark:bg-[#17171c] hover:border-slate-300 dark:hover:border-zinc-700 hover:bg-white dark:hover:bg-[#1a1a20] hover:shadow-xs"
        }
        ${isDragged ? "border-[#FF5722] bg-white dark:bg-[#1e1e24] shadow-2xl scale-[1.02] cursor-grabbing" : ""}
        ${isLifted && !isDragged ? "border-[#FF5722] bg-white dark:bg-[#1e1e24] shadow-xl" : ""}
      `}
    >
      {/* Top Row: File icon + Numbered page title + MoreVertical menu */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <FileText className="h-4 w-4 text-slate-400 dark:text-zinc-400 shrink-0" />
          <p className="truncate text-sm font-semibold text-slate-800 dark:text-zinc-100">
            <span className="text-slate-400 dark:text-zinc-400 font-normal">{index + 1}.</span>{" "}
            {page.label || (
              <span className="font-normal italic text-slate-400 dark:text-zinc-500">
                {typeLabel}
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

        {/* Top-right menu */}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button
                type="button"
                onClick={(e) => e.stopPropagation()}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-slate-700 dark:hover:text-zinc-200 transition-colors"
              >
                <MoreVertical className="h-4 w-4" />
              </button>
            }
          />
          <DropdownMenuContent align="end" className="w-40 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#18181c] p-1.5 shadow-xl dark:shadow-2xl text-slate-800 dark:text-zinc-200">
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
            <DropdownMenuItem
              className="cursor-pointer rounded-lg text-xs font-medium text-rose-500 hover:bg-rose-500/10 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-300"
              onClick={(e) => {
                e.stopPropagation();
                setConfirmOpen(true);
              }}
            >
              <Trash2 className="h-3.5 w-3.5 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Bottom Row: Type badge on left, Duplicate / Delete / Grip on right */}
      <div className="flex items-center justify-between gap-2 pt-0.5">
        {/* Left: type badge */}
        <span
          className={`inline-flex min-w-0 items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors ${
            isSelected
              ? "border-[#FF5722]/40 bg-[#FF5722]/10 text-[#FF5722]"
              : "border-slate-200 dark:border-zinc-800 bg-slate-100 dark:bg-zinc-900/80 text-slate-600 dark:text-zinc-400"
          }`}
        >
          <TypeIcon className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{typeLabel}</span>
        </span>

        {/* Right: Quick actions */}
        <div className="flex shrink-0 items-center gap-1">
          {onDuplicate && (
            <Tooltip>
              <TooltipTrigger
                render={
                  <button
                    type="button"
                    aria-label="Duplicate page"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDuplicate(index);
                    }}
                    className={actionBtn}
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                }
              />
              <TooltipContent>Duplicate</TooltipContent>
            </Tooltip>
          )}

          <Popover open={confirmOpen} onOpenChange={setConfirmOpen}>
            <Tooltip>
              <TooltipTrigger
                render={
                  <PopoverTrigger
                    type="button"
                    aria-label="Delete page"
                    onClick={(e) => e.stopPropagation()}
                    className={`${actionBtn} hover:bg-rose-500/10 hover:text-rose-400`}
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
              className="w-64 gap-3 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#18181c] p-4 shadow-xl dark:shadow-2xl text-slate-800 dark:text-zinc-100"
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
                  className="border-slate-200 dark:border-zinc-700 bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700"
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
                  className="bg-rose-600 hover:bg-rose-700 text-white"
                >
                  Delete
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          {/* Drag handle */}
          <Tooltip>
            <TooltipTrigger
              render={
                <span
                  data-movable-handle
                  aria-hidden="true"
                  tabIndex={-1}
                  onClick={(e) => e.stopPropagation()}
                  className={`${actionBtn} touch-none select-none cursor-grab active:cursor-grabbing`}
                >
                  <GripVertical className="h-4 w-4" />
                </span>
              }
            />
            <TooltipContent>Drag to reorder</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </div>
  );
}
