import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  BackgroundVariant,
  Controls,
  ControlButton,
  useReactFlow,
  useNodesState,
  useEdgesState,
  useNodesInitialized,
  MarkerType,
  type Edge,
  type NodeTypes,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { RotateCcw } from "lucide-react";
import { useParams } from "react-router-dom";
import { useFormContext } from "@/features/forms/hooks/useFormContext";
import { useFormSettings } from "@/features/forms/hooks/useFormSettings";
import {
  buildVariableItems,
  type VariableItem,
} from "@/shared/components/pages";
import type { EndPage, FormPage } from "../../shared/types/common";
import { PageNode, type PageNodeData, type PageNodeType } from "./components/PageNode";
import {
  EndPageNode,
  type EndPageNodeData,
  type EndPageNodeType,
} from "./components/EndPageNode";
import { PageRulesDialog } from "./components/PageRulesDialog";

/** Union of every node kind that can appear on the canvas. */
type FlowNode = PageNodeType | EndPageNodeType;

/** Stable id for the (single) shown-on-submit end-page node. */
const END_PAGE_NODE_ID = "end-page-0";

/**
 * Horizontal distance between the left edges of consecutive page nodes.
 * Node width is 240px (see PageNode), so this leaves an 80px gap between cards.
 */
const NODE_STEP_X = 320;

/** Stable id for a page, used for both nodes and edge endpoints. */
function pageId(page: FormPage, index: number): string {
  return page._id ?? page.pageKey ?? `page-${index}`;
}

/**
 * Lay the pages out left-to-right using React Flow's own coordinate system
 * (deterministic x positions), rather than CSS flow. Page 1 → Page 2 → … and,
 * when the form has one, the shown-on-submit end page as the final node.
 *
 * The first node never renders an incoming handle and the last node never
 * renders an outgoing handle, so the flow reads as a bounded start → end chain.
 */
function buildNodes(
  pages: FormPage[],
  endPage: EndPage | null,
  variables: VariableItem[],
): FlowNode[] {
  const nodes: FlowNode[] = pages.map((page, index) => ({
    id: pageId(page, index),
    type: "pageNode",
    position: { x: index * NODE_STEP_X, y: 0 },
    data: {
      index,
      label: page.label,
      helperText: page.helperText,
      type: page.type,
      required: page.required,
      ruleCount: page.logic?.length ?? 0,
      variables,
      hasTarget: index !== 0,
      hasSource: true,
    } satisfies PageNodeData,
  }));

  if (endPage) {
    nodes.push({
      id: END_PAGE_NODE_ID,
      type: "endPageNode",
      position: { x: pages.length * NODE_STEP_X, y: 0 },
      data: {
        title: endPage.title,
        helperText: endPage.helperText || endPage.paragraph,
        variables,
        hasTarget: true,
        hasSource: false,
      } satisfies EndPageNodeData,
    });
  }

  // The first node in the flow has no incoming handle, and the last node has no
  // outgoing handle — so the chain reads as a bounded start → end.
  const first = nodes[0];
  if (first) first.data.hasTarget = false;
  const last = nodes[nodes.length - 1];
  if (last) last.data.hasSource = false;

  return nodes;
}

/** Connect each page to the next so the canvas reads as a linear flow. */
function buildEdges(pages: FormPage[], hasEndPage: boolean): Edge[] {
  const edges: Edge[] = [];
  for (let i = 1; i < pages.length; i++) {
    const source = pageId(pages[i - 1], i - 1);
    const target = pageId(pages[i], i);
    edges.push({ id: `e-${source}-${target}`, source, target });
  }
  if (hasEndPage && pages.length > 0) {
    const source = pageId(pages[pages.length - 1], pages.length - 1);
    edges.push({
      id: `e-${source}-${END_PAGE_NODE_ID}`,
      source,
      target: END_PAGE_NODE_ID,
    });
  }
  return edges;
}

// Defined at module scope so their identities stay stable across renders
// (React Flow warns when nodeTypes / edge options are recreated each render).
const nodeTypes: NodeTypes = { pageNode: PageNode, endPageNode: EndPageNode };

const defaultEdgeOptions = {
  type: "smoothstep",
  markerEnd: {
    type: MarkerType.ArrowClosed,
    width: 16,
    height: 16,
    color: "#94a3b8",
  },
  style: { stroke: "#94a3b8", strokeWidth: 1.5 },
};

/**
 * The interactive canvas. Rendered inside <ReactFlowProvider> so it can call
 * useReactFlow() for the custom Reset control and programmatic fit-to-view.
 */
