import { Handle, Position } from "@xyflow/react";
import { HANDLE, type BranchHandleFlags } from "../branchGraph";

/**
 * The subtle anchor points that branch arcs attach to. A card can be the source
 * and/or target of forward arcs (top) and backward arcs (bottom), so up to four
 * handles are possible — but only the ones a node actually uses are rendered,
 * keeping unbranched cards clean. Source/target handles on the same edge are
 * nudged apart horizontally so the arc reads left-to-right (forward) or
 * right-to-left (backward).
 */
export function BranchHandles({ flags }: { flags?: BranchHandleFlags }) {
  if (!flags) return null;

  const cls = "!h-2 !w-2 !border !border-[var(--border)] !bg-[var(--card)]";

  return (
    <>
      {flags.srcTop && (
        <Handle
          id={HANDLE.srcTop}
          type="source"
          position={Position.Top}
          isConnectable={false}
          className={cls}
          style={{ left: "72%" }}
        />
      )}
      {flags.tgtTop && (
        <Handle
          id={HANDLE.tgtTop}
          type="target"
          position={Position.Top}
          isConnectable={false}
          className={cls}
          style={{ left: "28%" }}
        />
      )}
      {flags.srcBottom && (
        <Handle
          id={HANDLE.srcBottom}
          type="source"
          position={Position.Bottom}
          isConnectable={false}
          className={cls}
          style={{ left: "28%" }}
        />
      )}
      {flags.tgtBottom && (
        <Handle
          id={HANDLE.tgtBottom}
          type="target"
          position={Position.Bottom}
          isConnectable={false}
          className={cls}
          style={{ left: "72%" }}
        />
      )}
    </>
  );
}
