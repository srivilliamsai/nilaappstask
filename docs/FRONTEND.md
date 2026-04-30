# Frontend Documentation

## Overview

The frontend is a **React 19 + TypeScript** single-page application built with **Vite 8**. It provides a visual, drag-and-drop canvas for building adaptive learning paths using **React Flow** for the graph editor and **Zustand** for state management.

---

## Tech Stack

| Technology         | Version | Purpose                                     |
|-------------------|---------|---------------------------------------------|
| React             | 19      | UI framework                                |
| TypeScript        | 5.x     | Type-safe JavaScript                        |
| Vite              | 8       | Build tool & dev server                     |
| @xyflow/react     | 12      | Node-based graph editor (React Flow)        |
| Zustand           | 5       | Lightweight global state management         |
| Axios             | 1.x     | HTTP client for API communication           |
| react-hot-toast   | 2.x     | Toast notification system                   |
| Vitest            | 4.x     | Unit testing framework                      |

---

## Directory Structure

```
frontend/src/
├── api/
│   └── apiClient.ts              # Axios HTTP client (4 API methods)
├── assets/                        # Static assets
├── components/
│   ├── Canvas/
│   │   ├── BuilderCanvas.tsx      # React Flow canvas + custom zoom controls
│   │   ├── BuilderCanvas.css      # Canvas and zoom control styles
│   │   ├── CustomEdge.tsx         # Custom edge with delete button
│   │   └── CustomNodes/
│   │       ├── StartNode.tsx      # Green start node
│   │       ├── UnitNode.tsx       # Blue unit/section node
│   │       ├── AssessmentNode.tsx # Purple assessment/group node
│   │       ├── EndNode.tsx        # Gray end node
│   │       └── CustomNodes.css    # Node type-specific styles
│   ├── LeftPanel/
│   │   ├── LeftPanel.tsx          # Component sidebar (Section/Group cards)
│   │   └── LeftPanel.css          # Sidebar styles + example section
│   ├── PropertiesPanel/
│   │   ├── PropertiesPanel.tsx    # Node/edge property editor
│   │   └── PropertiesPanel.css    # Properties panel styles
│   ├── Toolbar/
│   │   ├── TopBar.tsx             # Header: tabs, save, load, publish
│   │   └── TopBar.css             # Toolbar styles
│   └── common/
│       └── Toast.tsx              # Toast notification wrapper
├── hooks/                         # Custom React hooks
├── store/
│   └── canvasStore.ts             # Zustand store (nodes, edges, metadata)
├── test/
│   ├── setup.ts                   # Vitest test setup
│   ├── store/
│   │   └── canvasStore.test.ts    # Store tests (24 tests)
│   ├── types/
│   │   └── types.test.ts          # Type contract tests (11 tests)
│   └── utils/
│       └── idGenerator.test.ts    # ID generator tests (10 tests)
├── types/
│   ├── learningPath.ts            # Learning path schema types
│   └── component.ts               # Content component types
├── utils/
│   └── idGenerator.ts             # UUID-based ID generators
├── App.tsx                        # Root application component
├── App.css                        # App layout styles
├── index.css                      # Global design tokens
└── main.tsx                       # React entry point
```

---

## Component Architecture

### App Layout

```
┌──────────────────────────────────────────────────────────────┐
│                        TopBar                                │
│  [Title]        [Builder│Preview]    [New][Load][Save][Pub]  │
├────────┬──────────────────────────────────────┬──────────────┤
│        │                                      │              │
│  Left  │         BuilderCanvas                │  Properties  │
│  Panel │    (React Flow + Custom Nodes)       │    Panel     │
│        │                                      │              │
│ Section│  ┌──────┐   ┌──────┐   ┌──────┐      │  Label       │
│ Group  │  │Start │──►│Unit  │──►│ End  │      │  Description │
│        │  └──────┘   └──────┘   └──────┘      │  Config      │
│ How it │                                      │  Conditions  │
│ works  │         [🔍 100% 🔍 ⛶]               │              │
│        │                                      │              │
│ SAT    │         [───── MiniMap ─────]        │              │
│ Example│                                      │              │
└────────┴──────────────────────────────────────┴──────────────┘
```

### Component Details

#### LeftPanel
- **Section Card** — Click/drag to add a unit node to the canvas
- **Group Card** — Click/drag to add an assessment/group node
- **How it works** — Step-by-step usage guide
- **Example: SAT Adaptive Test** — Visual hierarchy showing Math Module 1 → Math Module 2 (Group) with Easy/Advanced conditional branches

#### BuilderCanvas
- **React Flow** canvas with snap-to-grid (15×15)
- **4 Custom Node Types**: StartNode (green), UnitNode (blue), AssessmentNode (purple dashed), EndNode (gray)
- **Custom Zoom Controls**: Zoom out, percentage display, zoom in, fit-to-view
- **MiniMap** in bottom-right corner
- **Drag-and-drop** from left panel onto canvas
- **Click-to-connect** via node handles

