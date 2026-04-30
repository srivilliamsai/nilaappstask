import { Handle, Position } from '@xyflow/react';
import type { NodeData } from '../../../store/canvasStore';
import './CustomNodes.css';

interface Props {
  data: NodeData;
  selected?: boolean;
}

export default function UnitNode({ data, selected }: Props) {
  return (
    <div className={`custom-node unit-node ${selected ? 'selected' : ''}`}>
      <div className="node-icon unit-icon">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <rect x="3" y="3" width="10" height="10" rx="2" stroke="#3B82F6" strokeWidth="2" fill="none" />
        </svg>
      </div>
      <div className="node-content">
        <span className="node-label">{data.label}</span>
        <span className="node-meta">
          {data.questionCount ? `${data.questionCount} questions` : ''}
          {data.questionCount && data.approximateDurationMinutes ? ' • ' : ''}
          {data.approximateDurationMinutes ? `${data.approximateDurationMinutes} minutes` : ''}
        </span>
      </div>
      <Handle type="target" position={Position.Top} className="handle" />
      <Handle type="source" position={Position.Bottom} className="handle" />
    </div>
  );
}
