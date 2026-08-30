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
import type { EndPage, FormPage, FormLogicRule, LogicCategory } from "../../shared/types/common";
import { PageNode, type PageNodeData, type PageNodeType } from "./components/PageNode";
import {
  EndPageNode,
  type EndPageNodeData,
  type EndPageNodeType,
} from "./components/EndPageNode";
import { LogicEditorDialog } from "./components/LogicEditorDialog";
import { countRulesForPage } from "../../shared/utils/formLogic";
import { useLogicRules } from "@/features/forms/hooks/useFormLogic";
import { adaptLogicRule } from "@/features/forms/model/adapters";
import {
  branchHandleFlags,
  computeBranchLinks,
  END_PAGE_NODE_ID,
  HANDLE,
  pageId,
  type BranchLink,
} from "./branchGraph";

/** Union of every node kind that can appear on the canvas. */
type FlowNode = PageNodeType | EndPageNodeType;

/**
 * Horizontal distance between the left edges of consecutive page nodes.
 * Node width is 240px (see PageNode), so this leaves an 80px gap between cards.
 */
const NODE_STEP_X = 320;

/*
 * Connector palette — monochrome, to match the strictly grayscale editorial
 * theme. The default page-to-page flow is a light-gray straight line; branch
 * arcs are a darker dashed line (with a small white label) so conditional jumps
 * read as clearly distinct from the linear page order.
 */
const FLOW_COLOR = "#94a3b8";
const BRANCH_COLOR = "#191919";

const flowEdgeStyle = { stroke: FLOW_COLOR, strokeWidth: 1.5 };
const flowMarker = {
  type: MarkerType.ArrowClosed,
  width: 16,
  height: 16,
  color: FLOW_COLOR,
};

const branchEdgeStyle = {
  stroke: BRANCH_COLOR,
  strokeWidth: 1.75,
  strokeDasharray: "6 4",
};
const branchMarker = {
  type: MarkerType.ArrowClosed,
  width: 16,
  height: 16,
  color: BRANCH_COLOR,
};
const branchLabelStyle = { fill: BRANCH_COLOR, fontSize: 11, fontWeight: 600 };
const branchLabelBgStyle = { fill: "#ffffff", stroke: "#e5e5e5" };

/**
 * Build the full canvas graph — nodes plus edges — for a form.
 *
 * Pages lay out left-to-right on a single row (deterministic x, y = 0), so the
 * default page-to-page flow is a straight horizontal chain: Page 1 → Page 2 → …
 * → end page. Branching rules add dashed arcs on top of that chain — forward
 * jumps arc above the row (top handles), backward jumps arc below (bottom
 * handles), each labeled with its trigger. A form with no branching rules is
 * therefore exactly the straight, horizontally-aligned chain.
 *
 * Branch links are static (conditions are not evaluated), so every possible
 * jump is drawn regardless of answers — this is an author's map of the flow.
 */
