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
  // A curved bezier keeps the connection flexible: when two nodes sit at
  // different heights (or get dragged around) the line bends smoothly instead
  // of cutting across the canvas as a rigid straight segment.
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    curvature: 0.32,
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
