import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  useViewport,
  useNodesState,
  useEdgesState,
  useNodesInitialized,
  MarkerType,
  type Edge,
  type NodeTypes,
  type EdgeTypes,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  ChevronLeft,
  GitFork,
  Sparkles,
  Minus,
  Plus,
  Maximize2,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useFormContext } from "@/features/forms/hooks/useFormContext";
import { useFormSettings } from "@/features/forms/hooks/useFormSettings";
import { showInfo } from "@/shared/hooks/useToast";
import type { EndPage, FormPage, FormLogicRule } from "../../shared/types/common";
import {
  WelcomeNode,
  type WelcomeNodeData,
  type WelcomeNodeType,
} from "./components/WelcomeNode";
import {
  PageNode,
  type PageNodeData,
  type PageNodeType,
} from "./components/PageNode";
import {
  EndPageNode,
  type EndPageNodeData,
  type EndPageNodeType,
} from "./components/EndPageNode";
import { NextBlockEdge } from "./components/NextBlockEdge";
import { JumpEdge } from "./components/JumpEdge";
import { LogicEditorDialog } from "./components/LogicEditorDialog";
import { countRulesForPage } from "../../shared/utils/formLogic";
import { useLogicRules } from "@/features/forms/hooks/useFormLogic";
import { adaptLogicRule } from "@/features/forms/model/adapters";
import {
  computeBranchLinks,
  END_PAGE_NODE_ID,
  HANDLE,
  pageId,
} from "./branchGraph";

/** Union of every node kind that can appear on the canvas. */
type FlowNode = WelcomeNodeType | PageNodeType | EndPageNodeType;

/** Horizontal step between node cards. */
const NODE_STEP_X = 340;

const flowMarker = {
  type: MarkerType.ArrowClosed,
  width: 14,
  height: 14,
  color: "#8f95a0",
};

const jumpMarker = {
  type: MarkerType.ArrowClosed,
  width: 14,
  height: 14,
  color: "#4b72c4",
};

/**
 * Build nodes and edges for the form flow graph.
 *
 * Places:
 *  1. Welcome node at (0, 0)
 *  2. Each question page horizontally spaced. If an intermediate question is
 *     bypassed by a forward jump to a later question or end page, its y is offset
 *     to -55 to provide clearance for the lower jump curve.
 *  3. "Thank you" (end page) node at the tail.
 */
