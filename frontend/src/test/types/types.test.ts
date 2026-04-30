import { describe, it, expect } from 'vitest';
import type {
  MetricType, OperatorType,
  Position, LearningNode, Rule, Conditions, LearningEdge, LearningPathPayload,
} from '../../types/learningPath';

describe('Learning Path Type Contracts', () => {
  it('should allow creating a valid Position', () => {
    const pos: Position = { x: 100, y: 200 };
    expect(pos.x).toBe(100);
    expect(pos.y).toBe(200);
  });

  it('should allow creating a valid LearningNode', () => {
    const node: LearningNode = {
      id: 'n1', componentId: 'c1', type: 'assessment', label: 'Math',
      position: { x: 0, y: 0 },
      config: { approximateDurationMinutes: 35, assessment: { maxScore: 100, passingScore: 50 } },
    };
    expect(node.type).toBe('assessment');
    expect(node.config?.assessment?.maxScore).toBe(100);
  });

  it('should allow creating a valid Rule', () => {
    const rule: Rule = {
      id: 'r1', sourceType: 'assessment', sourceNodeId: 'n1',
      metric: 'score', operator: 'gte', value: 50,
    };
    expect(rule.metric).toBe('score');
  });

  it('should allow creating a Rule with range', () => {
    const rule: Rule = {
      id: 'r1', sourceType: 'assessment', sourceNodeId: 'n1',
      metric: 'score_range', operator: 'between',
      range: { min: 40, max: 70, minInclusive: true, maxInclusive: false },
    };
    expect(rule.range?.min).toBe(40);
  });

  it('should allow creating valid Conditions', () => {
    const cond: Conditions = { operator: 'AND', rules: [] };
    expect(cond.operator).toBe('AND');
    expect(cond.rules).toEqual([]);
  });

  it('should allow creating a valid LearningEdge', () => {
    const edge: LearningEdge = {
      id: 'e1', sourceNodeId: 'n1', targetNodeId: 'n2',
      label: 'If score >= 50', priority: 1, isDefault: false,
      conditions: { operator: 'AND', rules: [{ id: 'r1', sourceType: 'assessment', sourceNodeId: 'n1', metric: 'score', operator: 'gte', value: 50 }] },
    };
    expect(edge.conditions.rules).toHaveLength(1);
  });

  it('should allow creating a valid LearningPathPayload', () => {
    const payload: LearningPathPayload = {
      name: 'Test', status: 'draft', version: 1, nodes: [], edges: [],
    };
    expect(payload.status).toBe('draft');
  });

  it('should support all MetricType values', () => {
    const metrics: MetricType[] = ['completion', 'passed', 'score', 'score_range', 'time_spent_minutes', 'percentage_completion'];
    expect(metrics).toHaveLength(6);
  });

  it('should support all OperatorType values', () => {
    const ops: OperatorType[] = ['eq', 'ne', 'gt', 'gte', 'lt', 'lte', 'between'];
    expect(ops).toHaveLength(7);
  });
});

describe('Component Type Contracts', () => {
  it('should allow creating a valid ContentComponent', () => {
    const comp = { id: 'c1', title: 'Math', shortDescription: 'Desc', type: 'assessment' as const, approximateDurationMinutes: 35, metadata: { assessment: { maxScore: 100, passingScore: 50 } } };
    expect(comp.type).toBe('assessment');
    expect(comp.metadata.assessment.maxScore).toBe(100);
  });

  it('should allow creating a valid ComponentListResponse shape', () => {
    const resp = { items: [{ id: 'c1', title: 'T', shortDescription: 'D', type: 'unit' as const, approximateDurationMinutes: 30 }], totalCount: 1 };
    expect(resp.items).toHaveLength(1);
    expect(resp.totalCount).toBe(1);
  });
});
