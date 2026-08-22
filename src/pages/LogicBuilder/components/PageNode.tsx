import { memo } from "react";
import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";
import {
  PAGE_TYPE_ICONS,
  PAGE_TYPE_LABELS,
} from "../../../shared/constants/form-types";
import type { PageType } from "../../../shared/types/common";

/**
 * Data carried by each page node on the Logic Builder canvas.
 * `index` is the zero-based position in the form; the node renders it as a
 * 1-based, zero-padded page number (e.g. index 0 -> "01").
 */
export interface PageNodeData {
  index: number;
  label: string;
  type: PageType;
  required: boolean;
  ruleCount: number;
  [key: string]: unknown;
}

/** The typed React Flow node for a form page. */
export type PageNodeType = Node<PageNodeData, "pageNode">;

/**
 * A single form page rendered as a React Flow node.
 *
 * The visual language intentionally mirrors
 * `src/pages/FormBuilder/components/SortablePageItem.tsx`: the same editorial
 * card treatment (rounded border, secondary surface, type badge) so the two
 * surfaces feel like one product. Clicking is handled by the canvas via
 * `onNodeClick`, so the node itself stays presentational.
 */
function PageNodeComponent({ data, selected }: NodeProps<PageNodeType>) {
  const TypeIcon = PAGE_TYPE_ICONS[data.type];
  const typeLabel = PAGE_TYPE_LABELS[data.type];
  const pageNumber = String(data.index + 1).padStart(2, "0");

  const handleClass =
    "!h-2.5 !w-2.5 !border-[var(--border)] !bg-[var(--card)]";

  return (
    <div
      aria-current={selected ? "true" : undefined}
      className={`
        editorial group relative flex w-[240px] flex-col gap-3 rounded-xl border px-4 py-3.5
        editorial-transition cursor-pointer select-none
        ${
          selected
            ? "border-green-900/50 bg-green-700/5! shadow-[0_1px_2px_rgba(0,0,0,0.06)]"
            : "border-[var(--border)] bg-[var(--secondary)] hover:border-[var(--editorial-primary-ring)] hover:shadow-[0_2px_8px_rgba(0,0,0,0.05)]"
        }
      `}
    >
      {/* Incoming connection point (from the previous page). */}
      <Handle
        type="target"
        position={Position.Left}
        className={handleClass}
        isConnectable={false}
      />

      {/* Page number + title. */}
      <p className="line-clamp-2 text-sm leading-snug text-[var(--foreground)]">
        <span className="text-xs font-semibold text-[var(--editorial-body)]">
          {pageNumber}.
        </span>{" "}
        {data.label || (
          <span className="italic text-[var(--editorial-disabled)]">
            Untitled page
          </span>
        )}
        {data.required && (
          <span
            aria-label="Required"
            className="ml-0.5 font-semibold text-[var(--destructive)]"
          >
            *
          </span>
        )}
      </p>

      {/* Type badge (icon + label) + optional rule count. */}
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex min-w-0 items-center gap-1 rounded-md border border-[var(--border)] bg-[var(--card)] px-1.5 py-0.5 text-[11px] font-medium text-[var(--editorial-body)]">
          <TypeIcon className="h-3 w-3 shrink-0" />
          <span className="truncate">{typeLabel}</span>
        </span>

        {data.ruleCount > 0 && (
          <span className="shrink-0 rounded-md bg-[var(--editorial-primary-selected)] px-1.5 py-0.5 text-[11px] font-medium text-[var(--primary)]">
            {data.ruleCount} rule{data.ruleCount === 1 ? "" : "s"}
          </span>
        )}
      </div>

      {/* Outgoing connection point (to the next page). */}
      <Handle
        type="source"
        position={Position.Right}
        className={handleClass}
        isConnectable={false}
      />
    </div>
  );
}

export const PageNode = memo(PageNodeComponent);
