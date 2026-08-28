import { memo } from "react";
import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";
import { CheckCircle2 } from "lucide-react";
import { PageHelperText, PageLabel, type VariableItem } from "@/shared/components/pages";

/**
 * Data carried by the end-page node on the Logic Builder canvas. Only the first
 * end page (`endPages[0]`) is shown, since that is the one respondents see on
 * submit.
 */
export interface EndPageNodeData {
  title: string;
  /** Message shown under the title (`helperText`, falling back to `paragraph`). */
  helperText?: string;
  /** Form variables — `@tokens` are highlighted with the brand-green chip. */
  variables?: VariableItem[];
  /** Render the incoming (target) handle. Defaults to true. */
  hasTarget?: boolean;
  /** Render the outgoing (source) handle. Defaults to true. */
  hasSource?: boolean;
  [key: string]: unknown;
}

/** The typed React Flow node for the form's shown-on-submit end page. */
export type EndPageNodeType = Node<EndPageNodeData, "endPageNode">;

/** Cap on the scrollable title/message body, so long end pages stay compact. */
const BODY_MAX_HEIGHT = "max-h-[176px]";

/**
 * The end page rendered as a React Flow node at the tail of the flow. It mirrors
 * the "Shown on submit" treatment from the builder sidebar (green surface +
 * badge) and the page-node layout from `PageNode.tsx` — the same capped body
 * with title (`PageLabel`) and message (`PageHelperText`), `@variables`
 * highlighted in the brand green, and the badge pinned to the bottom-left — so
 * the two surfaces feel like one product.
 */
function EndPageNodeComponent({ data, selected }: NodeProps<EndPageNodeType>) {
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
            ? "border-green-900/50 bg-green-700/10 shadow-[0_1px_2px_rgba(0,0,0,0.06)]"
            : "border-green-900/30 bg-green-700/5 hover:border-green-900/50 hover:shadow-[0_2px_8px_rgba(0,0,0,0.05)]"
        }
      `}
    >
      {/* Incoming connection point (from the last page). */}
      {hasTarget && (
        <Handle
          type="target"
          position={Position.Left}
          className={handleClass}
          isConnectable={false}
        />
      )}

      {/* Capped, scrollable end-page body: title and message. */}
      <div
        className={`flex flex-col gap-2 px-4 pb-3 pt-3.5 ${BODY_MAX_HEIGHT} overflow-y-auto`}
      >
        {/* Title (shared with the page preview editor). */}
        {data.title ? (
          <PageLabel
            label={data.title}
            fontSizeClass="text-[15px]"
            variables={data.variables}
            highlightVariables
          />
        ) : (
          <span className="text-[15px] font-semibold italic text-[var(--editorial-disabled)]">
            Untitled end page
          </span>
        )}

        {/* Message (shared with the page preview editor; hidden when empty). */}
        <PageHelperText
          helperText={data.helperText}
          fontSizeClass="text-xs"
          variables={data.variables}
          highlightVariables
        />
      </div>

      {/* Footer: "Shown on submit" badge pinned bottom-left. */}
      <div className="flex items-center justify-between gap-2 border-t border-green-900/20 bg-green-700/5 px-3 py-2">
        <span className="inline-flex min-w-0 items-center gap-1 rounded-md border border-green-900/30 bg-green-700/10 px-1.5 py-0.5 text-[11px] font-medium text-green-800">
          <CheckCircle2 className="h-3 w-3 shrink-0" />
          <span className="truncate">Shown on submit</span>
        </span>
      </div>

      {/* Outgoing connection point (unused — the end page is the last node). */}
      {hasSource && (
        <Handle
          type="source"
          position={Position.Right}
          className={handleClass}
          isConnectable={false}
        />
      )}
    </div>
  );
}

export const EndPageNode = memo(EndPageNodeComponent);
