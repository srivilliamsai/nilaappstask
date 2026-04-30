import { useEffect, useState } from 'react';
import type { DragEvent } from 'react';
import { fetchComponents } from '../../api/apiClient';
import type { ContentComponent } from '../../types/component';
import { useCanvasStore } from '../../store/canvasStore';
import type { NodeData } from '../../store/canvasStore';
import { generateNodeId } from '../../utils/idGenerator';
import type { Node } from '@xyflow/react';
import './LeftPanel.css';

export default function LeftPanel() {
  const [components, setComponents] = useState<ContentComponent[]>([]);
  const [loading, setLoading] = useState(true);
  const addNode = useCanvasStore((s) => s.addNode);

  useEffect(() => {
    fetchComponents()
      .then((res) => {
        setComponents(res.items);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const onDragStart = (event: DragEvent, component: ContentComponent) => {
    event.dataTransfer.setData('application/json', JSON.stringify(component));
    event.dataTransfer.effectAllowed = 'move';
  };

  const onClickAdd = (component: ContentComponent) => {
    const nodeType = component.type === 'assessment' ? 'assessmentNode' : 'unitNode';
    const newNode: Node<NodeData> = {
      id: generateNodeId(),
      type: nodeType,
      position: { x: 300 + Math.random() * 200, y: 100 + Math.random() * 300 },
      data: {
        label: component.title,
        description: component.shortDescription,
        componentId: component.id,
        nodeType: component.type,
        approximateDurationMinutes: component.approximateDurationMinutes,
        maxScore: component.metadata?.assessment?.maxScore,
        passingScore: component.metadata?.assessment?.passingScore,
      },
    };
    addNode(newNode);
  };

  // Get first unit and first assessment for the Section and Group quick-add cards
  const sectionComponent = components.find((c) => c.type === 'unit');
  const groupComponent = components.find((c) => c.type === 'assessment');

  return (
    <div className="left-panel" id="left-panel">
      <div className="left-panel-header">
        <h2>Add Components</h2>
        <p>Drag or click to add to canvas</p>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <span>Loading components...</span>
        </div>
      ) : (
        <div className="component-list">
          {/* Category: Section */}
          <div
            className="component-card section-card"
            draggable
            onDragStart={(e) => {
              if (sectionComponent) onDragStart(e, sectionComponent);
            }}
            onClick={() => {
              if (sectionComponent) onClickAdd(sectionComponent);
            }}
          >
            <div className="card-icon section-card-icon">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <rect x="3" y="3" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="2" />
              </svg>
            </div>
            <div className="card-content">
              <span className="card-title">Section</span>
              <span className="card-desc">Add a quiz/assessment section</span>
            </div>
          </div>

          {/* Category: Group */}
          <div
            className="component-card group-card"
            draggable
            onDragStart={(e) => {
              if (groupComponent) onDragStart(e, groupComponent);
            }}
            onClick={() => {
              if (groupComponent) onClickAdd(groupComponent);
            }}
          >
            <div className="card-icon group-card-icon">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="2" />
                <path d="M9 6v6M6 9h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <div className="card-content">
              <span className="card-title">Group</span>
              <span className="card-desc">Group sections for conditional routing</span>
            </div>
          </div>
        </div>
      )}

      <div className="how-it-works">
        <div className="how-header">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="7" stroke="#3B82F6" strokeWidth="1.5" />
            <path d="M8 5V9M8 11V11.5" stroke="#3B82F6" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <span>How it works:</span>
        </div>
        <ul>
          <li>Add sections & modules</li>
          <li>Use Groups for conditional routing</li>
          <li>Set conditions based on scores</li>
          <li>System routes learners automatically</li>
        </ul>
      </div>

      {/* Example SAT Adaptive Test section */}
      <div className="example-section">
        <h4>Example: SAT Adaptive Test</h4>
        <div className="example-tree">
          <div className="example-item regular">
            <span className="example-name">Math Module 1</span>
            <span className="example-type">Regular section</span>
          </div>
          <div className="example-item group">
            <span className="example-name">Math Module 2 (Group)</span>
            <div className="example-children">
              <div className="example-child">
                <span className="example-name">Easy Version</span>
                <span className="example-condition">If score &lt; 50%</span>
              </div>
              <div className="example-child">
                <span className="example-name">Advanced</span>
                <span className="example-condition">If score ≥ 50%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
