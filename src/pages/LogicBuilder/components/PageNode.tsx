import { memo } from "react";
import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";
import { PageHelperText, PageLabel, type VariableItem } from "@/shared/components/pages";
import {
  PAGE_TYPE_ICONS,
  PAGE_TYPE_LABELS,
} from "../../../shared/constants/form-types";
import type { PageType } from "../../../shared/types/common";
import { HANDLE, type BranchHandleFlags } from "../branchGraph";
import { BranchHandles } from "./BranchHandles";

/**
 * Data carried by each page node on the Logic Builder canvas. `index` is the
 * zero-based position in the form; the node renders it as a 1-based, zero-padded
 * page number (e.g. index 0 -> "01").
 */
export interface PageNodeData {
  index: number;
  label: string;
  helperText?: string;
  type: PageType;
  required: boolean;
  ruleCount: number;
  /** Form variables — `@tokens` are highlighted with the brand-green chip. */
  variables?: VariableItem[];
  /** Render the incoming (target) handle. Defaults to true. */
  hasTarget?: boolean;
  /** Render the outgoing (source) handle. Defaults to true. */
  hasSource?: boolean;
  /** Which branch-arc anchor handles this node needs (set by the canvas). */
  branch?: BranchHandleFlags;
  [key: string]: unknown;
}

/** The typed React Flow node for a form page. */
export type PageNodeType = Node<PageNodeData, "pageNode">;

/** Cap on the scrollable title/description body, so tall pages stay compact. */
const BODY_MAX_HEIGHT = "max-h-[176px]";

/**
 * A single form page rendered as a React Flow node.
 *
 * The visual language intentionally mirrors
 * `src/pages/FormBuilder/components/PageContentEditor/PageContentEditor.tsx`:
 * the same editorial card treatment with the page's number, title
 * (`PageLabel`) and description (`PageHelperText`) in a capped, scrollable
 * body — with `@variables` highlighted in the brand green — and the page type
 * badge pinned to the bottom-left. Clicking is handled by the canvas via
 * `onNodeClick`, so the node itself stays presentational.
 */
function PageNodeComponent({ data, selected }: NodeProps<PageNodeType>) {
  const TypeIcon = PAGE_TYPE_ICONS[data.type];
  const typeLabel = PAGE_TYPE_LABELS[data.type];
  const pageNumber = String(data.index + 1).padStart(2, "0");

  const handleClass =
    "!h-2.5 !w-2.5 !border-[var(--border)] !bg-[var(--card)]";

  const hasTarget = data.hasTarget !== false;
  const hasSource = data.hasSource !== false;

  return (
    <div
      aria-current={selected ? "true" : undefined}
      className={`
        editorial group relative flex w-[240px] flex-col overflow-hidden rounded-xl border
        editorial-transition cursor-pointer select-none
        ${
          selected
            ? "border-green-900/50 bg-green-700/5! shadow-[0_1px_2px_rgba(0,0,0,0.06)]"
            : "border-[var(--border)] bg-[var(--secondary)] hover:border-[var(--editorial-primary-ring)] hover:shadow-[0_2px_8px_rgba(0,0,0,0.05)]"
        }
      `}
    >
      {/* Incoming connection point (from the previous page). */}
      {hasTarget && (
        <Handle
          id={HANDLE.in}
          type="target"
          position={Position.Left}
          className={handleClass}
          isConnectable={false}
        />
      )}

      {/* Branch-arc anchors (only the ones this node uses). */}
      <BranchHandles flags={data.branch} />

      {/* Capped, scrollable page body: number, title and description. */}
      <div
        className={`flex flex-col gap-2 px-4 pb-3 pt-3.5 ${BODY_MAX_HEIGHT} overflow-y-auto`}
      >
        {/* Page number — the small dark chip used by PageLabel in the editor. */}
        <span className="w-fit rounded bg-gray-900 px-1 text-[10px] font-bold leading-4 text-white select-none">
          {pageNumber}
        </span>

        {/* Title (shared with the page preview editor). */}
        <div className="flex items-start gap-1">
          {data.label ? (
            <PageLabel
              label={data.label}
              fontSizeClass="text-[15px]"
              variables={data.variables}
              highlightVariables
            />
          ) : (
            <span className="text-[15px] font-semibold italic text-[var(--editorial-disabled)]">
              Untitled page
            </span>
          )}
          {data.required && (
            <span
              aria-label="Required"
              className="mt-0.5 font-semibold text-[var(--destructive)]"
            >
              *
            </span>
          )}
        </div>

        {/* Description (shared with the page preview editor; hidden when empty). */}
        <PageHelperText
          helperText={data.helperText}
          fontSizeClass="text-xs"
          variables={data.variables}
          highlightVariables
        />
      </div>

      {/* Footer: page type pinned bottom-left, rule count on the right. */}
      <div className="flex items-center justify-between gap-2 border-t border-[var(--border)] bg-[var(--card)] px-3 py-2">
        <span className="inline-flex min-w-0 items-center gap-1 rounded-md border border-[var(--border)] bg-[var(--secondary)] px-1.5 py-0.5 text-[11px] font-medium text-[var(--editorial-body)]">
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
      {hasSource && (
        <Handle
          id={HANDLE.out}
          type="source"
          position={Position.Right}
          className={handleClass}
          isConnectable={false}
        />
      )}
    </div>
  );
}

export const PageNode = memo(PageNodeComponent);
