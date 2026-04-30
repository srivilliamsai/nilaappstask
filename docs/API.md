# API Documentation

## Base URL

```
http://localhost:8080/api
```

---

## Endpoints

### 1. Get All Components

Fetches all available content components that can be dragged onto the learning path canvas.

```
GET /api/components
```

#### Response — `200 OK`

```json
{
  "items": [
    {
      "id": "cmp-assess-math-1",
      "title": "Math Module 1 Assessment",
      "shortDescription": "Baseline math diagnostic used to route learners into adaptive paths.",
      "type": "assessment",
      "approximateDurationMinutes": 35,
      "metadata": {
        "assessment": {
          "maxScore": 100,
          "passingScore": 50
        }
      }
    },
    {
      "id": "cmp-unit-math-2-easy",
      "title": "Math Module 2 - Easy",
      "shortDescription": "Foundational math remediation unit covering basic concepts.",
      "type": "unit",
      "approximateDurationMinutes": 35,
      "metadata": {
        "unit": {
          "recommendedMinutes": 35
        }
      }
    }
  ],
  "totalCount": 10
}
```

#### Response Schema

| Field                  | Type    | Description                               |
|-----------------------|---------|-------------------------------------------|
| `items`               | Array   | Array of component objects                |
| `items[].id`          | String  | Unique component identifier               |
| `items[].title`       | String  | Display title                             |
| `items[].shortDescription` | String | Brief description                    |
| `items[].type`        | String  | `"unit"` or `"assessment"`                |
| `items[].approximateDurationMinutes` | Integer | Estimated time    |
| `items[].metadata`    | Object  | Type-specific metadata                    |
| `totalCount`          | Integer | Total number of components                |

#### cURL Example
```bash
curl -s http://localhost:8080/api/components | jq
```

---

### 2. Save Learning Path

Saves or updates a learning path. If an `id` is provided and exists, the path is updated. If no `id` is provided, one is auto-generated with the prefix `lp-`.

```
POST /api/learning-paths
Content-Type: application/json
```

#### Request Body

```json
{
  "id": "lp-sat-adaptive-001",
  "name": "SAT Adaptive Math Path",
  "description": "Complete adaptive path with conditional logic",
  "status": "draft",
  "version": 1,
  "canvas": {
    "zoom": 0.75,
    "offsetX": -50,
    "offsetY": 20
  },
  "nodes": [
    {
      "id": "node-start",
      "componentId": "system-start",
      "type": "start",
      "label": "Begin Assessment",
      "position": { "x": 420, "y": 60 }
    },
    {
      "id": "node-math-1",
      "componentId": "cmp-assess-math-1",
      "type": "assessment",
      "label": "Math Module 1",
      "description": "Initial math diagnostic",
      "position": { "x": 420, "y": 180 },
      "config": {
        "approximateDurationMinutes": 35,
        "assessment": {
          "maxScore": 100,
          "passingScore": 50
        }
      }
    }
  ],
  "edges": [
    {
      "id": "edge-start-math1",
      "sourceNodeId": "node-start",
      "targetNodeId": "node-math-1",
      "label": "Begin",
      "priority": 1,
      "isDefault": true,
      "conditions": {
        "operator": "AND",
        "rules": []
      }
    },
    {
      "id": "edge-math1-easy",
      "sourceNodeId": "node-math-1",
      "targetNodeId": "node-math-easy",
      "label": "Score below 50",
      "priority": 1,
      "isDefault": false,
      "conditions": {
        "operator": "AND",
        "rules": [
          {
            "id": "rule-1",
            "sourceType": "assessment",
            "sourceNodeId": "node-math-1",
            "metric": "score",
            "operator": "lt",
            "value": 50
          }
        ]
      }
    }
  ]
}
```

#### Request Schema

| Field            | Type    | Required | Description                          |
|-----------------|---------|----------|--------------------------------------|
| `id`            | String  | No       | Auto-generated if missing (`lp-xxx`) |
| `name`          | String  | Yes      | Path display name                    |
| `description`   | String  | No       | Optional description                 |
| `status`        | String  | Yes      | `"draft"` or `"published"`           |
| `version`       | Integer | No       | Schema version (default: 1)          |
| `canvas`        | Object  | No       | Canvas viewport state                |
| `canvas.zoom`   | Number  | No       | Zoom level                           |
| `canvas.offsetX`| Number  | No       | Horizontal pan offset                |
| `canvas.offsetY`| Number  | No       | Vertical pan offset                  |
| `nodes`         | Array   | Yes      | Array of node objects                |
| `edges`         | Array   | Yes      | Array of edge objects                |

#### Node Schema

| Field          | Type    | Required | Description                          |
|---------------|---------|----------|--------------------------------------|
| `id`          | String  | Yes      | Unique node ID                       |
| `componentId` | String  | Yes      | Reference to content component       |
| `type`        | String  | Yes      | `"start"`, `"unit"`, `"assessment"`, `"end"` |
| `label`       | String  | Yes      | Display label                        |
| `description` | String  | No       | Node description                     |
| `position`    | Object  | Yes      | `{ x: number, y: number }`          |
| `config`      | Object  | No       | Type-specific configuration          |

#### Edge Schema

