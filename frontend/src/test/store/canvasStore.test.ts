import { describe, it, expect, beforeEach } from 'vitest';
import { useCanvasStore } from '../../store/canvasStore';
import type { NodeData } from '../../store/canvasStore';
import type { Node } from '@xyflow/react';
import type { LearningPathPayload } from '../../types/learningPath';

beforeEach(() => {
  useCanvasStore.setState({
    nodes: [], edges: [], selectedNodeId: null, selectedEdgeId: null,
    pathName: 'Untitled Learning Path', pathDescription: '', pathStatus: 'draft', pathId: null,
  });
});

const mockNode = (id: string, type = 'unit'): Node<NodeData> => ({
  id, type: 'unitNode', position: { x: 100, y: 200 },
  data: { label: `Node ${id}`, description: 'desc', componentId: `cmp-${id}`, nodeType: type as NodeData['nodeType'], approximateDurationMinutes: 30 },
});

describe('Canvas Store — Nodes', () => {
  it('starts empty', () => { expect(useCanvasStore.getState().nodes).toEqual([]); });
  it('addNode adds a node', () => {
    useCanvasStore.getState().addNode(mockNode('n1'));
    expect(useCanvasStore.getState().nodes).toHaveLength(1);
  });
  it('setNodes replaces all', () => {
    useCanvasStore.getState().addNode(mockNode('n1'));
    useCanvasStore.getState().setNodes([mockNode('n2')]);
    expect(useCanvasStore.getState().nodes[0].id).toBe('n2');
  });
  it('updateNodeData merges data', () => {
    useCanvasStore.getState().addNode(mockNode('n1'));
    useCanvasStore.getState().updateNodeData('n1', { label: 'Updated' });
    expect(useCanvasStore.getState().nodes[0].data.label).toBe('Updated');
    expect(useCanvasStore.getState().nodes[0].data.description).toBe('desc');
  });
  it('removeNode removes node and connected edges', () => {
    useCanvasStore.getState().addNode(mockNode('n1'));
    useCanvasStore.getState().addNode(mockNode('n2'));
    useCanvasStore.getState().setEdges([{ id: 'e1', source: 'n1', target: 'n2', data: { conditions: { operator: 'AND', rules: [] } } }]);
    useCanvasStore.getState().removeNode('n1');
    expect(useCanvasStore.getState().nodes).toHaveLength(1);
    expect(useCanvasStore.getState().edges).toHaveLength(0);
  });
  it('removeNode clears selection if selected', () => {
    useCanvasStore.getState().addNode(mockNode('n1'));
    useCanvasStore.getState().setSelectedNode('n1');
    useCanvasStore.getState().removeNode('n1');
    expect(useCanvasStore.getState().selectedNodeId).toBeNull();
  });
});

describe('Canvas Store — Edges', () => {
  it('setEdges sets edges', () => {
    useCanvasStore.getState().setEdges([{ id: 'e1', source: 'a', target: 'b', data: { conditions: { operator: 'AND', rules: [] } } }]);
    expect(useCanvasStore.getState().edges).toHaveLength(1);
  });
  it('updateEdgeData merges', () => {
    useCanvasStore.getState().setEdges([{ id: 'e1', source: 'a', target: 'b', data: { label: 'old', priority: 5, conditions: { operator: 'OR', rules: [] } } }]);
    useCanvasStore.getState().updateEdgeData('e1', { label: 'new' });
    expect(useCanvasStore.getState().edges[0].data?.label).toBe('new');
    expect(useCanvasStore.getState().edges[0].data?.priority).toBe(5);
  });
  it('removeEdge removes and clears selection', () => {
    useCanvasStore.getState().setEdges([{ id: 'e1', source: 'a', target: 'b', data: { conditions: { operator: 'AND', rules: [] } } }]);
    useCanvasStore.getState().setSelectedEdge('e1');
    useCanvasStore.getState().removeEdge('e1');
    expect(useCanvasStore.getState().edges).toHaveLength(0);
    expect(useCanvasStore.getState().selectedEdgeId).toBeNull();
  });
});

describe('Canvas Store — Selection', () => {
  it('selecting node clears edge', () => {
    useCanvasStore.getState().setSelectedEdge('e1');
    useCanvasStore.getState().setSelectedNode('n1');
    expect(useCanvasStore.getState().selectedNodeId).toBe('n1');
    expect(useCanvasStore.getState().selectedEdgeId).toBeNull();
  });
  it('selecting edge clears node', () => {
    useCanvasStore.getState().setSelectedNode('n1');
    useCanvasStore.getState().setSelectedEdge('e1');
    expect(useCanvasStore.getState().selectedEdgeId).toBe('e1');
    expect(useCanvasStore.getState().selectedNodeId).toBeNull();
  });
  it('clearSelection clears both', () => {
    useCanvasStore.getState().setSelectedNode('n1');
    useCanvasStore.getState().clearSelection();
    expect(useCanvasStore.getState().selectedNodeId).toBeNull();
    expect(useCanvasStore.getState().selectedEdgeId).toBeNull();
  });
});

