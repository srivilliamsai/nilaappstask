export type NodeType = 'start' | 'unit' | 'assessment' | 'end';
export type PathStatus = 'draft' | 'published';
export type MetricType = 'completion' | 'passed' | 'score' | 'score_range' | 'time_spent_minutes' | 'percentage_completion';
export type OperatorType = 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'between';
export type ConditionOperator = 'AND' | 'OR';

export interface Position {
  x: number;
  y: number;
}

export interface NodeConfig {
  approximateDurationMinutes?: number;
  assessment?: {
    maxScore: number;
    passingScore: number;
  };
}

export interface LearningNode {
  id: string;
  componentId: string;
  type: NodeType;
  label: string;
  description?: string;
  position: Position;
  config?: NodeConfig;
}

export interface RuleRange {
  min: number;
  max: number;
  minInclusive?: boolean;
  maxInclusive?: boolean;
}

export interface Rule {
  id: string;
  sourceType: 'assessment' | 'unit';
  sourceNodeId: string;
  metric: MetricType;
  operator: OperatorType;
  value?: boolean | number | string;
  range?: RuleRange;
}

export interface Conditions {
  operator: ConditionOperator;
  rules: Rule[];
}

export interface LearningEdge {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  label?: string;
  priority?: number;
  isDefault?: boolean;
  conditions: Conditions;
}

export interface CanvasState {
  zoom?: number;
  offsetX?: number;
  offsetY?: number;
}

export interface LearningPathPayload {
  id?: string;
  name: string;
  description?: string;
  status: PathStatus;
  version?: number;
  canvas?: CanvasState;
  nodes: LearningNode[];
  edges: LearningEdge[];
}
