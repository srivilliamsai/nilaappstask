import { useCallback, useMemo, useState } from 'react';
import type { DragEvent } from 'react';
import {
  ReactFlow,
  Background,
  MiniMap,
  BackgroundVariant,
  useReactFlow,
} from '@xyflow/react';
import type {
  NodeTypes,
  EdgeTypes,
  Node,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useCanvasStore } from '../../store/canvasStore';
import type { NodeData } from '../../store/canvasStore';
import { generateNodeId } from '../../utils/idGenerator';
import StartNode from './CustomNodes/StartNode';
import UnitNode from './CustomNodes/UnitNode';
import AssessmentNode from './CustomNodes/AssessmentNode';
import EndNode from './CustomNodes/EndNode';
import CustomEdge from './CustomEdge';
import './BuilderCanvas.css';

const nodeTypes: NodeTypes = {
  startNode: StartNode,
  unitNode: UnitNode,
  assessmentNode: AssessmentNode,
  endNode: EndNode,
};

const edgeTypes: EdgeTypes = {
  custom: CustomEdge,
};

function ZoomControls() {
  const { zoomIn, zoomOut, fitView, getZoom } = useReactFlow();
  const [zoom, setZoom] = useState(100);

  const handleZoomIn = () => {
    zoomIn();
    setTimeout(() => setZoom(Math.round(getZoom() * 100)), 100);
  };
  const handleZoomOut = () => {
    zoomOut();
    setTimeout(() => setZoom(Math.round(getZoom() * 100)), 100);
  };
  const handleFitView = () => {
    fitView();
    setTimeout(() => setZoom(Math.round(getZoom() * 100)), 100);
  };

  return (
    <div className="custom-zoom-controls">
      <button className="zoom-btn" onClick={handleZoomOut} title="Zoom out">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.5" />
          <path d="M4 6h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M10 10l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
      <span className="zoom-label">{zoom}%</span>
      <button className="zoom-btn" onClick={handleZoomIn} title="Zoom in">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.5" />
          <path d="M4 6h4M6 4v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M10 10l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
      <button className="zoom-btn fit-btn" onClick={handleFitView} title="Fit view">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M2 5V2h3M9 2h3v3M12 9v3H9M5 12H2V9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
}

export default function BuilderCanvas() {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
    setSelectedNode,
    setSelectedEdge,
    clearSelection,
  } = useCanvasStore();

  const defaultEdgeOptions = useMemo(
    () => ({
      type: 'custom',
      animated: true,
    }),
    []
  );

  const onDragOver = useCallback((event: DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: DragEvent) => {
      event.preventDefault();
      const rawData = event.dataTransfer.getData('application/json');
      if (!rawData) return;

      const data = JSON.parse(rawData);
      const bounds = (event.target as HTMLElement).closest('.react-flow')?.getBoundingClientRect();
      if (!bounds) return;

      const position = {
        x: event.clientX - bounds.left - 90,
        y: event.clientY - bounds.top - 20,
      };

      const nodeType = data.type === 'assessment' ? 'assessmentNode' : 'unitNode';

      const newNode: Node<NodeData> = {
        id: generateNodeId(),
        type: nodeType,
        position,
        data: {
          label: data.title,
          description: data.shortDescription,
          componentId: data.id,
          nodeType: data.type,
          approximateDurationMinutes: data.approximateDurationMinutes,
          maxScore: data.metadata?.assessment?.maxScore,
          passingScore: data.metadata?.assessment?.passingScore,
        },
      };

      addNode(newNode);
    },
    [addNode]
  );

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      setSelectedNode(node.id);
    },
    [setSelectedNode]
  );

  const onEdgeClick = useCallback(
    (_: React.MouseEvent, edge: { id: string }) => {
      setSelectedEdge(edge.id);
    },
    [setSelectedEdge]
  );

  const onPaneClick = useCallback(() => {
    clearSelection();
  }, [clearSelection]);

  return (
    <div className="builder-canvas" id="builder-canvas">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onNodeClick={onNodeClick}
        onEdgeClick={onEdgeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        fitView
        snapToGrid
        snapGrid={[15, 15]}
        connectionLineStyle={{ stroke: '#4F46E5', strokeWidth: 2 }}
        deleteKeyCode="Delete"
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#e2e8f0" />
        <ZoomControls />
        <MiniMap
          nodeColor={(node) => {
            switch (node.type) {
              case 'startNode': return '#10B981';
              case 'unitNode': return '#3B82F6';
              case 'assessmentNode': return '#8B5CF6';
              case 'endNode': return '#6B7280';
              default: return '#94a3b8';
            }
          }}
          maskColor="rgba(0, 0, 0, 0.08)"
          className="canvas-minimap"
        />
      </ReactFlow>
    </div>
  );
}
