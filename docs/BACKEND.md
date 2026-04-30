# Backend Documentation

## Overview

The backend is a **Java 17 + Spring Boot 3.2.5** REST API that serves content components and manages learning path persistence. It uses an **H2 in-memory database** for zero-config storage, storing learning path graphs as JSON blobs for maximum flexibility.

---

## Tech Stack

| Technology              | Version | Purpose                                    |
|------------------------|---------|---------------------------------------------|
| Java                   | 17      | Runtime                                     |
| Spring Boot            | 3.2.5   | Application framework                       |
| Spring Data JPA        | 3.2.x   | ORM / Repository pattern                    |
| Hibernate              | 6.x     | JPA implementation                          |
| H2 Database            | 2.x     | Embedded in-memory SQL database             |
| Jackson                | 2.x     | JSON serialization/deserialization           |
| Maven                  | 3.8+    | Build tool & dependency management          |
| JUnit 5 + MockMvc      | 5.10    | Testing framework                           |

---

## Package Structure

```
backend/src/main/java/com/nilaapps/learningpath/
├── LearningPathApplication.java     # Spring Boot entry point
├── config/
│   └── CorsConfig.java              # CORS configuration for frontend
├── controller/
│   ├── ComponentController.java     # GET /api/components
│   └── LearningPathController.java  # CRUD for learning paths
├── dto/
│   ├── ComponentDto.java            # Component data transfer object
│   └── ComponentListResponse.java   # Wrapper for component list
├── exception/
│   ├── GlobalExceptionHandler.java  # Centralized error handling
│   └── ResourceNotFoundException.java # 404 exception class
├── model/
│   ├── Component.java               # JPA entity: content component
│   └── LearningPath.java            # JPA entity: saved learning path
├── repository/
│   ├── ComponentRepository.java     # Spring Data repo for components
│   └── LearningPathRepository.java  # Spring Data repo for paths
└── service/
    ├── ComponentService.java        # Business logic for components
    └── LearningPathService.java     # Business logic for paths
```

---

## Entity Models

### Component Entity

Represents a draggable content module (unit or assessment) available in the left panel.

| Column                        | Type    | Description                            |
|------------------------------|---------|----------------------------------------|
| `id`                         | String  | Primary key (e.g., `cmp-assess-math-1`)|
| `title`                      | String  | Display title                          |
| `short_description`          | String  | Brief description (max 280 chars)      |
| `type`                       | String  | `"unit"` or `"assessment"`             |
| `approximate_duration_minutes`| Integer | Estimated completion time              |
| `max_score`                  | Integer | Assessment-only: maximum score         |
| `passing_score`              | Integer | Assessment-only: passing threshold     |
| `recommended_minutes`        | Integer | Unit-only: recommended study time      |

### LearningPath Entity

Stores a saved learning path with its full graph state serialized as a JSON blob.

| Column        | Type    | Description                                  |
|--------------|---------|----------------------------------------------|
| `id`         | String  | Primary key (e.g., `lp-abc12345`)            |
| `name`       | String  | Path display name                            |
| `description`| String  | Optional description                         |
| `status`     | String  | `"draft"` or `"published"`                   |
| `version`    | Integer | Schema version number                        |
| `payload`    | CLOB    | Full JSON blob (nodes, edges, canvas state)  |
| `created_at` | Long    | Unix timestamp of creation                   |
| `updated_at` | Long    | Unix timestamp of last update                |

---

## Services

### ComponentService

- **`getAllComponents()`** — Fetches all components from the database, maps them to DTOs, and returns a `ComponentListResponse` with items and total count.

### LearningPathService

- **`saveLearningPath(String json)`** — Parses the incoming JSON, extracts/generates an ID, persists the entity, and returns a confirmation response.
- **`getLearningPath(String id)`** — Loads a path by ID, parses the JSON payload, and returns the full graph state. Throws `ResourceNotFoundException` for missing IDs.
- **`listLearningPaths()`** — Returns all saved paths as a JSON array with metadata only (id, name, description, status, version).

---

## Configuration

### CORS (`CorsConfig.java`)

Allows requests from `http://localhost:5173` (Vite dev server) with all standard HTTP methods.

### Database (`application.properties`)

```properties
spring.datasource.url=jdbc:h2:mem:learningpathdb
spring.datasource.driver-class-name=org.h2.Driver
spring.jpa.hibernate.ddl-auto=update
spring.h2.console.enabled=true
```

- **H2 Console**: Available at `http://localhost:8080/h2-console`
- **JDBC URL**: `jdbc:h2:mem:learningpathdb`
- **Username**: `sa` / **Password**: (empty)

### Seed Data (`data.sql`)

10 content components are automatically loaded on startup via `src/main/resources/data.sql`. This includes 4 assessments and 6 units covering Math, Reading & Comprehension, Science, and Writing modules.

---

## Error Handling

The `GlobalExceptionHandler` provides consistent error responses:

```json
{
  "error": "Not Found",
  "message": "Learning path not found with id: xyz",
  "timestamp": "2026-04-30T12:00:00Z"
}
```

| HTTP Status | When                                      |
|------------|-------------------------------------------|
| 200 OK     | Successful GET requests                   |
| 201 Created| Successful POST (save) requests           |
| 404 Not Found | Path ID doesn't exist                  |
| 500 Internal Server Error | Unexpected errors           |

---

## Running

### Start the Server
```bash
cd backend
mvn spring-boot:run
```

### Run Tests
```bash
cd backend
mvn clean test
```

### Build JAR
```bash
cd backend
mvn clean package -DskipTests
java -jar target/learning-path-builder-0.0.1-SNAPSHOT.jar
```

---

## Test Suite (46 Tests)

| Test Class                                   | Tests | Coverage Area                              |
|---------------------------------------------|-------|--------------------------------------------|
| `ComponentControllerTest$GetAllComponents`   | 10    | GET /api/components schema validation      |
| `ComponentControllerTest$InvalidMethods`     | 1     | POST /api/components returns 405           |
| `LearningPathControllerTest$SaveLearningPath`| 6     | Save, auto-ID, update, published status    |
| `LearningPathControllerTest$LoadLearningPath`| 7     | Load, round-trip, 404, config preservation |
| `LearningPathControllerTest$ListLearningPaths`| 3    | List all, metadata fields                  |
| `LearningPathControllerTest$EdgeCases`       | 5     | Empty arrays, score ranges, multi-rules    |
| `ComponentServiceTest`                       | 6     | Service layer, type counts, metadata       |
| `LearningPathServiceTest`                    | 8     | Save/load/list, ID generation, exceptions  |

---

## Production Deployment

To switch from H2 to PostgreSQL for production:

```properties
# application.properties
spring.datasource.url=jdbc:postgresql://localhost:5432/learningpathdb
spring.datasource.driver-class-name=org.postgresql.Driver
spring.datasource.username=postgres
spring.datasource.password=your_password
spring.jpa.hibernate.ddl-auto=update
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect
```

Add PostgreSQL dependency to `pom.xml`:
```xml
<dependency>
    <groupId>org.postgresql</groupId>
    <artifactId>postgresql</artifactId>
    <scope>runtime</scope>
</dependency>
```