function buildGraph(
  pages: FormPage[],
  endPage: EndPage | null,
  variables: VariableItem[],
  rules: FormLogicRule[],
): { nodes: FlowNode[]; edges: Edge[] } {
  const links = computeBranchLinks(pages, endPage, rules);
  const flags = branchHandleFlags(links);

  // --- Nodes -----------------------------------------------------------------
  const nodes: FlowNode[] = pages.map((page, index) => {
    const id = pageId(page, index);
    return {
      id,
      type: "pageNode",
      position: { x: index * NODE_STEP_X, y: 0 },
      data: {
        index,
        label: page.label,
        helperText: page.helperText,
        type: page.type,
        required: page.required,
        ruleCount: countRulesForPage(rules, page.pageKey),
        variables,
        hasTarget: index !== 0,
        hasSource: true,
        branch: flags.get(id),
      } satisfies PageNodeData,
    };
  });

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
        branch: flags.get(END_PAGE_NODE_ID),
      } satisfies EndPageNodeData,
    });
  }

  // The first node has no incoming default handle, and the last no outgoing one,
  // so the linear chain reads as a bounded start → end.
  const first = nodes[0];
  if (first) first.data.hasTarget = false;
  const last = nodes[nodes.length - 1];
  if (last) last.data.hasSource = false;

  // --- Edges -----------------------------------------------------------------
  const edges: Edge[] = [];

  // Default flow: straight, light-gray connectors along the row.
  for (let i = 1; i < pages.length; i++) {
    const source = pageId(pages[i - 1], i - 1);
    const target = pageId(pages[i], i);
    edges.push({
      id: `e-${source}-${target}`,
      source,
      target,
      sourceHandle: HANDLE.out,
      targetHandle: HANDLE.in,
      type: "straight",
      style: flowEdgeStyle,
      markerEnd: flowMarker,
    });
  }
  if (endPage && pages.length > 0) {
    const source = pageId(pages[pages.length - 1], pages.length - 1);
    edges.push({
      id: `e-${source}-${END_PAGE_NODE_ID}`,
      source,
      target: END_PAGE_NODE_ID,
      sourceHandle: HANDLE.out,
      targetHandle: HANDLE.in,
      type: "straight",
      style: flowEdgeStyle,
      markerEnd: flowMarker,
    });
  }

  // Branch arcs: one dashed, labeled arc per branching rule.
  for (const link of links) {
    edges.push(buildBranchEdge(link));
  }

  return { nodes, edges };
}

/**
 * One dashed, labeled branch arc for a jump. Forward jumps leave/enter via the
 * top handles (arc above the row); backward jumps via the bottom handles (arc
 * below). The arc's height grows with the jump span so several nested arcs stay
 * separated instead of stacking on the same line.
 */
function buildBranchEdge(link: BranchLink): Edge {
  const forward = link.direction === "forward";
  const span = Math.abs(link.targetIndex - link.sourceIndex);
  const offset = Math.min(34 + (span - 1) * 16, 120);
  return {
    id: link.id,
    // Carried so a click on the arc (or its label) can open the owning rule.
    data: { ruleId: link.ruleId, ownerKey: link.ownerKey },
    source: link.sourceId,
    target: link.targetId,
    sourceHandle: forward ? HANDLE.srcTop : HANDLE.srcBottom,
    targetHandle: forward ? HANDLE.tgtTop : HANDLE.tgtBottom,
    type: "smoothstep",
    pathOptions: { borderRadius: 10, offset },
    label: link.label,
    labelShowBg: true,
    labelBgPadding: [6, 3] as [number, number],
    labelBgBorderRadius: 6,
    labelStyle: branchLabelStyle,
    labelBgStyle: branchLabelBgStyle,
    style: branchEdgeStyle,
    markerEnd: branchMarker,
    // `pathOptions` lives on the smoothstep edge variant, not the generic Edge.
  } as Edge;
}

