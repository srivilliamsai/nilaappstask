import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { ReactFlowProvider } from '@xyflow/react';
import type { Node } from '@xyflow/react';
import TopBar from './components/Toolbar/TopBar';
import LeftPanel from './components/LeftPanel/LeftPanel';
import BuilderCanvas from './components/Canvas/BuilderCanvas';
import PropertiesPanel from './components/PropertiesPanel/PropertiesPanel';
import { useCanvasStore } from './store/canvasStore';
import type { NodeData } from './store/canvasStore';
import { generateNodeId } from './utils/idGenerator';
import './App.css';

function App() {
  const { nodes, setNodes } = useCanvasStore();

  // Initialize with Start and End nodes on first load
  useEffect(() => {
    if (nodes.length === 0) {
      const startNode: Node<NodeData> = {
        id: generateNodeId(),
        type: 'startNode',
        position: { x: 400, y: 60 },
        data: {
          label: 'Start Assessment',
          componentId: 'system-start',
          nodeType: 'start',
        },
      };
      const endNode: Node<NodeData> = {
        id: generateNodeId(),
        type: 'endNode',
        position: { x: 400, y: 600 },
        data: {
          label: 'Complete Assessment',
          componentId: 'system-end',
          nodeType: 'end',
        },
      };
      setNodes([startNode, endNode]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ReactFlowProvider>
      <div className="app-layout" id="app-layout">
        <TopBar />
        <div className="app-body">
          <LeftPanel />
          <BuilderCanvas />
          <PropertiesPanel />
        </div>
      </div>
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 3000,
          style: {
            fontFamily: "'Inter', sans-serif",
            fontSize: '13px',
            borderRadius: '10px',
            padding: '10px 16px',
          },
          success: {
            iconTheme: {
              primary: '#10B981',
              secondary: '#ffffff',
            },
          },
          error: {
            iconTheme: {
              primary: '#EF4444',
              secondary: '#ffffff',
            },
          },
        }}
      />
    </ReactFlowProvider>
  );
}

export default App;
