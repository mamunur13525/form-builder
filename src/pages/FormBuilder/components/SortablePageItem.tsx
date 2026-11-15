import { useRef, useEffect } from "react";
import {
  GripVertical,
  Type,
} from "lucide-react";
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
import { SortablePageItemActions } from "./SortablePageItemActions";
import { NestedQuestionList } from "./NestedQuestionList";

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
  const wasDraggedRef = useRef(false);

  const questionsList = (page.questions && page.questions.length > 0)
    ? page.questions
    : (page.blocks && page.blocks.length > 0 ? page.blocks : []);

  const reorderHandler = onReorderQuestions || onReorderBlocks;

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
      <SortablePageItemActions
        index={index}
        isFirst={isFirst}
        isLast={isLast}
        onDelete={onDelete}
        onDuplicate={onDuplicate}
        onMoveUp={onMoveUp}
        onMoveDown={onMoveDown}
      />
      </div>

      {/* Nested questions under the page card */}
      {questionsList.length > 1 && (
        <NestedQuestionList
          questions={questionsList}
          pageIndex={index}
          isSelected={isSelected}
          selectedQuestionId={selectedQuestionId}
          onSelect={onSelect}
          onSelectQuestion={onSelectQuestion}
          onReorder={reorderHandler}
        />
      )}
    </div>
  );
}
