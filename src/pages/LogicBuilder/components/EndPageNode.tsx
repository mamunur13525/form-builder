import { memo } from "react";
import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";
import { Check } from "lucide-react";
import { HANDLE } from "../branchGraph";

export interface EndPageNodeData {
  title?: string;
  hasTarget?: boolean;
  [key: string]: unknown;
}

export type EndPageNodeType = Node<EndPageNodeData, "endPageNode">;

function EndPageNodeComponent({ data }: NodeProps<EndPageNodeType>) {
  const hasTarget = data.hasTarget !== false;

  return (
    <div className="group relative flex w-[210px] items-center gap-3.5 rounded-2xl border border-[#ded8cd] bg-[#eae6de] p-3.5 shadow-xs transition-all select-none dark:border-zinc-800 dark:bg-[#202024]">
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

      {/* Icon */}
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#8de4b0] text-[#16442b] shadow-xs dark:bg-[#224c36] dark:text-[#8de4b0]">
        <Check className="h-5 w-5 stroke-[2.5]" />
      </div>

      {/* Title */}
      <span className="truncate text-[17px] font-semibold tracking-tight text-neutral-800 dark:text-neutral-100">
        {data.title || "Thank you"}
      </span>
    </div>
  );
}

export const EndPageNode = memo(EndPageNodeComponent);
