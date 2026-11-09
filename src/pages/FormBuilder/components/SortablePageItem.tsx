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
import { cn } from "@/lib/utils"

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
  selectedQuestionId?: string | null;
  onSelectQuestion?: (pageIndex: number, questionId: string | null) => void;
  onReorderQuestions?: (oldIndex: number, newIndex: number) => void;
  onReorderBlocks?: (oldIndex: number, newIndex: number) => void;
}

function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace("#", "");
  if (clean.length !== 6) return hex;
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

interface NestedDragState {
  startIndex: number;
  targetIndex: number;
  startY: number;
  currentY: number;
  itemHeight: number;
  centers: number[];
  isStarted: boolean;
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
  selectedQuestionId,
  onSelectQuestion,
  onReorderQuestions,
  onReorderBlocks,
}: SortablePageItemProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const wasDraggedRef = useRef(false);
  const wasQuestionDraggedRef = useRef(false);
  const [dragState, setDragState] = useState<NestedDragState | null>(null);
  const questionItemRefs = useRef<(HTMLDivElement | null)[]>([]);

  const questionsList = (page.questions && page.questions.length > 0)
    ? page.questions
    : (page.blocks && page.blocks.length > 0 ? page.blocks : []);

  const reorderHandler = onReorderQuestions || onReorderBlocks;

  const handleQuestionPointerDown = (e: React.PointerEvent, qIdx: number) => {
    if (e.button !== 0) return;
    if (!reorderHandler || questionsList.length <= 1) return;

    e.stopPropagation();

    const rects = questionItemRefs.current.map((el) => el?.getBoundingClientRect());
    const currentRect = rects[qIdx];
    if (!currentRect) return;

    const centers = rects.map((r) => (r ? r.top + r.height / 2 : 0));
    const gap = 6;
    const itemHeight = currentRect.height + gap;

    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {
      // Ignore if pointer capture is not supported or already released
    }

    setDragState({
      startIndex: qIdx,
      targetIndex: qIdx,
      startY: e.clientY,
      currentY: e.clientY,
      itemHeight,
      centers,
      isStarted: false,
    });
  };

  const handleQuestionPointerMove = (e: React.PointerEvent) => {
    if (!dragState) return;
    e.stopPropagation();

    const deltaY = e.clientY - dragState.startY;
    const isStarted = dragState.isStarted || Math.abs(deltaY) > 3;

    if (!isStarted) return;
    wasQuestionDraggedRef.current = true;

    const currentCenter = dragState.centers[dragState.startIndex] + deltaY;

    let target = dragState.startIndex;
    for (let i = 0; i < dragState.centers.length; i++) {
      if (i === dragState.startIndex) continue;
      if (i > dragState.startIndex && currentCenter > dragState.centers[i]) {
        target = Math.max(target, i);
      } else if (i < dragState.startIndex && currentCenter < dragState.centers[i]) {
        target = Math.min(target, i);
      }
    }

    setDragState((prev) =>
      prev
        ? {
            ...prev,
            currentY: e.clientY,
            targetIndex: target,
            isStarted: true,
          }
        : null
    );
  };

  const handleQuestionPointerUp = (e: React.PointerEvent) => {
    if (!dragState) return;
    e.stopPropagation();

    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // Ignore if pointer capture already released
    }

    if (dragState.isStarted && dragState.startIndex !== dragState.targetIndex) {
      reorderHandler?.(dragState.startIndex, dragState.targetIndex);
    }

    if (dragState.isStarted) {
      setTimeout(() => {
        wasQuestionDraggedRef.current = false;
      }, 100);
    } else {
      wasQuestionDraggedRef.current = false;
    }

    setDragState(null);
  };

  const handleQuestionPointerCancel = (e: React.PointerEvent) => {
    if (!dragState) return;
    e.stopPropagation();

    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // Ignore if pointer capture already released
    }

    setTimeout(() => {
      wasQuestionDraggedRef.current = false;
    }, 100);
    setDragState(null);
  };

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

  useEffect(() => {
    if (isSelected && selectedQuestionId) {
      const el = document.getElementById(`sidebar-question-${selectedQuestionId}`);
      el?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [isSelected, selectedQuestionId]);

  const visual = PAGE_TYPE_VISUALS[page.type] ?? {
    icon: Type,
    bgColor: "bg-[#64748b]",
  };
  const Icon = visual.icon;
  const typeLabel = visual.displayName ?? PAGE_TYPE_LABELS[page.type] ?? page.type;
  const iconHexColor = visual.bgColor.match(/#[0-9a-fA-F]{6}/)?.[0] ?? "#5da2f6";

  const isFirst = index === 0;
  const isLast = index === pagesCount - 1;
  const { style: itemStyle, ...restItemProps } = itemProps;

  const combinedStyle: React.CSSProperties = {
    ...itemStyle,
    willChange: isDragged ? "transform" : undefined,
    zIndex: isDragged ? 9999 : undefined,
    transition: isDragged ? "none" : itemStyle?.transition,
    // @ts-expect-error CSS custom properties
    "--item-bg": isDragged
      ? hexToRgba(iconHexColor, 0.14)
      : isSelected
      ? hexToRgba(iconHexColor, 0.12)
      : hexToRgba(iconHexColor, 0.06),
    "--item-bg-hover": isDragged
      ? hexToRgba(iconHexColor, 0.14)
      : isSelected
      ? hexToRgba(iconHexColor, 0.14)
      : hexToRgba(iconHexColor, 0.10),
  };

  return (
    <div
      {...restItemProps}
      style={combinedStyle}
      onClick={() => {
        if (isDragged || wasDraggedRef.current) return;
        onSelect(index);
        onSelectQuestion?.(index, null);
      }}
      aria-current={isSelected ? "true" : undefined}
      className={`
        group relative flex flex-col rounded-lg border p-3
        cursor-pointer select-none transition-all
        bg-[var(--item-bg)] hover:bg-[var(--item-bg-hover)]
        ${isSelected
          ? "border-[#D84315]/50 ring-2 ring-[#FF5722]/20 shadow-xs"
          : "border-neutral-200/90 dark:border-zinc-800/90 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:border-neutral-300 dark:hover:border-zinc-700 hover:shadow-xs"
        }
        ${isDragged ? "border-[#D84315] shadow-2xl scale-[1.02] cursor-grabbing z-50" : ""}
        ${isLifted && !isDragged ? "border-[#D84315] shadow-xl" : ""}
      `}
    >
      <div className="flex items-center gap-2.5 w-full">
    
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
          <span
            className="inline-flex shrink-0 items-center justify-center rounded-full px-1.5 py-0.5 text-[10.5px] font-semibold leading-none border"
            style={{
              borderColor: hexToRgba(iconHexColor, 0.45),
              backgroundColor: hexToRgba(iconHexColor, 0.12),
              color: iconHexColor,
            }}
          >
            P{index + 1}
          </span>
          <span className="truncate text-xs font-normal text-neutral-400 dark:text-zinc-500">
            {questionsList.length > 1 ? `${questionsList.length} questions` : typeLabel}
          </span>
        </div>
        <p className="line-clamp-2 text-sm font-semibold leading-snug text-neutral-900 dark:text-zinc-100">
          {page.title || page.label || (
            <span className="font-normal italic text-neutral-400 dark:text-zinc-500">
              Untitled page
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
                className={cn("flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-slate-700 dark:hover:text-zinc-200 transition-colors cursor-pointer ", confirmOpen ? "opacity-100": "opacity-0 group-hover:opacity-100")}
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

      {/* Nested questions under the page card */}
      {questionsList.length > 1 && (
        <div
          className="mt-2.5 w-full rounded-lg border border-slate-200/80 dark:border-zinc-800/80 bg-slate-50/80 dark:bg-zinc-900/60 p-2 space-y-1.5 shadow-2xs"
          onClick={(e) => {
            e.stopPropagation();
            if (wasQuestionDraggedRef.current) return;
            onSelect(index);
          }}
        >
          <div className="flex items-center justify-between px-1 text-[10.5px] font-semibold text-slate-500 dark:text-zinc-400">
            <span>Nested Questions</span>
            <span className="rounded-full bg-slate-200/70 dark:bg-zinc-800 px-1.5 py-0.2 text-[10px]">
              {questionsList.length}
            </span>
          </div>

          <div className="space-y-1.5 relative">
            {questionsList.map((question, qIdx) => {
              const questionVisual = PAGE_TYPE_VISUALS[question.type] ?? {
                icon: Type,
                bgColor: "bg-[#64748b]",
              };
              const QuestionIcon = questionVisual.icon;
              const questionTypeLabel =
                questionVisual.displayName ?? PAGE_TYPE_LABELS[question.type] ?? question.type;
              const questionTitle = question.title || question.label || "";
              const questionKey = question.questionKey || question.blockKey || qIdx;

              let transform = "translateY(0px)";
              let zIndex = 1;
              let isItemDragged = false;
              let transition =
                "transform 220ms cubic-bezier(0.2, 0, 0, 1), box-shadow 200ms ease, border-color 200ms ease";

              if (dragState && dragState.isStarted) {
                if (qIdx === dragState.startIndex) {
                  const deltaY = dragState.currentY - dragState.startY;
                  transform = `translateY(${deltaY}px)`;
                  zIndex = 50;
                  isItemDragged = true;
                  transition = "box-shadow 150ms ease, border-color 150ms ease";
                } else if (dragState.startIndex < dragState.targetIndex) {
                  if (qIdx > dragState.startIndex && qIdx <= dragState.targetIndex) {
                    transform = `translateY(-${dragState.itemHeight}px)`;
                  }
                } else if (dragState.startIndex > dragState.targetIndex) {
                  if (qIdx >= dragState.targetIndex && qIdx < dragState.startIndex) {
                    transform = `translateY(${dragState.itemHeight}px)`;
                  }
                }
              }

              const qId = question.questionKey || question.blockKey;
              const isQuestionSelected = isSelected && Boolean(selectedQuestionId && selectedQuestionId === qId);

              return (
                <div
                  key={questionKey}
                  id={qId ? `sidebar-question-${qId}` : undefined}
                  data-sidebar-question="true"
                  ref={(el) => {
                    questionItemRefs.current[qIdx] = el;
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (wasQuestionDraggedRef.current) return;
                    onSelect(index);
                    onSelectQuestion?.(index, qId || null);
                    if (qId) {
                      const targetEl =
                        document.getElementById(`question-${qId}`) ||
                        document.getElementById(`block-${qId}`);
                      targetEl?.scrollIntoView({ behavior: "smooth", block: "nearest" });
                    }
                  }}
                  style={{
                    transform,
                    zIndex,
                    transition,
                  }}
                  className={cn(
                    "group/questionitem relative flex items-center gap-2 rounded-md border p-2 shadow-2xs select-none cursor-pointer transition-all",
                    isItemDragged
                      ? "shadow-xl border-[#FF5722] bg-white dark:bg-zinc-800 ring-2 ring-[#FF5722]/30 scale-[1.02]"
                      : isQuestionSelected
                        ? "border-[#FF5722] bg-[#FF5722]/10 dark:bg-[#FF5722]/20 ring-2 ring-[#FF5722]/40 shadow-xs"
                        : "bg-white dark:bg-zinc-800/90 border-slate-200/90 dark:border-zinc-700/80 hover:border-[#FF5722]/50 hover:bg-slate-50 dark:hover:bg-zinc-800"
                  )}
                >
                  {/* Drag handle for nested question reordering (6-dot) */}
                  <span
                    aria-hidden="true"
                    tabIndex={-1}
                    title="Drag to reorder question"
                    onPointerDown={(e) => handleQuestionPointerDown(e, qIdx)}
                    onPointerMove={handleQuestionPointerMove}
                    onPointerUp={handleQuestionPointerUp}
                    onPointerCancel={handleQuestionPointerCancel}
                    className="flex h-6 w-5 shrink-0 items-center justify-center -ml-0.5 text-slate-300 dark:text-zinc-600 hover:text-slate-600 dark:hover:text-zinc-300 touch-none select-none cursor-grab active:cursor-grabbing transition-colors"
                  >
                    <GripVertical className="h-3.5 w-3.5" />
                  </span>

                  <div
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded text-white text-xs ${questionVisual.bgColor}`}
                  >
                    <QuestionIcon className="h-3 w-3 stroke-[2]" />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col text-left">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className={cn(
                        "text-[10px] font-bold",
                        isQuestionSelected ? "text-[#FF5722]" : "text-slate-500 dark:text-zinc-400"
                      )}>
                        Q{qIdx + 1}
                      </span>
                      <span className="text-[10.5px] font-medium text-slate-500 dark:text-zinc-400 truncate">
                        {questionTypeLabel}
                      </span>
                    </div>
                    <p className="truncate text-xs font-semibold text-neutral-800 dark:text-zinc-100">
                      {questionTitle || (
                        <span className="font-normal italic text-neutral-400 dark:text-zinc-500">
                          Untitled question
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
