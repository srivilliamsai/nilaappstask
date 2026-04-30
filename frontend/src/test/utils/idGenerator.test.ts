import { describe, it, expect } from 'vitest';
import { generateNodeId, generateEdgeId, generateRuleId } from '../../utils/idGenerator';

describe('ID Generator Utilities', () => {
  describe('generateNodeId', () => {
    it('should return a string starting with "node-"', () => {
      const id = generateNodeId();
      expect(id).toMatch(/^node-/);
    });

    it('should generate unique IDs', () => {
      const ids = new Set(Array.from({ length: 100 }, () => generateNodeId()));
      expect(ids.size).toBe(100);
    });

    it('should have format node-XXXXXXXX (8 chars after prefix)', () => {
      const id = generateNodeId();
      expect(id).toMatch(/^node-[a-f0-9]{8}$/);
    });
  });

  describe('generateEdgeId', () => {
    it('should return a string starting with "edge-"', () => {
      const id = generateEdgeId();
      expect(id).toMatch(/^edge-/);
    });

    it('should generate unique IDs', () => {
      const ids = new Set(Array.from({ length: 100 }, () => generateEdgeId()));
      expect(ids.size).toBe(100);
    });

    it('should have format edge-XXXXXXXX', () => {
      const id = generateEdgeId();
      expect(id).toMatch(/^edge-[a-f0-9]{8}$/);
    });
  });

  describe('generateRuleId', () => {
    it('should return a string starting with "rule-"', () => {
      const id = generateRuleId();
      expect(id).toMatch(/^rule-/);
    });

    it('should generate unique IDs', () => {
      const ids = new Set(Array.from({ length: 100 }, () => generateRuleId()));
      expect(ids.size).toBe(100);
    });

    it('should have format rule-XXXXXXXX', () => {
      const id = generateRuleId();
      expect(id).toMatch(/^rule-[a-f0-9]{8}$/);
    });
  });

  describe('Cross-generator uniqueness', () => {
    it('should not collide across generators', () => {
      const nodeId = generateNodeId();
      const edgeId = generateEdgeId();
      const ruleId = generateRuleId();
      expect(nodeId).not.toBe(edgeId);
      expect(nodeId).not.toBe(ruleId);
      expect(edgeId).not.toBe(ruleId);
    });
  });
});
