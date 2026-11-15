import { useRef, useState } from "react";
import { GripVertical, Type } from "lucide-react";
import {
  PAGE_TYPE_LABELS,
  PAGE_TYPE_VISUALS,
} from "../../../shared/constants/form-types";
import type { FormQuestion } from "../../../shared/types/common";
import { cn } from "@/lib/utils";

interface NestedDragState {
  startIndex: number;
  targetIndex: number;
  startY: number;
  currentY: number;
  itemHeight: number;
  centers: number[];
  isStarted: boolean;
}

interface NestedQuestionListProps {
  questions: FormQuestion[];
  pageIndex: number;
  isSelected: boolean;
  selectedQuestionId?: string | null;
  onSelect: (index: number) => void;
  onSelectQuestion?: (pageIndex: number, questionId: string | null) => void;
  onReorder?: (oldIndex: number, newIndex: number) => void;
}

/** The "Nested Questions" list under a page card, with pointer drag reordering. */
export function NestedQuestionList({
  questions,
  pageIndex,
  isSelected,
  selectedQuestionId,
  onSelect,
  onSelectQuestion,
  onReorder,
}: NestedQuestionListProps) {
  const [dragState, setDragState] = useState<NestedDragState | null>(null);
  const questionItemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const wasQuestionDraggedRef = useRef(false);

  const handleQuestionPointerDown = (e: React.PointerEvent, qIdx: number) => {
    if (e.button !== 0) return;
    if (!onReorder || questions.length <= 1) return;

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
      onReorder?.(dragState.startIndex, dragState.targetIndex);
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

  return (
    <div
      className="mt-2.5 w-full rounded-lg border border-slate-200/80 dark:border-zinc-800/80 bg-slate-50/80 dark:bg-zinc-900/60 p-2 space-y-1.5 shadow-2xs"
      onClick={(e) => {
        e.stopPropagation();
        if (wasQuestionDraggedRef.current) return;
        onSelect(pageIndex);
      }}
    >
      <div className="flex items-center justify-between px-1 text-[10.5px] font-semibold text-slate-500 dark:text-zinc-400">
        <span>Nested Questions</span>
        <span className="rounded-full bg-slate-200/70 dark:bg-zinc-800 px-1.5 py-0.2 text-[10px]">
          {questions.length}
        </span>
      </div>

      <div className="space-y-1.5 relative">
        {questions.map((question, qIdx) => {
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
                onSelect(pageIndex);
                onSelectQuestion?.(pageIndex, qId || null);
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
  );
}
