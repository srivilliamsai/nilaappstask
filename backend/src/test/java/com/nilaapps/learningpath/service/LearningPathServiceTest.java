package com.nilaapps.learningpath.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nilaapps.learningpath.exception.ResourceNotFoundException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.MethodOrderer;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.assertThrows;

@SpringBootTest
@DisplayName("Learning Path Service Tests")
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class LearningPathServiceTest {

    @Autowired
    private LearningPathService learningPathService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @Order(1)
    @DisplayName("Should save a learning path and return result with ID")
    void saveShouldReturnResult() {
        String json = """
                {
                  "name": "Service Test Path",
                  "status": "draft",
                  "version": 1,
                  "nodes": [],
                  "edges": []
                }
                """;

        JsonNode result = learningPathService.saveLearningPath(json);
        assertNotNull(result);
        assertTrue(result.has("id"));
        assertEquals("Service Test Path", result.get("name").asText());
        assertEquals("draft", result.get("status").asText());
        assertEquals("Learning path saved successfully", result.get("message").asText());
    }

    @Test
    @Order(2)
    @DisplayName("Should auto-generate ID starting with 'lp-'")
    void shouldAutoGenerateIdPrefix() {
        String json = """
                {
                  "name": "Auto ID Test",
                  "status": "draft",
                  "version": 1,
                  "nodes": [],
                  "edges": []
                }
                """;

        JsonNode result = learningPathService.saveLearningPath(json);
        String id = result.get("id").asText();
        assertTrue(id.startsWith("lp-"), "Auto-generated ID should start with 'lp-', got: " + id);
    }

    @Test
    @Order(3)
    @DisplayName("Should use provided ID when available")
    void shouldUseProvidedId() {
        String json = """
                {
                  "id": "lp-svc-custom-id",
                  "name": "Custom ID Test",
                  "status": "draft",
                  "version": 1,
                  "nodes": [],
                  "edges": []
                }
                """;

        JsonNode result = learningPathService.saveLearningPath(json);
        assertEquals("lp-svc-custom-id", result.get("id").asText());
    }

    @Test
    @Order(4)
    @DisplayName("Should load a saved path with full payload")
    void loadShouldReturnFullPayload() {
        String json = """
                {
                  "id": "lp-svc-load-test",
                  "name": "Load Test Path",
                  "description": "Testing load service",
                  "status": "published",
                  "version": 2,
                  "nodes": [
                    { "id": "n1", "componentId": "c1", "type": "start", "label": "Start", "position": { "x": 100, "y": 200 } }
                  ],
                  "edges": []
                }
                """;

        learningPathService.saveLearningPath(json);
        JsonNode loaded = learningPathService.getLearningPath("lp-svc-load-test");

        assertNotNull(loaded);
        assertEquals("Load Test Path", loaded.get("name").asText());
        assertEquals("Testing load service", loaded.get("description").asText());
        assertEquals("published", loaded.get("status").asText());
        assertEquals(2, loaded.get("version").asInt());
        assertEquals(1, loaded.get("nodes").size());
        assertEquals("Start", loaded.get("nodes").get(0).get("label").asText());
        assertEquals(100, loaded.get("nodes").get(0).get("position").get("x").asInt());
    }

    @Test
    @Order(5)
    @DisplayName("Should throw ResourceNotFoundException for non-existent ID")
    void loadNonExistent_shouldThrow() {
        assertThrows(ResourceNotFoundException.class,
                () -> learningPathService.getLearningPath("non-existent-id"),
                "Should throw ResourceNotFoundException");
    }

    @Test
    @Order(6)
    @DisplayName("Should list all saved paths as array with metadata")
    void listShouldReturnArray() {
        String json = """
                {
                  "id": "lp-svc-list-test",
                  "name": "List Test Path",
                  "description": "For listing",
                  "status": "draft",
                  "version": 1,
                  "nodes": [],
                  "edges": []
                }
                """;

        learningPathService.saveLearningPath(json);
        JsonNode list = learningPathService.listLearningPaths();

        assertNotNull(list);
        assertTrue(list.isArray());
        assertTrue(list.size() > 0);

        // Verify at least one entry has expected fields
        boolean found = false;
        for (JsonNode item : list) {
            if ("lp-svc-list-test".equals(item.get("id").asText())) {
                assertEquals("List Test Path", item.get("name").asText());
                assertEquals("draft", item.get("status").asText());
                assertEquals(1, item.get("version").asInt());
                found = true;
                break;
            }
        }
        assertTrue(found, "Should find the saved path in the list");
    }

    @Test
    @Order(7)
    @DisplayName("Should update existing path when saving with same ID")
    void shouldUpdateExistingPath() {
        String original = """
                {
                  "id": "lp-svc-update",
                  "name": "Original Name",
                  "status": "draft",
                  "version": 1,
                  "nodes": [],
                  "edges": []
                }
                """;
        String updated = """
                {
                  "id": "lp-svc-update",
                  "name": "Updated Name",
                  "status": "published",
                  "version": 2,
                  "nodes": [
                    { "id": "n1", "componentId": "c1", "type": "start", "label": "S", "position": { "x": 0, "y": 0 } }
                  ],
                  "edges": []
                }
                """;

        learningPathService.saveLearningPath(original);
        learningPathService.saveLearningPath(updated);

        JsonNode loaded = learningPathService.getLearningPath("lp-svc-update");
        assertEquals("Updated Name", loaded.get("name").asText());
        assertEquals("published", loaded.get("status").asText());
        assertEquals(2, loaded.get("version").asInt());
        assertEquals(1, loaded.get("nodes").size());
    }

    @Test
    @Order(8)
    @DisplayName("Should handle name defaulting when name is missing")
    void shouldDefaultName() {
        String json = """
                {
                  "id": "lp-svc-no-name",
                  "status": "draft",
                  "version": 1,
                  "nodes": [],
                  "edges": []
                }
                """;

        JsonNode result = learningPathService.saveLearningPath(json);
        assertEquals("Untitled Path", result.get("name").asText());
    }
}
