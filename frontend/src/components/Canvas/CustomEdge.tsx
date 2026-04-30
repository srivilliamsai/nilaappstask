import { BaseEdge, EdgeLabelRenderer, getBezierPath, type EdgeProps } from '@xyflow/react';
import type { EdgeData } from '../../store/canvasStore';

export default function CustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
}: EdgeProps) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const edgeData = data as EdgeData | undefined;
  const label = edgeData?.label || '';
  const hasRules = edgeData?.conditions?.rules && edgeData.conditions.rules.length > 0;

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: selected ? '#4F46E5' : hasRules ? '#8B5CF6' : '#94a3b8',
          strokeWidth: selected ? 2.5 : 1.5,
          strokeDasharray: hasRules ? '8 4' : 'none',
        }}
      />
      {label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all',
              fontSize: 11,
              fontWeight: 500,
              background: selected ? '#4F46E5' : hasRules ? '#8B5CF6' : '#64748b',
              color: '#ffffff',
              padding: '2px 8px',
              borderRadius: 10,
              whiteSpace: 'nowrap',
            }}
            className="nodrag nopan"
          >
            {label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}
