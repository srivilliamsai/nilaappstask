import { Handle, Position } from '@xyflow/react';
import type { NodeData } from '../../../store/canvasStore';
import './CustomNodes.css';

interface Props {
  data: NodeData;
  selected?: boolean;
}

export default function AssessmentNode({ data, selected }: Props) {
  return (
    <div className={`custom-node assessment-node ${selected ? 'selected' : ''}`}>
      <div className="node-icon assessment-icon">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="5" stroke="#8B5CF6" strokeWidth="2" fill="none" />
          <path d="M8 5v3l2 1" stroke="#8B5CF6" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
      <div className="node-content">
        <span className="node-label">{data.label}</span>
        <span className="node-meta">
          {data.description
            ? data.description.length > 40
              ? data.description.substring(0, 40) + '...'
              : data.description
            : ''}
          {!data.description && data.approximateDurationMinutes
            ? `${data.approximateDurationMinutes} minutes`
            : ''}
        </span>
      </div>
      <span className="node-badge group-badge">Group</span>
      <Handle type="target" position={Position.Top} className="handle" />
      <Handle type="source" position={Position.Bottom} className="handle" />
    </div>
  );
}
