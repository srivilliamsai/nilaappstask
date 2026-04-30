import { Handle, Position } from '@xyflow/react';
import type { NodeData } from '../../../store/canvasStore';
import './CustomNodes.css';

interface Props {
  data: NodeData;
  selected?: boolean;
}

export default function StartNode({ data, selected }: Props) {
  return (
    <div className={`custom-node start-node ${selected ? 'selected' : ''}`}>
      <div className="node-icon start-icon">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="6" stroke="#10B981" strokeWidth="2" fill="none" />
          <circle cx="8" cy="8" r="3" fill="#10B981" />
        </svg>
      </div>
      <div className="node-content">
        <span className="node-label">{data.label}</span>
      </div>
      <Handle type="source" position={Position.Bottom} className="handle" />
    </div>
  );
}
