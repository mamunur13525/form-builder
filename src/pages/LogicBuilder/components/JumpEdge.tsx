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
  const isLongJump = Boolean(data?.isLongJump || dx > 480);

  // Stagger lane depth so multiple jumps on same side don't collide.
  // Adjacent inner jumps use base offset 52px.
  // Long jumps that span over intermediate nodes use base offset 88px to arch comfortably over cards.
  const baseOffset = isLongJump ? 88 : 52;
  const depthOffset = jumpIndex * 26;
  const totalOffset = baseOffset + depthOffset;

  const laneY = isBottom
    ? Math.max(sourceY, targetY) + totalOffset
    : Math.min(sourceY, targetY) - totalOffset;

  let path: string;
  let badgeX: number;
  let badgeY: number;

  if (isForward) {
    const drop = Math.min(48, Math.max(26, dx * 0.12));
    const ease = drop * 0.55;

    if (dx > drop * 2 + 60) {
      // Smooth eased step: the line leaves the handle, glides down into the
      // jump lane, drifts along a gently bowed middle section, then rises back
      // into the target. No hard right angles, so it reads like the default
      // curved connectors while still clearing the cards in between.
      const ax = sourceX + drop;
      const bx = targetX - drop;
      const sag = Math.min(22, Math.max(8, dx * 0.03));
      const midCtrlX = (bx - ax) * 0.34;
      // Match the entry/exit tangents to the bowl's slope so the joins are
      // C1-continuous — otherwise the direction changes abruptly and the line
      // visibly "brakes" where the segments meet.
      const slope = midCtrlX > 0 ? sag / midCtrlX : 0;

      path =
        `M ${sourceX} ${sourceY} ` +
        `C ${sourceX + ease} ${sourceY}, ${ax - ease} ${laneY - ease * slope}, ${ax} ${laneY} ` +
        `C ${ax + midCtrlX} ${laneY + sag}, ${bx - midCtrlX} ${laneY + sag}, ${bx} ${laneY} ` +
        `C ${bx + ease} ${laneY - ease * slope}, ${targetX - ease} ${targetY}, ${targetX} ${targetY}`;

      badgeX = (sourceX + targetX) / 2;
      badgeY = laneY + sag * 0.75;
    } else {
      // Short hop: one flowing curve straight through the lane.
      const controlY = (8 * laneY - sourceY - targetY) / 6;
      const controlX = Math.max(24, dx * 0.32);

      path =
        `M ${sourceX} ${sourceY} ` +
        `C ${sourceX + controlX} ${controlY}, ${targetX - controlX} ${controlY}, ${targetX} ${targetY}`;

      badgeX = (sourceX + targetX) / 2;
      badgeY = laneY;
    }
  } else {
    // Backward jump (e.g. Page 3 -> Page 1). Loop out of the source handle,
    // glide down into the lane, bow gently across it, then rise into the target.
    const drop = 40;
    const sag = Math.min(22, Math.max(8, dx * 0.03));
    const midCtrlX = dx * 0.34;
    // Same C1 tangent matching as the forward hop, just mirrored.
    const slope = midCtrlX > 0 ? sag / midCtrlX : 0;

    path =
      `M ${sourceX} ${sourceY} ` +
      `C ${sourceX + drop} ${sourceY}, ${sourceX + drop} ${laneY - drop * slope}, ${sourceX} ${laneY} ` +
      `C ${sourceX - midCtrlX} ${laneY + sag}, ${targetX + midCtrlX} ${laneY + sag}, ${targetX} ${laneY} ` +
      `C ${targetX - drop} ${laneY - drop * slope}, ${targetX - drop} ${targetY}, ${targetX} ${targetY}`;

    badgeX = (sourceX + targetX) / 2;
    badgeY = laneY + sag * 0.75;
  }

  const labelText = data?.label ? String(data.label) : "Logic jump";

  const handleBadgeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof data?.onSelect === "function") {
      data.onSelect();
    }
  };

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
          onClick={handleBadgeClick}
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${badgeX}px, ${badgeY}px)`,
            pointerEvents: "all",
          }}
          className="group/badge cursor-pointer flex items-center justify-center rounded-full border border-[#b8cef8] bg-[#eef4ff] px-3 py-1 text-xs font-semibold text-[#2d5fc2] shadow-xs select-none dark:border-[#33569c] dark:bg-[#1a294c] dark:text-[#9bc2ff] hover:border-[#4b72c4] hover:bg-[#e4eeff] dark:hover:border-[#608ee8] dark:hover:bg-[#213460] transition-colors"
        >
          <span className="max-w-[200px] truncate tracking-tight font-semibold">
            {labelText}
          </span>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
