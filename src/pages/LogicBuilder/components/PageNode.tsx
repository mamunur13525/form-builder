import { memo } from "react";
import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";
import { Type, GitFork, Layers } from "lucide-react";
import type { PageType, FormQuestion } from "../../../shared/types/common";
import { PAGE_TYPE_LABELS, PAGE_TYPE_VISUALS } from "../../../shared/constants/form-types";
import { HANDLE } from "../branchGraph";

export interface PageNodeData {
  index: number;
  pageKey: string;
  title?: string;
  label: string;
  helperText?: string;
  type: PageType;
  required?: boolean;
  ruleCount?: number;
  hasTarget?: boolean;
  hasSource?: boolean;
  questions?: FormQuestion[];
  [key: string]: unknown;
}

export type PageNodeType = Node<PageNodeData, "pageNode">;

function PageNodeComponent({ data, selected }: NodeProps<PageNodeType>) {
  const hasTarget = data.hasTarget !== false;
  const hasSource = data.hasSource !== false;

  const questions =
    data.questions && data.questions.length > 0
      ? data.questions
      : [
          {
            questionKey: data.pageKey,
            type: data.type,
            title: data.label || data.title || "Untitled question",
            description: data.helperText || "",
            required: data.required,
            order: 0,
          },
        ];

  const pageTitle = data.title || data.label || `Page ${data.index + 1}`;
  const isMultiQuestion = questions.length > 1;

  // Visual for the primary page type (or first question's type)
  const primaryType = questions[0]?.type || data.type;
  const visual = PAGE_TYPE_VISUALS[primaryType] ?? {
    icon: Type,
    bgColor: "bg-[#64748b]",
  };
  const Icon = visual.icon;

  return (
    <div
      aria-current={selected ? "true" : undefined}
      className={`group relative flex min-w-[250px] max-w-[290px] flex-col rounded-2xl border p-3.5 transition-all select-none cursor-pointer ${
        selected
          ? "border-[#4b72c4] ring-2 ring-[#4b72c4]/25 shadow-md bg-white dark:bg-[#18181c]"
          : "border-neutral-200/90 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:border-neutral-300 hover:shadow-md dark:border-zinc-800 dark:bg-[#18181c] dark:hover:border-zinc-700"
      }`}
    >
      {/* Target handle */}
      {hasTarget && (
        <Handle
          id={HANDLE.in}
          type="target"
          position={Position.Left}
          className="!h-1 !w-1 !border-none !bg-transparent !opacity-0"
          isConnectable={false}
        />
      )}

      {/* Top row: Page number & Rule badge */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="flex items-center gap-1.5 text-xs font-semibold text-neutral-500 dark:text-zinc-400">
          <Layers className="h-3.5 w-3.5 text-[#FF5722]" />
          <span>Page {data.index + 1}</span>
        </span>

        {data.ruleCount && data.ruleCount > 0 ? (
          <span className="flex items-center gap-1 rounded-full bg-[#FF5722]/10 border border-[#FF5722]/20 px-2 py-0.5 text-[10px] font-semibold text-[#FF5722]">
            <GitFork className="h-2.5 w-2.5" />
            <span>
              {data.ruleCount} {data.ruleCount === 1 ? "rule" : "rules"}
            </span>
          </span>
        ) : null}
      </div>

      {/* Main Page Title */}
      <div className="flex items-start gap-2.5">
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white shadow-xs ${visual.bgColor}`}
        >
          <Icon className="h-4 w-4 stroke-[2]" />
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-center text-left">
          <span className="line-clamp-2 text-sm font-semibold leading-snug text-neutral-900 dark:text-zinc-100">
            {pageTitle}
          </span>
        </div>
      </div>

      {/* Nested Questions list when page has multiple questions */}
      {isMultiQuestion && (
        <div className="mt-3 space-y-1.5 border-t border-slate-100 dark:border-zinc-800/80 pt-2">
          <div className="flex items-center justify-between text-[10.5px] font-semibold text-neutral-400 dark:text-zinc-500 uppercase tracking-wider">
            <span>{questions.length} questions</span>
          </div>
          <div className="space-y-1 max-h-[140px] overflow-y-auto pr-0.5">
            {questions.map((q, qIdx) => {
              const qVisual = PAGE_TYPE_VISUALS[q.type] ?? {
                icon: Type,
                bgColor: "bg-slate-500",
              };
              const QIcon = qVisual.icon;
              const qTitle = q.title || q.label || `Question ${qIdx + 1}`;
              return (
                <div
                  key={q.questionKey || q.blockKey || qIdx}
                  className="flex items-center gap-2 rounded-lg bg-slate-50 dark:bg-zinc-800/60 px-2 py-1 text-left"
                >
                  <div
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded text-white ${qVisual.bgColor}`}
                  >
                    <QIcon className="h-2.5 w-2.5" />
                  </div>
                  <span className="truncate text-xs font-normal text-neutral-700 dark:text-zinc-300">
                    <span className="font-semibold text-neutral-500 dark:text-zinc-400 mr-1">
                      Q{qIdx + 1}
                    </span>
                    {qTitle}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Single question type subtitle when not multi-question */}
      {!isMultiQuestion && (
        <div className="mt-1 text-left">
          <span className="text-[11px] font-normal text-neutral-400 dark:text-zinc-500">
            {PAGE_TYPE_LABELS[primaryType] ?? primaryType}
          </span>
        </div>
      )}

      {/* Source handle */}
      {hasSource && (
        <Handle
          id={HANDLE.out}
          type="source"
          position={Position.Right}
          className="!h-1 !w-1 !border-none !bg-transparent !opacity-0"
          isConnectable={false}
        />
      )}
    </div>
  );
}

export const PageNode = memo(PageNodeComponent);