#### PropertiesPanel
- **Empty State**: Shows "Select a node or edge" with dashed circle icon
- **Node Selected**: Shows label, description, section details (questions/duration), difficulty selector, and assessment config (max/passing score)
- **Edge Selected**: Shows condition builder with metric, operator, threshold, and AND/OR logic
- **Delete**: Trash icon button to remove selected node/edge
- **Assignment Conditions**: Yellow-highlighted condition previews

#### TopBar
- **Builder/Preview** tab toggle
- **New** — Reset canvas with fresh Start/End nodes
- **Load** — Modal to select previously saved learning paths
- **Save Draft** — Persist current canvas state to backend
- **Publish** — Save with "published" status

---

## State Management (Zustand)

The `canvasStore` manages all application state in a single Zustand store:

### State Shape
```typescript
interface CanvasStore {
  // Graph data
  nodes: Node<NodeData>[];
  edges: Edge<EdgeData>[];

  // Selection
  selectedNodeId: string | null;
  selectedEdgeId: string | null;

  // Path metadata
  pathName: string;
  pathDescription: string;
  pathStatus: 'draft' | 'published';
  pathId: string | null;
}
```

### Key Actions
| Action             | Description                                     |
|-------------------|--------------------------------------------------|
| `addNode()`       | Add a new node to the canvas                     |
| `removeNode()`    | Remove node + connected edges, clear selection   |
| `updateNodeData()`| Merge partial data into an existing node         |
| `setEdges()`      | Replace all edges                                |
| `updateEdgeData()`| Merge partial data into an existing edge         |
| `removeEdge()`    | Remove edge and clear selection                  |
| `onConnect()`     | Handle new edge connections with default data    |
| `toSavePayload()` | Serialize store → `LearningPathPayload` for API  |
| `loadFromPayload()`| Deserialize API response → store                |

---

## Type System

All types are defined in `src/types/learningPath.ts` and match the provided JSON schemas:

| Type                | Description                                    |
|--------------------|------------------------------------------------|
| `NodeType`         | `'start' \| 'unit' \| 'assessment' \| 'end'`  |
| `PathStatus`       | `'draft' \| 'published'`                       |
| `MetricType`       | 6 metrics: completion, passed, score, etc.     |
| `OperatorType`     | 7 operators: eq, ne, gt, gte, lt, lte, between|
| `LearningNode`     | Node with position, config, component ID       |
| `Rule`             | Conditional rule with metric + operator + value|
| `Conditions`       | AND/OR group of rules                          |
| `LearningEdge`     | Edge with conditions, priority, isDefault      |
| `LearningPathPayload` | Complete save/load schema                  |

---

## API Client

Located in `src/api/apiClient.ts`, provides 4 typed methods:

```typescript
fetchComponents()     → GET    /api/components
saveLearningPath()    → POST   /api/learning-paths
loadLearningPath(id)  → GET    /api/learning-paths/{id}
listLearningPaths()   → GET    /api/learning-paths
```

Base URL: `http://localhost:8080/api`

---

## Running

### Development Server
```bash
cd frontend
npm install
npm run dev
```
Opens at **http://localhost:5173**

### Type Check
```bash
npx tsc --noEmit
```

### Lint
```bash
npx eslint src/ --ext .ts,.tsx
```

### Run Tests
```bash
npx vitest run
```

### Build for Production
```bash
npm run build
```
Output goes to `dist/` directory.

---

## Test Suite (45 Tests)

| Test File                  | Tests | Coverage Area                              |
|---------------------------|-------|--------------------------------------------|
| `canvasStore.test.ts`     | 24    | Node CRUD, edge CRUD, selection, metadata, save/load round-trip |
| `types.test.ts`           | 11    | Type contracts for all schema shapes       |
| `idGenerator.test.ts`     | 10    | UUID generation, format validation, uniqueness |

---

## Custom Node Types

| Node Type        | Color  | Border Style | Badge  | Handles     |
|-----------------|--------|-------------|--------|-------------|
| `StartNode`     | Green  | Solid       | —      | Bottom only |
| `UnitNode`      | Blue   | Solid       | —      | Top + Bottom|
| `AssessmentNode`| Purple | **Dashed**  | "Group"| Top + Bottom|
| `EndNode`       | Gray   | Solid       | —      | Top only    |

---

## Design Tokens (index.css)

The global design system is defined in `src/index.css`:

- **Font**: System font stack (`-apple-system`, `BlinkMacSystemFont`, `Segoe UI`, etc.)
- **Primary**: Indigo `#4F46E5`
- **Success**: Green `#10B981`
- **Info**: Blue `#3B82F6`
- **Warning**: Purple `#8B5CF6`
- **Neutral**: Slate palette (`#1e293b` → `#f8fafc`)
- **Border Radius**: `12px` for cards, `8px` for inputs, `10px` for controls
