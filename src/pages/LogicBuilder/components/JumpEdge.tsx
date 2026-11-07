import { BaseEdge, EdgeLabelRenderer, type EdgeProps } from "@xyflow/react";

export function JumpEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  style,
  markerEnd,
  data,
}: EdgeProps) {
  const jumpIndex = typeof data?.jumpIndex === "number" ? data.jumpIndex : 0;
  // Side: "bottom" (1st, 3rd logic rules) or "top" (2nd, 4th logic rules)
  const isBottom = data?.side === "bottom" || (!data?.side && targetX >= sourceX);

  const dx = Math.abs(targetX - sourceX);
  const isForward = targetX >= sourceX;

  // Stagger lane depth so multiple jumps on same side don't collide
  const depthOffset = Math.floor(jumpIndex / 2) * 26;
  const laneY = isBottom
    ? Math.max(sourceY, targetY) + 56 + depthOffset
    : Math.min(sourceY, targetY) - 58 - depthOffset;

  let path: string;
  let badgeX: number;
  let badgeY: number;

  if (isForward) {
    // Forward jump (e.g. Page 1 -> Page 3, or Page 1 -> Thank you)
    const dx1 = Math.min(40, Math.max(22, dx * 0.12));
    const dx2 = Math.min(40, Math.max(22, dx * 0.12));
    const r = Math.min(32, Math.max(16, (dx - dx1 - dx2) * 0.25));

    const p1X = sourceX + dx1;
    const p1Y = sourceY;

    const p2X = p1X + r;
    const p2Y = laneY;

    const p3X = targetX - dx2 - r;
    const p3Y = laneY;

    const p4X = targetX - dx2;
    const p4Y = targetY;

    if (dx >= 90 && p3X > p2X) {
      path =
        `M ${sourceX} ${sourceY} ` +
        `L ${p1X} ${p1Y} ` +
        `C ${p1X + r * 0.55} ${p1Y}, ${p2X - r * 0.45} ${p2Y}, ${p2X} ${p2Y} ` +
        `L ${p3X} ${p3Y} ` +
        `C ${p3X + r * 0.45} ${p3Y}, ${p4X - r * 0.55} ${p4Y}, ${p4X} ${p4Y} ` +
        `L ${targetX} ${targetY}`;

      badgeX = (p2X + p3X) / 2;
      badgeY = laneY;
    } else {
      path =
        `M ${sourceX} ${sourceY} ` +
        `C ${sourceX + dx * 0.35} ${laneY}, ${targetX - dx * 0.35} ${laneY}, ${targetX} ${targetY}`;
      badgeX = (sourceX + targetX) / 2;
      badgeY = laneY;
    }
  } else {
    // Backward jump (e.g. Page 3 -> Page 1)
    const loopOutX = sourceX + 40;
    const loopInX = targetX - 40;

    path =
      `M ${sourceX} ${sourceY} ` +
      `C ${loopOutX} ${sourceY}, ${loopOutX} ${laneY}, ${sourceX} ${laneY} ` +
      `L ${targetX} ${laneY} ` +
      `C ${loopInX} ${laneY}, ${loopInX} ${targetY}, ${targetX} ${targetY}`;

    // Place badge along the horizontal return section exactly in the middle between source and target
    badgeX = (sourceX + targetX) / 2;
    badgeY = laneY;
  }

  const badgeText = data?.badge ? String(data.badge) : "";
  const labelText = data?.label ? String(data.label) : "";

  return (
    <>
      <BaseEdge
        id={id}
        path={path}
        style={{
          stroke: "#4b72c4",
          strokeWidth: 2,
          ...style,
        }}
        markerEnd={markerEnd}
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${badgeX}px, ${badgeY}px)`,
            pointerEvents: "all",
          }}
          className="group/badge flex items-center gap-1.5 rounded-full border border-[#b8cef8] bg-[#eef4ff] px-2.5 py-0.5 text-xs font-medium text-[#2d5fc2] shadow-xs transition-all hover:scale-105 hover:shadow-md select-none dark:border-[#33569c] dark:bg-[#1a294c] dark:text-[#9bc2ff]"
        >
          {badgeText && (
            <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#d0e1fd] px-1 text-[10px] font-bold text-[#1d4bb0] dark:bg-[#253d73] dark:text-[#b4d2ff]">
              {badgeText}
            </span>
          )}
          <span className="max-w-[160px] truncate font-semibold tracking-tight">
            {labelText || "Logic jump"}
          </span>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
