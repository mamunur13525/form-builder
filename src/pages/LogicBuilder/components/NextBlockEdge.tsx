import { BaseEdge, getBezierPath, type EdgeProps } from "@xyflow/react";

export function NextBlockEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style,
  markerEnd,
}: EdgeProps) {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    curvature: 0.28,
  });

  return (
    <BaseEdge
      id={id}
      path={edgePath}
      style={{
        stroke: "#8f95a0",
        strokeWidth: 1.75,
        ...style,
      }}
      markerEnd={markerEnd}
    />
  );
}