| Field              | Type    | Required | Description                      |
|-------------------|---------|----------|----------------------------------|
| `id`              | String  | Yes      | Unique edge ID                   |
| `sourceNodeId`    | String  | Yes      | Source node ID                   |
| `targetNodeId`    | String  | Yes      | Target node ID                   |
| `label`           | String  | No       | Edge label                       |
| `priority`        | Integer | No       | Evaluation order (lower = first) |
| `isDefault`       | Boolean | No       | Fallback edge when no rules match|
| `conditions`      | Object  | Yes      | Condition group                  |

#### Conditions Schema

| Field        | Type    | Description                              |
|-------------|---------|------------------------------------------|
| `operator`  | String  | `"AND"` or `"OR"`                        |
| `rules`     | Array   | Array of rule objects                    |

#### Rule Schema

| Field          | Type    | Required | Description                          |
|---------------|---------|----------|--------------------------------------|
| `id`          | String  | Yes      | Unique rule ID                       |
| `sourceType`  | String  | Yes      | `"assessment"` or `"unit"`           |
| `sourceNodeId`| String  | Yes      | Node to evaluate                     |
| `metric`      | String  | Yes      | See Supported Metrics below          |
| `operator`    | String  | Yes      | See Comparison Operators below       |
| `value`       | Any     | No*      | Threshold value                      |
| `range`       | Object  | No*      | Range for `between` operator         |

\* One of `value` or `range` is required depending on the operator.

#### Supported Metrics

| Metric                    | Type    | Description                         |
|--------------------------|---------|-------------------------------------|
| `completion`             | Boolean | Whether the source was completed    |
| `passed`                 | Boolean | Whether the learner passed          |
| `score`                  | Number  | Numeric score achieved              |
| `score_range`            | Range   | Score falls within a range          |
| `time_spent_minutes`     | Number  | Time spent in minutes               |
| `percentage_completion`  | Number  | Percentage of content completed     |

#### Comparison Operators

| Operator  | Description            | Example              |
|-----------|------------------------|----------------------|
| `eq`      | Equal to               | `score eq 100`       |
| `ne`      | Not equal to           | `passed ne false`    |
| `gt`      | Greater than           | `score gt 80`        |
| `gte`     | Greater than or equal  | `score gte 50`       |
| `lt`      | Less than              | `score lt 50`        |
| `lte`     | Less than or equal     | `time_spent_minutes lte 30` |
| `between` | Within range           | `score between 40-70`|

#### Response — `201 Created`

```json
{
  "id": "lp-sat-adaptive-001",
  "name": "SAT Adaptive Math Path",
  "status": "draft",
  "message": "Learning path saved successfully"
}
```

#### cURL Example
```bash
curl -X POST http://localhost:8080/api/learning-paths \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Path",
    "status": "draft",
    "version": 1,
    "nodes": [],
    "edges": []
  }'
```

---

### 3. Load Learning Path

Retrieves a saved learning path by its ID, including the complete graph state.

```
GET /api/learning-paths/{id}
```

#### Parameters

| Parameter | Type   | Description                    |
|----------|--------|--------------------------------|
| `id`     | String | Learning path ID (e.g., `lp-sat-adaptive-001`) |

#### Response — `200 OK`

Returns the full learning path payload (same schema as the save request body).

```json
{
  "id": "lp-sat-adaptive-001",
  "name": "SAT Adaptive Math Path",
  "description": "Complete adaptive path",
  "status": "draft",
  "version": 1,
  "canvas": { "zoom": 0.75, "offsetX": -50, "offsetY": 20 },
  "nodes": [...],
  "edges": [...]
}
```

#### Error Response — `404 Not Found`

```json
{
  "error": "Not Found",
  "message": "Learning path not found with id: non-existent-id",
  "timestamp": "2026-04-30T12:00:00Z"
}
```

#### cURL Example
```bash
curl -s http://localhost:8080/api/learning-paths/lp-sat-adaptive-001 | jq
```

---

### 4. List All Learning Paths

Returns a summary of all saved learning paths (metadata only, no graph data).

```
GET /api/learning-paths
```

#### Response — `200 OK`

```json
[
  {
    "id": "lp-sat-adaptive-001",
    "name": "SAT Adaptive Math Path",
    "description": "Complete adaptive path",
    "status": "draft",
    "version": 1
  },
  {
    "id": "lp-reading-001",
    "name": "Reading Comprehension Path",
    "description": "",
    "status": "published",
    "version": 2
  }
]
```

#### Response Item Schema

| Field         | Type    | Description                    |
|--------------|---------|--------------------------------|
| `id`         | String  | Path unique identifier         |
| `name`       | String  | Path display name              |
| `description`| String  | Path description               |
| `status`     | String  | `"draft"` or `"published"`     |
| `version`    | Integer | Schema version number          |

#### cURL Example
```bash
curl -s http://localhost:8080/api/learning-paths | jq
```

---

## Error Responses

All error responses follow this format:

```json
{
  "error": "Error Type",
  "message": "Human-readable description",
  "timestamp": "ISO 8601 datetime"
}
```

| Status Code | Error Type             | When                              |
|------------|------------------------|-----------------------------------|
| 404        | Not Found              | Path ID does not exist            |
| 405        | Method Not Allowed     | Unsupported HTTP method           |
| 400        | Bad Request            | Invalid JSON body                 |
| 500        | Internal Server Error  | Unexpected server failure         |