function buildGraph(
  pages: FormPage[],
  endPage: EndPage | null,
  rules: FormLogicRule[],
  onSelectRule?: (ownerKey: string, ruleId?: string) => void,
): { nodes: FlowNode[]; edges: Edge[] } {
  const links = computeBranchLinks(pages, endPage, rules);

  // --- Nodes -----------------------------------------------------------------
  const nodes: FlowNode[] = [];

  // Track page positions with dynamic slug gap:
  // If a node has multiple logic rules (>= 2 rules), add extra horizontal space (+120px per additional rule)
  // so the branches and badges have generous, uncrowded room.
  let currentX = 0;

  // Welcome node
  nodes.push({
    id: "welcome",
    type: "welcomeNode",
    position: { x: currentX, y: 0 },
    data: {
      title: "Welcome",
      hasSource: true,
    } satisfies WelcomeNodeData,
  });

  currentX += NODE_STEP_X;

  // Question pages
  pages.forEach((page, index) => {
    const id = pageId(page, index);
    const ruleCount = countRulesForPage(rules, page.pageKey);

    nodes.push({
      id,
      type: "pageNode",
      position: {
        x: currentX,
        y: 0,
      },
      data: {
        index,
        label: page.label,
        helperText: page.helperText,
        type: page.type,
        required: page.required,
        ruleCount,
        hasTarget: true,
        hasSource: true,
      } satisfies PageNodeData,
    });

    // If this node has multiple rules, give generous slug gap before the next node
    const extraGap = ruleCount > 1 ? (ruleCount - 1) * 120 : 0;
    currentX += NODE_STEP_X + extraGap;
  });

  // End page ("Thank you")
  nodes.push({
    id: END_PAGE_NODE_ID,
    type: "endPageNode",
    position: { x: currentX, y: 0 },
    data: {
      title: endPage?.title || "Thank you",
      hasTarget: true,
    } satisfies EndPageNodeData,
  });

  // --- Edges -----------------------------------------------------------------
  const edges: Edge[] = [];

  if (pages.length > 0) {
    // Welcome -> First page
    const firstPageId = pageId(pages[0], 0);
    edges.push({
      id: `e-welcome-${firstPageId}`,
      source: "welcome",
      target: firstPageId,
      sourceHandle: HANDLE.out,
      targetHandle: HANDLE.in,
      type: "nextBlock",
      markerEnd: flowMarker,
    });

    // Page i -> Page i+1
    for (let i = 0; i < pages.length - 1; i++) {
      const source = pageId(pages[i], i);
      const target = pageId(pages[i + 1], i + 1);
      edges.push({
        id: `e-${source}-${target}`,
        source,
        target,
        sourceHandle: HANDLE.out,
        targetHandle: HANDLE.in,
        type: "nextBlock",
        markerEnd: flowMarker,
      });
    }

    // Last page -> Thank you
    const lastPageId = pageId(pages[pages.length - 1], pages.length - 1);
    edges.push({
      id: `e-${lastPageId}-${END_PAGE_NODE_ID}`,
      source: lastPageId,
      target: END_PAGE_NODE_ID,
      sourceHandle: HANDLE.out,
      targetHandle: HANDLE.in,
      type: "nextBlock",
      markerEnd: flowMarker,
    });
  } else {
    // Empty form: Welcome -> Thank you
    edges.push({
      id: `e-welcome-${END_PAGE_NODE_ID}`,
      source: "welcome",
      target: END_PAGE_NODE_ID,
      sourceHandle: HANDLE.out,
      targetHandle: HANDLE.in,
      type: "nextBlock",
      markerEnd: flowMarker,
    });
  }

  // Branch arcs (logic jumps)
  const topCountBySource = new Map<string, number>();
  const bottomCountBySource = new Map<string, number>();

  for (const link of links) {
    const isLongJump = Math.abs(link.targetIndex - link.sourceIndex) > 1;
    const side = link.side ?? "bottom";

    let laneIndex: number;
    if (side === "top") {
      laneIndex = topCountBySource.get(link.sourceId) ?? 0;
      topCountBySource.set(link.sourceId, laneIndex + 1);
    } else {
      laneIndex = bottomCountBySource.get(link.sourceId) ?? 0;
      bottomCountBySource.set(link.sourceId, laneIndex + 1);
    }

    edges.push({
      id: link.id,
      source: link.sourceId,
      target: link.targetId,
      sourceHandle: HANDLE.out,
      targetHandle: HANDLE.in,
      type: "jump",
      markerEnd: jumpMarker,
      data: {
        ruleId: link.ruleId,
        ownerKey: link.ownerKey,
        badge: link.badge ?? "2",
        label: link.label,
        jumpIndex: laneIndex,
        side,
        isLongJump,
        ruleRank: link.ruleRank ?? laneIndex,
        onSelect: () => onSelectRule?.(link.ownerKey, link.ruleId),
      },
    });
  }

  return { nodes, edges };
}

const nodeTypes: NodeTypes = {
  welcomeNode: WelcomeNode,
  pageNode: PageNode,
  endPageNode: EndPageNode,
};

const edgeTypes: EdgeTypes = {
  nextBlock: NextBlockEdge,
  jump: JumpEdge,
};

/**
 * Logic builder top bar styled precisely like Image #1.
 */