describe('Canvas Store — Metadata', () => {
  it('setPathName', () => { useCanvasStore.getState().setPathName('X'); expect(useCanvasStore.getState().pathName).toBe('X'); });
  it('setPathDescription', () => { useCanvasStore.getState().setPathDescription('Y'); expect(useCanvasStore.getState().pathDescription).toBe('Y'); });
  it('setPathStatus', () => { useCanvasStore.getState().setPathStatus('published'); expect(useCanvasStore.getState().pathStatus).toBe('published'); });
  it('setPathId', () => { useCanvasStore.getState().setPathId('lp-1'); expect(useCanvasStore.getState().pathId).toBe('lp-1'); });
});

describe('Canvas Store — toSavePayload', () => {
  it('produces valid payload', () => {
    useCanvasStore.getState().setPathName('P'); useCanvasStore.getState().setPathId('lp-1');
    useCanvasStore.getState().addNode(mockNode('n1', 'start'));
    const p = useCanvasStore.getState().toSavePayload();
    expect(p.name).toBe('P'); expect(p.id).toBe('lp-1');
    expect(p.nodes).toHaveLength(1); expect(p.edges).toHaveLength(0);
  });
  it('maps positions', () => {
    useCanvasStore.getState().addNode(mockNode('n1'));
    expect(useCanvasStore.getState().toSavePayload().nodes[0].position).toEqual({ x: 100, y: 200 });
  });
  it('maps edges to schema', () => {
    useCanvasStore.getState().setEdges([{ id: 'e1', source: 'n1', target: 'n2', data: { label: 'L', priority: 1, isDefault: true, conditions: { operator: 'AND', rules: [{ id: 'r1', sourceType: 'assessment', sourceNodeId: 'n1', metric: 'score', operator: 'gte', value: 50 }] } } }]);
    const e = useCanvasStore.getState().toSavePayload().edges[0];
    expect(e.sourceNodeId).toBe('n1'); expect(e.targetNodeId).toBe('n2');
    expect(e.conditions.rules[0].metric).toBe('score');
  });
});

describe('Canvas Store — loadFromPayload', () => {
  const payload: LearningPathPayload = {
    id: 'lp-x', name: 'Loaded', description: 'Desc', status: 'published', version: 2,
    nodes: [
      { id: 'ns', componentId: 'sys', type: 'start', label: 'S', position: { x: 10, y: 20 } },
      { id: 'na', componentId: 'cmp-a', type: 'assessment', label: 'A', position: { x: 30, y: 40 }, config: { approximateDurationMinutes: 35, assessment: { maxScore: 100, passingScore: 50 } } },
    ],
    edges: [{ id: 'e1', sourceNodeId: 'ns', targetNodeId: 'na', label: 'Go', priority: 1, isDefault: true, conditions: { operator: 'AND', rules: [] } }],
  };
  it('loads metadata', () => {
    useCanvasStore.getState().loadFromPayload(payload);
    expect(useCanvasStore.getState().pathId).toBe('lp-x');
    expect(useCanvasStore.getState().pathName).toBe('Loaded');
    expect(useCanvasStore.getState().pathStatus).toBe('published');
  });
  it('loads nodes with React Flow types', () => {
    useCanvasStore.getState().loadFromPayload(payload);
    expect(useCanvasStore.getState().nodes[0].type).toBe('startNode');
    expect(useCanvasStore.getState().nodes[1].type).toBe('assessmentNode');
  });
  it('loads node config', () => {
    useCanvasStore.getState().loadFromPayload(payload);
    expect(useCanvasStore.getState().nodes[1].data.maxScore).toBe(100);
  });
  it('loads edges as custom type', () => {
    useCanvasStore.getState().loadFromPayload(payload);
    expect(useCanvasStore.getState().edges[0].type).toBe('custom');
    expect(useCanvasStore.getState().edges[0].source).toBe('ns');
  });
});

describe('Canvas Store — Round-Trip', () => {
  it('load then save preserves data', () => {
    const orig: LearningPathPayload = {
      id: 'lp-rt', name: 'RT', description: 'D', status: 'draft', version: 1,
      nodes: [{ id: 'n1', componentId: 'c1', type: 'start', label: 'S', position: { x: 1, y: 2 } }],
      edges: [{ id: 'e1', sourceNodeId: 'n1', targetNodeId: 'n1', label: 'L', priority: 1, isDefault: true, conditions: { operator: 'AND', rules: [] } }],
    };
    useCanvasStore.getState().loadFromPayload(orig);
    const saved = useCanvasStore.getState().toSavePayload();
    expect(saved.id).toBe('lp-rt'); expect(saved.name).toBe('RT');
    expect(saved.nodes[0].position).toEqual({ x: 1, y: 2 });
    expect(saved.edges[0].sourceNodeId).toBe('n1');
  });
});
