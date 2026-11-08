import { memo } from "react";
import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";
import { Smile } from "lucide-react";
import { HANDLE } from "../branchGraph";

export interface WelcomeNodeData {
  title?: string;
  hasSource?: boolean;
  [key: string]: unknown;
}

export type WelcomeNodeType = Node<WelcomeNodeData, "welcomeNode">;

function WelcomeNodeComponent({ data }: NodeProps<WelcomeNodeType>) {
  const hasSource = data.hasSource !== false;

  return (
    <div className="group relative flex w-[210px] items-center gap-3.5 rounded-2xl border border-[#ded8cd] bg-[#eae6de] p-3.5 shadow-xs transition-all select-none dark:border-zinc-800 dark:bg-[#202024]">
      {/* Icon */}
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#c0c5fa] text-[#2d3257] shadow-xs dark:bg-[#3b4172] dark:text-[#c0c5fa]">
        <Smile className="h-5 w-5 stroke-[2]" />
      </div>

      {/* Title */}
      <span className="truncate text-[17px] font-semibold tracking-tight text-neutral-800 dark:text-neutral-100">
        {data.title || "Welcome"}
      </span>

      {/* Outgoing handle */}
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

export const WelcomeNode = memo(WelcomeNodeComponent);