function LogicTopBar({ onBack }: { onBack: () => void }) {
  const { zoomIn, zoomOut, fitView } = useReactFlow();
  const { zoom } = useViewport();
  const zoomPercent = Math.round(zoom * 100);

  return (
    <header className="relative z-10 flex h-14 w-full shrink-0 items-center justify-between rounded-md border border-[var(--border)] bg-white px-4 select-none dark:border-zinc-800 dark:bg-[#141418] ">
      {/* Left: Editor back and Logic active tab */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-black/5 hover:text-neutral-900 cursor-pointer dark:text-zinc-300 dark:hover:bg-white/5 dark:hover:text-white"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Editor</span>
        </button>

        <div className="mx-0.5 h-4 w-px bg-neutral-300 dark:bg-zinc-700" />

        <div className="flex items-center gap-1.5 rounded-lg border border-[#FF5722]/30 bg-[#FF5722]/10 px-3 py-1.5 text-xs font-semibold text-[#FF5722] shadow-2xs dark:border-[#FF5722]/40 dark:bg-[#FF5722]/15">
          <GitFork className="h-3.5 w-3.5" />
          <span>Logic</span>
        </div>
      </div>

      {/* Center: Instruction hint */}
      <div className="hidden text-xs font-normal text-neutral-500 sm:block md:text-sm dark:text-zinc-400">
        Click a block to add logic, or describe it to the AI below.
      </div>

      {/* Right: Zoom controls and Fit view */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 rounded-lg border border-slate-200/80 bg-slate-100/90 px-2 py-1 text-xs font-medium text-neutral-700 dark:border-zinc-800 dark:bg-zinc-900/80 dark:text-zinc-200">
          <button
            type="button"
            onClick={() => zoomOut({ duration: 200 })}
            className="flex h-5 w-5 cursor-pointer items-center justify-center rounded transition-colors hover:bg-black/10 dark:hover:bg-white/10"
            title="Zoom out"
          >
            <Minus className="h-3 w-3" />
          </button>
          <span className="min-w-[40px] text-center text-xs font-semibold tabular-nums">
            {zoomPercent}%
          </span>
          <button
            type="button"
            onClick={() => zoomIn({ duration: 200 })}
            className="flex h-5 w-5 cursor-pointer items-center justify-center rounded transition-colors hover:bg-black/10 dark:hover:bg-white/10"
            title="Zoom in"
          >
            <Plus className="h-3 w-3" />
          </button>
        </div>

        <button
          type="button"
          onClick={() => fitView({ padding: 0.25, duration: 300 })}
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-slate-200/80 bg-slate-100/90 text-neutral-700 transition-colors hover:bg-slate-200 dark:border-zinc-800 dark:bg-zinc-900/80 dark:text-zinc-200 dark:hover:bg-zinc-800"
          title="Fit view"
        >
          <Maximize2 className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}

/**
 * Interactive Logic Flow Canvas.
 */
function LogicFlow() {
  const { form, isLoading, error } = useFormContext();
  const { formId } = useParams();
  const navigate = useNavigate();

  const pages = useMemo(() => form?.pages ?? [], [form]);
  const endPage = useMemo<EndPage | null>(
    () => form?.endPages?.[0] ?? null,
    [form],
  );

  const { data: settingsData } = useFormSettings(formId ?? "");
  const rawVariables = useMemo(
    () => settingsData?.settings.variables ?? [],
    [settingsData?.settings.variables],
  );

  const { data: logicRules = [] } = useLogicRules(formId ?? "");
  const adaptedRules = useMemo(
    () => logicRules.map(adaptLogicRule),
    [logicRules],
  );

  const [nodes, setNodes, onNodesChange] = useNodesState<FlowNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [selected, setSelected] = useState<{
    page: FormPage;
    index: number;
    initialRuleId?: string;
  } | null>(null);

  const [aiPrompt, setAiPrompt] = useState("");

  const { fitView } = useReactFlow();
  const nodesInitialized = useNodesInitialized();
  const didInitialFit = useRef(false);

  const handleRuleSelect = useCallback(
    (ownerKey: string, ruleId?: string) => {
      const pageIndex = pages.findIndex((p) => p.pageKey === ownerKey);
      if (pageIndex !== -1) {
        setSelected({
          page: pages[pageIndex],
          index: pageIndex,
          initialRuleId: ruleId,
        });
      }
    },
    [pages],
  );

  useEffect(() => {
    const { nodes: nextNodes, edges: nextEdges } = buildGraph(
      pages,
      endPage,
      adaptedRules,
      handleRuleSelect,
    );
    setNodes(nextNodes);
    setEdges(nextEdges);
    didInitialFit.current = false;
  }, [pages, endPage, adaptedRules, handleRuleSelect, setNodes, setEdges]);

  useEffect(() => {
    if (nodesInitialized && nodes.length > 0 && !didInitialFit.current) {
      didInitialFit.current = true;
      window.setTimeout(() => fitView({ padding: 0.25, duration: 250 }), 30);
    }
  }, [nodesInitialized, nodes.length, fitView]);

  const handleNodeClick = useCallback(
    (
      _event: React.MouseEvent,
      node: { type?: string; data: PageNodeData | EndPageNodeData | WelcomeNodeData },
    ) => {
      if (node.type !== "pageNode") return;
      const index = (node.data as PageNodeData).index;
      const page = pages[index];
      if (page) setSelected({ page, index });
    },
    [pages],
  );

  const handleEdgeClick = useCallback(
    (_event: React.MouseEvent, edge: Edge) => {
      const ownerKey = edge.data?.ownerKey as string | undefined;
      const ruleId = edge.data?.ruleId as string | undefined;
      if (ownerKey) {
        handleRuleSelect(ownerKey, ruleId);
      }
    },
    [handleRuleSelect],
  );

  const handleAiSubmit = () => {
    if (!aiPrompt.trim()) return;
    showInfo(
      "AI Logic Builder",
      "AI Logic generation is a PRO feature. Click any question card directly to customize its logic rules.",
    );
    setAiPrompt("");
  };

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-[var(--editorial-canvas)] dark:bg-[#0c0c0f]">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-neutral-300 border-t-[#4b72c4]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-[var(--editorial-canvas)] px-8 text-center dark:bg-[#0c0c0f]">
        <p className="text-base text-neutral-600 dark:text-zinc-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="editorial relative flex gap-5 h-full w-full flex-col overflow-hidden bg-[var(--editorial-canvas)] dark:bg-[#0c0c0f] p-8">
      {/* Top Header matching Image #1 */}
      <LogicTopBar onBack={() => navigate(`/form-builder/${formId}`)} />

      {/* Canvas */}
      <div className="relative flex-1 min-h-0 rounded-md border border-[var(--border)] bg-white px-4 select-none dark:border-zinc-800 dark:bg-[#141418]">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          onNodeClick={handleNodeClick}
          onEdgeClick={handleEdgeClick}
          fitView
          fitViewOptions={{ padding: 0.25 }}
          minZoom={0.2}
          maxZoom={2.5}
          zoomOnScroll
          zoomOnPinch
          panOnScroll={false}
          panOnDrag
          zoomOnDoubleClick
          nodesConnectable={false}
          nodesDraggable={true}
          proOptions={{ hideAttribution: true }}
          className="bg-[var(--editorial-canvas)] dark:bg-[#0c0c0f]"
        />

        {/* Bottom Left Legend */}
        <div className="pointer-events-none absolute bottom-5 left-5 z-10 flex items-center gap-4 rounded-xl border border-neutral-200/80 bg-white/95 px-3.5 py-2 shadow-xs backdrop-blur-xs select-none dark:border-zinc-800 dark:bg-[#18181c]/95">
          <div className="flex items-center gap-2 text-xs font-normal text-neutral-600 dark:text-zinc-400">
            <span className="flex items-center text-[#8f95a0]">
              <span className="h-[2px] w-3.5 bg-[#8f95a0] text-[#8f95a0]" />
              <span className="inline-block border-y-[3px] border-y-transparent border-l-[5px] border-l-[#8f95a0]" />
            </span>
            <span>Next block</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-normal text-neutral-600 dark:text-zinc-400">
            <span className="flex items-center text-[#4b72c4]">
              <span className="h-[2px] w-3.5 bg-[#4b72c4] text-[#4b72c4]" />
              <span className="inline-block border-y-[3px] border-y-transparent border-l-[5px] border-l-[#4b72c4]" />
            </span>
            <span>Jump (logic)</span>
          </div>
        </div>

        {/* Bottom Center AI Logic Prompt Bar */}
        <div className="absolute bottom-6 left-1/2 z-10 flex w-[640px] max-w-[calc(100vw-48px)] -translate-x-1/2 items-center gap-3.5 rounded-full border border-neutral-200/90 bg-white py-2.5 pl-5 pr-3 shadow-[0_6px_30px_rgba(0,0,0,0.08)] dark:border-zinc-800 dark:bg-[#18181c]">
          <Sparkles className="h-5 w-5 shrink-0 text-[#38bdf8]" />
          <input
            type="text"
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAiSubmit()}
            placeholder="Describe your logic, e.g. “students go to the college question”"
            className="min-w-0 flex-1 bg-transparent text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none dark:text-neutral-100"
          />
          <span className="shrink-0 rounded-full bg-black px-2.5 py-1 text-[11px] font-bold tracking-wider text-white uppercase dark:bg-zinc-700">
            PRO
          </span>
          <button
            type="button"
            onClick={handleAiSubmit}
            className="shrink-0 cursor-pointer rounded-full bg-[#ebe8e1] px-5 py-2 text-sm font-medium text-neutral-800 transition-colors hover:bg-[#dfdcd5] dark:bg-zinc-800 dark:text-neutral-200 dark:hover:bg-zinc-700"
          >
            Ask
          </button>
        </div>
      </div>

      {/* Logic Editor Dialog for editing rules */}
      <LogicEditorDialog
        page={selected?.page ?? null}
        initialRuleId={selected?.initialRuleId}
        allPages={pages}
        variables={rawVariables}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}

/**
 * Logic Builder Page.
 */
export function LogicBuilderPage() {
  return (
    <div className="editorial relative h-full w-full overflow-hidden bg-[var(--editorial-canvas)] dark:bg-[#0c0c0f]">
      <ReactFlowProvider>
        <LogicFlow />
      </ReactFlowProvider>
    </div>
  );
}