function LogicFlow() {
  const { form, isLoading, error } = useFormContext();
  const { formId } = useParams();
  const pages = useMemo(() => form?.pages ?? [], [form]);
  const endPage = useMemo<EndPage | null>(
    () => form?.endPages?.[0] ?? null,
    [form],
  );

  // Variables (plus the built-in form_name) highlighted on the node previews —
  // same source the Build tab's editors use.
  const { data: settingsData } = useFormSettings(formId ?? "");
  const variables = useMemo(
    () => buildVariableItems(settingsData?.settings.variables, form?.title),
    [settingsData?.settings.variables, form?.title],
  );

  const [nodes, setNodes, onNodesChange] = useNodesState<FlowNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [selected, setSelected] = useState<{
    page: FormPage;
    index: number;
  } | null>(null);

  const { fitView } = useReactFlow();
  const nodesInitialized = useNodesInitialized();
  const didInitialFit = useRef(false);

  // Build (or rebuild) the graph whenever the form's pages change. Positions
  // are deterministic, so this also serves as the "initial layout".
  useEffect(() => {
    setNodes(buildNodes(pages, endPage, variables));
    setEdges(buildEdges(pages, endPage !== null));
    didInitialFit.current = false;
  }, [pages, endPage, variables, setNodes, setEdges]);

  // Fit the flow into view once the freshly-built nodes have been measured.
  // This is the reliable moment to fit, since node dimensions are known.
  useEffect(() => {
    if (nodesInitialized && nodes.length > 0 && !didInitialFit.current) {
      didInitialFit.current = true;
      fitView({ padding: 0.2 });
    }
  }, [nodesInitialized, nodes.length, fitView]);

  const handleNodeClick = useCallback(
    (
      _event: React.MouseEvent,
      node: { type?: string; data: PageNodeData | EndPageNodeData },
    ) => {
      // Only page nodes open the rules dialog; the end-page node has no rules.
      if (node.type !== "pageNode") return;
      const index = (node.data as PageNodeData).index;
      const page = pages[index];
      if (page) setSelected({ page, index });
    },
    [pages],
  );

  // Reload / Reset — restore the initial horizontal layout and re-fit the view.
  const handleReset = useCallback(() => {
    setNodes(buildNodes(pages, endPage, variables));
    setEdges(buildEdges(pages, endPage !== null));
    setSelected(null);
    // Let React Flow apply the restored positions before fitting.
    window.setTimeout(() => fitView({ padding: 0.2, duration: 300 }), 60);
  }, [pages, endPage, variables, setNodes, setEdges, fitView]);

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[var(--border)] border-t-[var(--primary)]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full w-full items-center justify-center px-8 text-center">
        <p className="text-base text-[var(--editorial-body)]">{error}</p>
      </div>
    );
  }

  return (
    <>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        onNodeClick={handleNodeClick}
        defaultEdgeOptions={defaultEdgeOptions}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.2}
        maxZoom={2}
        zoomOnScroll
        zoomOnPinch
        panOnScroll={false}
        panOnDrag
        zoomOnDoubleClick
        nodesConnectable={false}
        proOptions={{ hideAttribution: false }}
      >
        <Background variant={BackgroundVariant.Dots} gap={22} size={1} />
        <Controls showInteractive={false}>
          <ControlButton
            onClick={handleReset}
            title="Reset layout"
            aria-label="Reset layout"
          >
            <RotateCcw />
          </ControlButton>
        </Controls>
      </ReactFlow>

      {pages.length === 0 && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-8 text-center">
          <div className="flex flex-col items-center gap-2">
            <p className="font-display text-xl text-[var(--foreground)]">
              No pages yet
            </p>
            <p className="text-sm text-[var(--editorial-subtle)]">
              Add pages in the Build tab and they'll appear here as a flow.
            </p>
          </div>
        </div>
      )}

      <PageRulesDialog
        page={selected?.page ?? null}
        pageIndex={selected?.index ?? null}
        onClose={() => setSelected(null)}
      />
    </>
  );
}

/**
 * Logic Builder page.
 *
 * The <FormBuilderTopBar /> is provided by FormLayout (this route is a child of
 * it), which also supplies the form data via FormProvider — matching how every
 * other form sub-page (Build, Settings, Share, …) renders. The div below fills
 * the remaining viewport under the top bar, and React Flow fills the div.
 */
export function LogicBuilderPage() {
  return (
    <div className="editorial relative h-full w-full overflow-hidden bg-[var(--editorial-canvas)]">
      <ReactFlowProvider>
        <LogicFlow />
      </ReactFlowProvider>
    </div>
  );
}
