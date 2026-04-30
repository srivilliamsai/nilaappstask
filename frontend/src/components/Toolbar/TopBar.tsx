import { useState, useCallback } from 'react';
import { useCanvasStore } from '../../store/canvasStore';
import type { NodeData } from '../../store/canvasStore';
import { saveLearningPath, loadLearningPath, listLearningPaths } from '../../api/apiClient';
import { generateNodeId } from '../../utils/idGenerator';
import type { Node } from '@xyflow/react';
import toast from 'react-hot-toast';
import './TopBar.css';

export default function TopBar() {
  const [activeTab, setActiveTab] = useState<'builder' | 'preview'>('builder');
  const [saving, setSaving] = useState(false);
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [savedPaths, setSavedPaths] = useState<{ id: string; name: string; status: string }[]>([]);

  const {
    setPathId,
    loadFromPayload,
    toSavePayload,
  } = useCanvasStore();

  const handleSaveDraft = useCallback(async () => {
    setSaving(true);
    try {
      const payload = toSavePayload();
      const result = await saveLearningPath(payload);
      setPathId(result.id);
      toast.success(`Saved as "${result.name}"`);
    } catch (err) {
      toast.error('Failed to save learning path');
      console.error(err);
    } finally {
      setSaving(false);
    }
  }, [toSavePayload, setPathId]);

  const handlePublish = useCallback(async () => {
    setSaving(true);
    try {
      const store = useCanvasStore.getState();
      store.setPathStatus('published');
      const payload = store.toSavePayload();
      const result = await saveLearningPath(payload);
      setPathId(result.id);
      toast.success('Published successfully! 🚀');
    } catch (err) {
      toast.error('Failed to publish');
      console.error(err);
    } finally {
      setSaving(false);
    }
  }, [setPathId]);

  const handleLoad = useCallback(async () => {
    try {
      const paths = await listLearningPaths();
      setSavedPaths(paths);
      setShowLoadModal(true);
    } catch {
      toast.error('Failed to load paths');
    }
  }, []);

  const handleLoadPath = useCallback(
    async (id: string) => {
      try {
        const payload = await loadLearningPath(id);
        loadFromPayload(payload);
        setShowLoadModal(false);
        toast.success('Learning path loaded!');
      } catch {
        toast.error('Failed to load path');
      }
    },
    [loadFromPayload]
  );

  const handleNewPath = useCallback(() => {
    const startNode: Node<NodeData> = {
      id: generateNodeId(),
      type: 'startNode',
      position: { x: 400, y: 60 },
      data: { label: 'Start Assessment', componentId: 'system-start', nodeType: 'start' },
    };
    const endNode: Node<NodeData> = {
      id: generateNodeId(),
      type: 'endNode',
      position: { x: 400, y: 600 },
      data: { label: 'Complete Assessment', componentId: 'system-end', nodeType: 'end' },
    };

    useCanvasStore.setState({
      nodes: [startNode, endNode],
      edges: [],
      pathName: 'Untitled Learning Path',
      pathDescription: '',
      pathStatus: 'draft',
      pathId: null,
      selectedNodeId: null,
      selectedEdgeId: null,
    });
    toast.success('New canvas created');
  }, []);

  return (
    <>
      <div className="top-bar" id="top-bar">
        <div className="top-bar-left">
          <div className="app-title">
            <h1>Adaptive Learning Path Builder</h1>
            <p>Create conditional quiz flows with adaptive sections</p>
          </div>
        </div>

        <div className="top-bar-center">
          <div className="tab-group">
            <button
              className={`tab-btn ${activeTab === 'builder' ? 'active' : ''}`}
              onClick={() => setActiveTab('builder')}
              id="builder-tab"
            >
              Builder
            </button>
            <button
              className={`tab-btn ${activeTab === 'preview' ? 'active' : ''}`}
              onClick={() => setActiveTab('preview')}
              id="preview-tab"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="7" cy="7" r="3" stroke="currentColor" strokeWidth="1.5" />
                <path d="M1 7C2.5 3.5 4.5 2 7 2C9.5 2 11.5 3.5 13 7C11.5 10.5 9.5 12 7 12C4.5 12 2.5 10.5 1 7Z" stroke="currentColor" strokeWidth="1.5" />
              </svg>
              Preview
            </button>
          </div>
        </div>

        <div className="top-bar-right">
          <button className="action-btn secondary" onClick={handleNewPath} id="new-path-btn">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 2V12M2 7H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            New
          </button>
          <button className="action-btn secondary" onClick={handleLoad} id="load-path-btn">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 10V11C2 11.55 2.45 12 3 12H11C11.55 12 12 11.55 12 11V10M7 2V9M7 9L4 6M7 9L10 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Load
          </button>
          <button
            className="action-btn secondary"
            onClick={handleSaveDraft}
            disabled={saving}
            id="save-draft-btn"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M11 12H3C2.45 12 2 11.55 2 11V3C2 2.45 2.45 2 3 2H9L12 5V11C12 11.55 11.55 12 11 12Z" stroke="currentColor" strokeWidth="1.5" />
              <path d="M5 12V8H9V12" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            {saving ? 'Saving...' : 'Save Draft'}
          </button>
          <button
            className="action-btn primary"
            onClick={handlePublish}
            disabled={saving}
            id="publish-btn"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M4 2L12 7L4 12V2Z" fill="currentColor" />
            </svg>
            Publish
          </button>
        </div>
      </div>

      {/* Load Modal */}
      {showLoadModal && (
        <div className="modal-overlay" onClick={() => setShowLoadModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Load Learning Path</h3>
            {savedPaths.length === 0 ? (
              <p className="no-paths">No saved learning paths found.</p>
            ) : (
              <div className="path-list">
                {savedPaths.map((p) => (
                  <button key={p.id} className="path-item" onClick={() => handleLoadPath(p.id)}>
                    <span className="path-name">{p.name}</span>
                    <span className={`path-status ${p.status}`}>{p.status}</span>
                  </button>
                ))}
              </div>
            )}
            <button className="modal-close" onClick={() => setShowLoadModal(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
