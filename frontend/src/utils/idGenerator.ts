import { v4 as uuidv4 } from 'uuid';

export const generateNodeId = (): string => `node-${uuidv4().substring(0, 8)}`;
export const generateEdgeId = (): string => `edge-${uuidv4().substring(0, 8)}`;
export const generateRuleId = (): string => `rule-${uuidv4().substring(0, 8)}`;
