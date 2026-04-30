import { useCanvasStore } from '../../store/canvasStore';
import type { EdgeData } from '../../store/canvasStore';
import { generateRuleId } from '../../utils/idGenerator';
import type { Rule, MetricType, OperatorType } from '../../types/learningPath';
import './PropertiesPanel.css';

export default function PropertiesPanel() {
  const {
    nodes,
    edges,
    selectedNodeId,
    selectedEdgeId,
    updateNodeData,
    removeNode,
    updateEdgeData,
    removeEdge,
  } = useCanvasStore();

  const selectedNode = selectedNodeId ? nodes.find((n) => n.id === selectedNodeId) : null;
  const selectedEdge = selectedEdgeId ? edges.find((e) => e.id === selectedEdgeId) : null;

  if (!selectedNode && !selectedEdge) {
    return (
      <div className="properties-panel empty" id="properties-panel">
        <div className="empty-state">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="24" r="20" stroke="#e2e8f0" strokeWidth="2" strokeDasharray="4 4" />
            <path d="M18 24h12M24 18v12" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <p>Select a node or edge to edit its properties</p>
        </div>
      </div>
    );
  }

  // ─── Node Properties ───
  if (selectedNode) {
    const data = selectedNode.data;
    // Find if this node belongs to a group (has incoming edges from a group/assessment node)
    const parentEdge = edges.find((e) => e.target === selectedNode.id);
    const parentNode = parentEdge ? nodes.find((n) => n.id === parentEdge.source) : null;

    return (
      <div className="properties-panel" id="properties-panel">
        <div className="panel-header">
          <div>
            <h3>Properties</h3>
            <span className={`type-tag ${data.nodeType}`}>
              {data.nodeType === 'assessment' ? 'Assessment' : data.nodeType === 'start' ? 'Start' : data.nodeType === 'end' ? 'End' : 'Section'}
            </span>
          </div>
          <button className="delete-btn" onClick={() => removeNode(selectedNode.id)} title="Delete node">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M5 2h6M2 4h12M3.5 4l.7 9.1c.1.5.5.9 1 .9h5.6c.5 0 .9-.4 1-.9L12.5 4M6.5 7v4M9.5 7v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        <div className="panel-section">
          <label>Label</label>
          <input
            type="text"
            value={data.label}
            onChange={(e) => updateNodeData(selectedNode.id, { label: e.target.value })}
            placeholder="Enter label"
            id="node-label-input"
          />
        </div>

        <div className="panel-section">
          <label>Description</label>
          <textarea
            value={data.description || ''}
            onChange={(e) => updateNodeData(selectedNode.id, { description: e.target.value })}
            placeholder="Enter description"
            rows={3}
            id="node-description-input"
          />
        </div>

        <div className="panel-section">
          <h4>Section Details</h4>
          <div className="detail-grid">
            <div>
              <label>Questions</label>
              <input
                type="number"
                value={data.questionCount || 0}
                onChange={(e) => updateNodeData(selectedNode.id, { questionCount: parseInt(e.target.value) || 0 })}
                min={0}
                id="node-questions-input"
              />
            </div>
            <div>
              <label>Duration (min)</label>
              <input
                type="number"
                value={data.approximateDurationMinutes || 0}
                onChange={(e) =>
                  updateNodeData(selectedNode.id, { approximateDurationMinutes: parseInt(e.target.value) || 0 })
                }
                min={0}
                id="node-duration-input"
              />
            </div>
          </div>
        </div>

        <div className="panel-section">
          <label>Difficulty</label>
          <select
            value={data.difficulty || ''}
            onChange={(e) => updateNodeData(selectedNode.id, { difficulty: e.target.value })}
            id="node-difficulty-select"
          >
            <option value="">Select difficulty</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>

        {data.nodeType === 'assessment' && data.maxScore !== undefined && (
          <div className="panel-section">
            <h4>Assessment Config</h4>
            <div className="detail-grid">
              <div>
                <label>Max Score</label>
                <input
                  type="number"
                  value={data.maxScore || 0}
                  onChange={(e) => updateNodeData(selectedNode.id, { maxScore: parseInt(e.target.value) || 0 })}
                  min={1}
                  id="node-maxscore-input"
                />
              </div>
              <div>
                <label>Passing Score</label>
                <input
                  type="number"
                  value={data.passingScore || 0}
                  onChange={(e) => updateNodeData(selectedNode.id, { passingScore: parseInt(e.target.value) || 0 })}
                  min={0}
                  id="node-passingscore-input"
                />
              </div>
            </div>
          </div>
        )}

        {/* Assignment Conditions for this node's outgoing edges */}
        {(() => {
          const outgoingEdges = edges.filter((e) => e.source === selectedNode.id);
          if (outgoingEdges.length === 0) return null;
          return (
            <div className="panel-section">
              <div className="conditions-header">
                <h4>Assignment Conditions</h4>
                <button className="add-rule-btn" onClick={() => {
                  const edge = outgoingEdges[0];
                  const edgeData = edge.data as EdgeData | undefined;
                  const conditions = edgeData?.conditions || { operator: 'AND' as const, rules: [] };
                  const newRule: Rule = {
                    id: generateRuleId(),
                    sourceType: data.nodeType === 'assessment' ? 'assessment' : 'unit',
                    sourceNodeId: selectedNode.id,
                    metric: 'score',
                    operator: 'lt',
                    value: 50,
                  };
                  updateEdgeData(edge.id, {
                    conditions: { ...conditions, rules: [...conditions.rules, newRule] },
                  });
                }} id="add-condition-btn">
                  + Add
                </button>
              </div>
              <p className="conditions-desc">Define when this section should be shown to learners</p>
              {outgoingEdges.map((edge) => {
                const ed = edge.data as EdgeData | undefined;
                const cond = ed?.conditions || { operator: 'AND' as const, rules: [] };
                return cond.rules.map((rule, idx) => (
                  <div key={rule.id} className="condition-card">
                    <div className="condition-card-header">
                      <span>Condition {idx + 1}</span>
                      <button className="remove-rule-btn" onClick={() => {
                        updateEdgeData(edge.id, {
                          conditions: { ...cond, rules: cond.rules.filter((r) => r.id !== rule.id) },
                        });
                      }}>×</button>
                    </div>
                    <div className="condition-field">
                      <label>Source Section</label>
                      <select value={rule.sourceNodeId} onChange={(e) => {
                        updateEdgeData(edge.id, {
                          conditions: { ...cond, rules: cond.rules.map((r) => r.id === rule.id ? { ...r, sourceNodeId: e.target.value } : r) },
                        });
                      }}>
                        {nodes.map((n) => <option key={n.id} value={n.id}>{n.data.label}</option>)}
                      </select>
                    </div>
                    <div className="condition-row">
                      <div className="condition-field">
                        <label>Operator</label>
                        <select value={rule.operator} onChange={(e) => {
                          updateEdgeData(edge.id, {
                            conditions: { ...cond, rules: cond.rules.map((r) => r.id === rule.id ? { ...r, operator: e.target.value as OperatorType } : r) },
                          });
                        }}>
                          <option value="lt">Less than (&lt;)</option>
                          <option value="lte">Less or equal (≤)</option>
                          <option value="gt">Greater than (&gt;)</option>
                          <option value="gte">Greater or equal (≥)</option>
                          <option value="eq">Equals (=)</option>
                          <option value="ne">Not equals (≠)</option>
                          <option value="between">Between</option>
                        </select>
                      </div>
                      <div className="condition-field">
                        <label>Threshold</label>
                        <div className="threshold-input-group">
                          <input
                            type="number"
                            value={typeof rule.value === 'number' ? rule.value : 0}
                            onChange={(e) => {
                              updateEdgeData(edge.id, {
                                conditions: { ...cond, rules: cond.rules.map((r) => r.id === rule.id ? { ...r, value: parseFloat(e.target.value) } : r) },
                              });
                            }}
                          />
                          <span className="threshold-unit">%</span>
                        </div>
                      </div>
                    </div>
                    <div className="condition-preview highlight">
                      Show if score {rule.operator === 'lt' ? '<' : rule.operator === 'lte' ? '≤' : rule.operator === 'gt' ? '>' : rule.operator === 'gte' ? '≥' : rule.operator === 'eq' ? '=' : '≠'} {typeof rule.value === 'number' ? rule.value : 0}%
                    </div>
                  </div>
                ));
              })}
            </div>
          );
        })()}

        {/* Parent Group section */}
        {parentNode && (
          <div className="panel-section">
            <h4>Parent Group</h4>
            <p className="parent-group-name">{parentNode.data.label}</p>
            <p className="parent-group-desc">This section belongs to a group</p>
          </div>
        )}
      </div>
    );
  }

  // ─── Edge Properties ───
  if (selectedEdge) {
    const edgeData = selectedEdge.data as EdgeData | undefined;
    const conditions = edgeData?.conditions || { operator: 'AND' as const, rules: [] };
    const sourceNode = nodes.find((n) => n.id === selectedEdge.source);

    const addRule = () => {
      const newRule: Rule = {
        id: generateRuleId(),
        sourceType: sourceNode?.data.nodeType === 'assessment' ? 'assessment' : 'unit',
        sourceNodeId: selectedEdge.source,
        metric: 'completion',
        operator: 'eq',
        value: true,
      };
      updateEdgeData(selectedEdge.id, {
        conditions: {
          ...conditions,
          rules: [...conditions.rules, newRule],
        },
      });
    };

    const updateRule = (ruleId: string, updates: Partial<Rule>) => {
      updateEdgeData(selectedEdge.id, {
        conditions: {
          ...conditions,
          rules: conditions.rules.map((r) => (r.id === ruleId ? { ...r, ...updates } : r)),
        },
      });
    };

    const removeRule = (ruleId: string) => {
      updateEdgeData(selectedEdge.id, {
        conditions: {
          ...conditions,
          rules: conditions.rules.filter((r) => r.id !== ruleId),
        },
      });
    };

    const getPreviewText = (): string => {
      if (conditions.rules.length === 0) return 'No conditions (default path)';
      return conditions.rules
        .map((r) => {
          if (r.metric === 'completion') return `completed = ${r.value}`;
          if (r.metric === 'passed') return `passed = ${r.value}`;
          if (r.metric === 'score') return `score ${r.operator === 'lt' ? '<' : r.operator === 'lte' ? '≤' : r.operator === 'gt' ? '>' : r.operator === 'gte' ? '≥' : r.operator === 'eq' ? '=' : '≠'} ${r.value}`;
          if (r.metric === 'score_range' && r.range) return `score between ${r.range.min}-${r.range.max}`;
          return `${r.metric} ${r.operator} ${r.value}`;
        })
        .join(` ${conditions.operator} `);
    };

    return (
      <div className="properties-panel" id="properties-panel">
        <div className="panel-header">
          <div>
            <h3>Connection Properties</h3>
            <span className="type-tag edge">Edge</span>
          </div>
          <button className="delete-btn" onClick={() => removeEdge(selectedEdge.id)} title="Delete edge">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M5 2h6M2 4h12M3.5 4l.7 9.1c.1.5.5.9 1 .9h5.6c.5 0 .9-.4 1-.9L12.5 4M6.5 7v4M9.5 7v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        <div className="panel-section">
          <label>Label</label>
          <input
            type="text"
            value={edgeData?.label || ''}
            onChange={(e) => updateEdgeData(selectedEdge.id, { label: e.target.value })}
            placeholder="e.g., Score below passing"
            id="edge-label-input"
          />
        </div>

        <div className="panel-section">
          <div className="conditions-header">
            <h4>Assignment Conditions</h4>
            <button className="add-rule-btn" onClick={addRule} id="add-condition-btn">
              + Add
            </button>
          </div>
          <p className="conditions-desc">Define when this section should be shown to learners</p>

          {conditions.rules.length > 0 && (
            <div className="condition-operator">
              <label>Match</label>
              <select
                value={conditions.operator}
                onChange={(e) =>
                  updateEdgeData(selectedEdge.id, {
                    conditions: { ...conditions, operator: e.target.value as 'AND' | 'OR' },
                  })
                }
                id="condition-operator-select"
              >
                <option value="AND">All conditions (AND)</option>
                <option value="OR">Any condition (OR)</option>
              </select>
            </div>
          )}

          {conditions.rules.map((rule, idx) => (
            <div key={rule.id} className="condition-card">
              <div className="condition-card-header">
                <span>Condition {idx + 1}</span>
                <button className="remove-rule-btn" onClick={() => removeRule(rule.id)}>×</button>
              </div>

              <div className="condition-field">
                <label>Source Section</label>
                <select
                  value={rule.sourceNodeId}
                  onChange={(e) => updateRule(rule.id, { sourceNodeId: e.target.value })}
                >
                  {nodes.map((n) => (
                    <option key={n.id} value={n.id}>{n.data.label}</option>
                  ))}
                </select>
              </div>

              <div className="condition-field">
                <label>Metric</label>
                <select
                  value={rule.metric}
                  onChange={(e) => updateRule(rule.id, { metric: e.target.value as MetricType })}
                >
                  <option value="completion">Completion</option>
                  <option value="passed">Passed</option>
                  <option value="score">Score</option>
                  <option value="score_range">Score Range</option>
                  <option value="time_spent_minutes">Time Spent (min)</option>
                  <option value="percentage_completion">% Completion</option>
                </select>
              </div>

              <div className="condition-row">
                <div className="condition-field">
                  <label>Operator</label>
                  <select
                    value={rule.operator}
                    onChange={(e) => updateRule(rule.id, { operator: e.target.value as OperatorType })}
                  >
                    <option value="lt">Less than (&lt;)</option>
                    <option value="lte">Less or equal (≤)</option>
                    <option value="gt">Greater than (&gt;)</option>
                    <option value="gte">Greater or equal (≥)</option>
                    <option value="eq">Equals (=)</option>
                    <option value="ne">Not equals (≠)</option>
                    <option value="between">Between</option>
                  </select>
                </div>
                <div className="condition-field">
                  <label>Threshold</label>
                  {rule.metric === 'completion' || rule.metric === 'passed' ? (
                    <select
                      value={String(rule.value)}
                      onChange={(e) => updateRule(rule.id, { value: e.target.value === 'true' })}
                    >
                      <option value="true">True</option>
                      <option value="false">False</option>
                    </select>
                  ) : rule.operator === 'between' ? (
                    <div className="range-inputs">
                      <input
                        type="number"
                        value={rule.range?.min || 0}
                        onChange={(e) =>
                          updateRule(rule.id, {
                            range: { ...rule.range!, min: parseFloat(e.target.value) },
                          })
                        }
                        placeholder="Min"
                      />
                      <span>–</span>
                      <input
                        type="number"
                        value={rule.range?.max || 100}
                        onChange={(e) =>
                          updateRule(rule.id, {
                            range: { ...rule.range!, max: parseFloat(e.target.value) },
                          })
                        }
                        placeholder="Max"
                      />
                    </div>
                  ) : (
                    <div className="threshold-input-group">
                      <input
                        type="number"
                        value={typeof rule.value === 'number' ? rule.value : 0}
                        onChange={(e) => updateRule(rule.id, { value: parseFloat(e.target.value) })}
                      />
                      <span className="threshold-unit">%</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="condition-preview highlight">{getPreviewText()}</div>
            </div>
          ))}
        </div>

        {sourceNode && (
          <div className="panel-section">
            <h4>Connection Info</h4>
            <p className="info-text">
              From: <strong>{sourceNode.data.label}</strong>
            </p>
            <p className="info-text">
              To: <strong>{nodes.find((n) => n.id === selectedEdge.target)?.data.label || 'Unknown'}</strong>
            </p>
          </div>
        )}
      </div>
    );
  }

  return null;
}