// Defined at module scope so their identities stay stable across renders
// (React Flow warns when nodeTypes / edge options are recreated each render).
const nodeTypes: NodeTypes = { pageNode: PageNode, endPageNode: EndPageNode };

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
  const rawVariables = useMemo(
    () => settingsData?.settings.variables ?? [],
    [settingsData?.settings.variables],
  );
  const variables = useMemo(
    () => buildVariableItems(rawVariables, form?.title),
    [rawVariables, form?.title],
  );

  // Form-level logic rules — used for per-page rule counts on the canvas and
  // edited from the rules dialog.
  const { data: logicRules = [] } = useLogicRules(formId ?? "");
  const adaptedRules = useMemo(() => logicRules.map(adaptLogicRule), [logicRules]);

  const [nodes, setNodes, onNodesChange] = useNodesState<FlowNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [selected, setSelected] = useState<{
    page: FormPage;
    index: number;
    /** When set, the dialog opens focused on (and highlighting) this rule. */
    focusRuleId?: string;
    /** When set, the dialog opens on this category tab. */
    focusCategory?: LogicCategory;
  } | null>(null);

  const { fitView, getNodes } = useReactFlow();
  const nodesInitialized = useNodesInitialized();
  const didInitialFit = useRef(false);

  /**
   * Pull every node onto one shared horizontal axis.
   *
   * Nodes are laid out top-aligned (y = 0), but cards differ in height, so
   * their left/right connection handles — pinned at 50% of each card — would
   * otherwise sit at different heights and make the default connectors slant.
   * Once the nodes have been measured, re-position each one so all of their
   * vertical centers (and therefore all their in/out handles) land on the same
   * line: the middle of the tallest card. That gives a perfectly straight,
   * horizontal default flow regardless of how tall each page card is.
   */
  const centerNodesVertically = useCallback(() => {
    const rendered = getNodes();
    const maxHeight = rendered.reduce(
      (max, node) => Math.max(max, node.measured?.height ?? 0),
      0,
    );
    if (maxHeight <= 0) return;
    const axis = maxHeight / 2;
    setNodes((current) =>
      current.map((node) => {
        const height =
          rendered.find((n) => n.id === node.id)?.measured?.height ?? 0;
        if (height <= 0) return node;
        const y = axis - height / 2;
        return node.position.y === y
          ? node
          : ({ ...node, position: { ...node.position, y } } as FlowNode);
      }),
    );
  }, [getNodes, setNodes]);

  // Build (or rebuild) the graph whenever the form's pages, variables or logic
  // rules change. Positions are deterministic, so this also serves as the
  // "initial layout".
  useEffect(() => {
    const { nodes: nextNodes, edges: nextEdges } = buildGraph(
      pages,
      endPage,
      variables,
      adaptedRules,
    );
    setNodes(nextNodes);
    setEdges(nextEdges);
    didInitialFit.current = false;
  }, [pages, endPage, variables, adaptedRules, setNodes, setEdges]);

  // Once the freshly-built nodes have been measured, center them on the shared
  // axis (so the default connectors are straight) and fit them into view.
  useEffect(() => {
    if (nodesInitialized && nodes.length > 0 && !didInitialFit.current) {
      didInitialFit.current = true;
      centerNodesVertically();
      // Fit once the re-centered positions have been applied to the store.
      window.setTimeout(() => fitView({ padding: 0.2 }), 0);
    }
  }, [nodesInitialized, nodes.length, centerNodesVertically, fitView]);

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

  // Clicking a branch arc (or its label) opens the rules dialog on that rule:
  // select the page the rule is owned by, switch to the Branching tab, and
  // highlight the rule. Default-flow connectors carry no rule data, so they are
  // ignored.
  const handleEdgeClick = useCallback(
    (_event: React.MouseEvent, edge: Edge) => {
      const data = edge.data as
        | { ruleId?: string; ownerKey?: string }
        | undefined;
      if (!data?.ownerKey) return;
      const index = pages.findIndex((p) => p.pageKey === data.ownerKey);
      if (index < 0) return;
      setSelected({
        page: pages[index],
        index,
        focusRuleId: data.ruleId || undefined,
        focusCategory: "branching",
      });
    },
    [pages],
  );

  // Reload / Reset — restore the initial layout and re-fit the view.
  const handleReset = useCallback(() => {
    const { nodes: nextNodes, edges: nextEdges } = buildGraph(
      pages,
      endPage,
      variables,
      adaptedRules,
    );
    setNodes(nextNodes);
    setEdges(nextEdges);
    setSelected(null);
    // Let React Flow measure the restored nodes, then center them on the shared
    // axis and fit the view to the result.
    window.setTimeout(() => {
      centerNodesVertically();
      window.setTimeout(() => fitView({ padding: 0.2, duration: 300 }), 30);
    }, 60);
  }, [
    pages,
    endPage,
    variables,
    adaptedRules,
    setNodes,
    setEdges,
    centerNodesVertically,
    fitView,
  ]);

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
        onEdgeClick={handleEdgeClick}
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

      <LogicEditorDialog
        page={selected?.page ?? null}
        allPages={pages}
        variables={rawVariables}
        focusRuleId={selected?.focusRuleId ?? null}
        focusCategory={selected?.focusCategory ?? null}
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
