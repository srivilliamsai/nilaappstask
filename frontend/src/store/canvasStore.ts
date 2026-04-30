import { create } from 'zustand';
import {
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
} from '@xyflow/react';
import type {
  Node,
  Edge,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  Connection,
} from '@xyflow/react';
import type { LearningPathPayload, LearningNode, LearningEdge, Conditions, NodeType } from '../types/learningPath';
import { generateEdgeId } from '../utils/idGenerator';

export interface NodeData {
  label: string;
  description?: string;
  componentId: string;
  nodeType: NodeType;
  approximateDurationMinutes?: number;
  maxScore?: number;
  passingScore?: number;
  questionCount?: number;
  difficulty?: string;
  [key: string]: unknown;
}

export interface EdgeData {
  label?: string;
  priority?: number;
  isDefault?: boolean;
  conditions: Conditions;
  [key: string]: unknown;
}

interface CanvasStore {
  nodes: Node<NodeData>[];
  edges: Edge<EdgeData>[];
  selectedNodeId: string | null;
  selectedEdgeId: string | null;
  pathName: string;
  pathDescription: string;
  pathStatus: 'draft' | 'published';
  pathId: string | null;

  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  setNodes: (nodes: Node<NodeData>[]) => void;
  setEdges: (edges: Edge<EdgeData>[]) => void;
  addNode: (node: Node<NodeData>) => void;
  updateNodeData: (id: string, data: Partial<NodeData>) => void;
  removeNode: (id: string) => void;
  updateEdgeData: (id: string, data: Partial<EdgeData>) => void;
  removeEdge: (id: string) => void;
  setSelectedNode: (id: string | null) => void;
  setSelectedEdge: (id: string | null) => void;
  setPathName: (name: string) => void;
  setPathDescription: (desc: string) => void;
  setPathStatus: (status: 'draft' | 'published') => void;
  setPathId: (id: string | null) => void;
  loadFromPayload: (payload: LearningPathPayload) => void;
  toSavePayload: () => LearningPathPayload;
  clearSelection: () => void;
}

export const useCanvasStore = create<CanvasStore>((set, get) => ({
  nodes: [],
  edges: [],
  selectedNodeId: null,
  selectedEdgeId: null,
  pathName: 'Untitled Learning Path',
  pathDescription: '',
  pathStatus: 'draft',
  pathId: null,

  onNodesChange: (changes) => {
    set({ nodes: applyNodeChanges(changes, get().nodes) as Node<NodeData>[] });
  },

  onEdgesChange: (changes) => {
    set({ edges: applyEdgeChanges(changes, get().edges) as Edge<EdgeData>[] });
  },

  onConnect: (connection: Connection) => {
    const newEdge: Edge<EdgeData> = {
      id: generateEdgeId(),
      source: connection.source,
      target: connection.target,
      sourceHandle: connection.sourceHandle ?? undefined,
      targetHandle: connection.targetHandle ?? undefined,
      type: 'custom',
      animated: true,
      data: {
        label: '',
        priority: 1,
        isDefault: false,
        conditions: { operator: 'AND', rules: [] },
      },
    };
    set({ edges: addEdge(newEdge, get().edges) as Edge<EdgeData>[] });
  },

  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),

  addNode: (node) => set((state) => ({ nodes: [...state.nodes, node] })),

  updateNodeData: (id, data) =>
    set((state) => ({
      nodes: state.nodes.map((n) =>
        n.id === id ? { ...n, data: { ...n.data, ...data } } : n
      ),
    })),

  removeNode: (id) =>
    set((state) => ({
      nodes: state.nodes.filter((n) => n.id !== id),
      edges: state.edges.filter((e) => e.source !== id && e.target !== id),
      selectedNodeId: state.selectedNodeId === id ? null : state.selectedNodeId,
    })),

  updateEdgeData: (id, data) =>
    set((state) => ({
      edges: state.edges.map((e) =>
        e.id === id ? { ...e, data: { ...e.data, ...data } as EdgeData } : e
      ),
    })),

  removeEdge: (id) =>
    set((state) => ({
      edges: state.edges.filter((e) => e.id !== id),
      selectedEdgeId: state.selectedEdgeId === id ? null : state.selectedEdgeId,
    })),

  setSelectedNode: (id) => set({ selectedNodeId: id, selectedEdgeId: null }),
  setSelectedEdge: (id) => set({ selectedEdgeId: id, selectedNodeId: null }),
  setPathName: (name) => set({ pathName: name }),
  setPathDescription: (desc) => set({ pathDescription: desc }),
  setPathStatus: (status) => set({ pathStatus: status }),
  setPathId: (id) => set({ pathId: id }),
  clearSelection: () => set({ selectedNodeId: null, selectedEdgeId: null }),

  loadFromPayload: (payload) => {
    const nodes: Node<NodeData>[] = payload.nodes.map((n) => ({
      id: n.id,
      type: n.type === 'start' ? 'startNode' : n.type === 'end' ? 'endNode' : n.type === 'assessment' ? 'assessmentNode' : 'unitNode',
      position: n.position,
      data: {
        label: n.label,
        description: n.description,
        componentId: n.componentId,
        nodeType: n.type,
        approximateDurationMinutes: n.config?.approximateDurationMinutes,
        maxScore: n.config?.assessment?.maxScore,
        passingScore: n.config?.assessment?.passingScore,
      },
    }));

    const edges: Edge<EdgeData>[] = payload.edges.map((e) => ({
      id: e.id,
      source: e.sourceNodeId,
      target: e.targetNodeId,
      type: 'custom',
      animated: true,
      data: {
        label: e.label,
        priority: e.priority,
        isDefault: e.isDefault,
        conditions: e.conditions,
      },
    }));

    set({
      nodes,
      edges,
      pathName: payload.name,
      pathDescription: payload.description || '',
      pathStatus: payload.status,
      pathId: payload.id || null,
    });
  },

  toSavePayload: (): LearningPathPayload => {
    const state = get();

    const nodes: LearningNode[] = state.nodes.map((n) => {
      const node: LearningNode = {
        id: n.id,
        componentId: n.data.componentId,
        type: n.data.nodeType,
        label: n.data.label,
        position: { x: n.position.x, y: n.position.y },
      };
      if (n.data.description) node.description = n.data.description;
      if (n.data.approximateDurationMinutes || n.data.maxScore) {
        node.config = {};
        if (n.data.approximateDurationMinutes) node.config.approximateDurationMinutes = n.data.approximateDurationMinutes;
        if (n.data.maxScore && n.data.passingScore !== undefined) {
          node.config.assessment = { maxScore: n.data.maxScore, passingScore: n.data.passingScore };
        }
      }
      return node;
    });

    const edges: LearningEdge[] = state.edges.map((e) => ({
      id: e.id,
      sourceNodeId: e.source,
      targetNodeId: e.target,
      label: e.data?.label,
      priority: e.data?.priority,
      isDefault: e.data?.isDefault,
      conditions: e.data?.conditions || { operator: 'AND', rules: [] },
    }));

    return {
      id: state.pathId || undefined,
      name: state.pathName,
      description: state.pathDescription || undefined,
      status: state.pathStatus,
      version: 1,
      nodes,
      edges,
    };
  },
}));
