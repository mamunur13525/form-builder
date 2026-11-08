import { memo } from "react";
import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";
import { Type } from "lucide-react";
import type { PageType } from "../../../shared/types/common";
import { PAGE_TYPE_LABELS, PAGE_TYPE_VISUALS } from "../../../shared/constants/form-types";
import { HANDLE } from "../branchGraph";

export interface PageNodeData {
  index: number;
  label: string;
  helperText?: string;
  type: PageType;
  required?: boolean;
  ruleCount?: number;
  hasTarget?: boolean;
  hasSource?: boolean;
  [key: string]: unknown;
}

export type PageNodeType = Node<PageNodeData, "pageNode">;

function PageNodeComponent({ data, selected }: NodeProps<PageNodeType>) {
  const visual = PAGE_TYPE_VISUALS[data.type] ?? {
    icon: Type,
    bgColor: "bg-[#64748b]",
  };
  const Icon = visual.icon;
  const typeLabel = visual.displayName ?? PAGE_TYPE_LABELS[data.type] ?? data.type;
  const hasTarget = data.hasTarget !== false;
  const hasSource = data.hasSource !== false;

  return (
    <div
      aria-current={selected ? "true" : undefined}
      className={`group relative flex min-w-[230px] max-w-[270px] items-center gap-3.5 rounded-2xl border p-3.5 transition-all select-none cursor-pointer ${
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

      {/* Left Icon box */}
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white shadow-xs ${visual.bgColor}`}
      >
        <Icon className="h-5 w-5 stroke-[2]" />
      </div>

      {/* Text block */}
      <div className="flex min-w-0 flex-1 flex-col justify-center text-left">
        <span className="mb-0.5 truncate text-xs font-normal text-neutral-400 dark:text-zinc-500">
          {data.index + 1} · {typeLabel}
        </span>
        <span className="line-clamp-2 text-[15px] font-semibold leading-snug text-neutral-900 dark:text-zinc-100">
          {data.label || "Untitled question"}
        </span>
      </div>

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
