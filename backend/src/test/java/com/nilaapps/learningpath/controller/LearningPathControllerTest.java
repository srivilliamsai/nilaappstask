package com.nilaapps.learningpath.controller;

import com.jayway.jsonpath.JsonPath;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.MethodOrderer;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.hasSize;

@SpringBootTest
@AutoConfigureMockMvc
@DisplayName("Learning Path Controller Tests")
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class LearningPathControllerTest {

    @Autowired
    private MockMvc mockMvc;

    // ─── Shared Payloads ───────────────────────────────────

    private static final String MINIMAL_PATH = """
            {
              "name": "Minimal Path",
              "status": "draft",
              "version": 1,
              "nodes": [],
              "edges": []
            }
            """;

    private static final String FULL_PATH = """
            {
              "name": "Full SAT Adaptive Path",
              "description": "Complete adaptive path with conditional logic",
              "status": "draft",
              "version": 1,
              "canvas": { "zoom": 0.75, "offsetX": -50, "offsetY": 20 },
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
                  "label": "Math Module 1 Assessment",
                  "description": "Initial math diagnostic",
                  "position": { "x": 420, "y": 180 },
                  "config": {
                    "approximateDurationMinutes": 35,
                    "assessment": { "maxScore": 100, "passingScore": 50 }
                  }
                },
                {
                  "id": "node-math-easy",
                  "componentId": "cmp-unit-math-2-easy",
                  "type": "unit",
                  "label": "Math Easy Track",
                  "position": { "x": 250, "y": 350 }
                },
                {
                  "id": "node-math-advanced",
                  "componentId": "cmp-unit-math-2-advanced",
                  "type": "unit",
                  "label": "Math Advanced Track",
                  "position": { "x": 600, "y": 350 }
                },
                {
                  "id": "node-end",
                  "componentId": "system-end",
                  "type": "end",
                  "label": "Complete",
                  "position": { "x": 420, "y": 500 }
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
                  "conditions": { "operator": "AND", "rules": [] }
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
                },
                {
                  "id": "edge-math1-advanced",
                  "sourceNodeId": "node-math-1",
                  "targetNodeId": "node-math-advanced",
                  "label": "Score 50 or above",
                  "priority": 2,
                  "isDefault": false,
                  "conditions": {
                    "operator": "AND",
                    "rules": [
                      {
                        "id": "rule-2",
                        "sourceType": "assessment",
                        "sourceNodeId": "node-math-1",
                        "metric": "score",
                        "operator": "gte",
                        "value": 50
                      }
                    ]
                  }
                }
              ]
            }
            """;

    private static final String PATH_WITH_ID = """
            {
              "id": "lp-test-fixed-id",
              "name": "Fixed ID Path",
              "description": "Path with a predefined ID",
              "status": "draft",
              "version": 1,
              "nodes": [
                { "id": "n1", "componentId": "system-start", "type": "start", "label": "Start", "position": { "x": 100, "y": 50 } }
              ],
              "edges": []
            }
            """;

    // ─── POST /api/learning-paths ───────────────────────────

    @Nested
    @DisplayName("POST /api/learning-paths — Save Learning Path")
    @TestMethodOrder(MethodOrderer.OrderAnnotation.class)
    class SaveLearningPath {

        @Test
        @Order(1)
        @DisplayName("Should save a minimal path and return 201 Created")
        void savingMinimalPath_shouldReturn201() throws Exception {
            mockMvc.perform(post("/api/learning-paths")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(MINIMAL_PATH))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.id").isString())
                    .andExpect(jsonPath("$.name").value("Minimal Path"))
                    .andExpect(jsonPath("$.status").value("draft"))
                    .andExpect(jsonPath("$.message").value("Learning path saved successfully"));
        }

        @Test
        @Order(2)
        @DisplayName("Should auto-generate an ID when none is provided")
        void shouldAutoGenerateId() throws Exception {
            MvcResult result = mockMvc.perform(post("/api/learning-paths")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(MINIMAL_PATH))
                    .andExpect(status().isCreated())
                    .andReturn();

            String id = JsonPath.read(result.getResponse().getContentAsString(), "$.id");
            Assertions.assertTrue(id.startsWith("lp-"), "Auto-generated ID should start with 'lp-'");
        }

        @Test
        @Order(3)
        @DisplayName("Should use provided ID when one exists in payload")
        void shouldUseProvidedId() throws Exception {
            mockMvc.perform(post("/api/learning-paths")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(PATH_WITH_ID))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.id").value("lp-test-fixed-id"));
        }

        @Test
        @Order(4)
        @DisplayName("Should save a full path with nodes, edges, and conditions")
        void savingFullPath_shouldReturn201() throws Exception {
            String pathWithUniqueId = FULL_PATH.replace(
                    "\"name\": \"Full SAT Adaptive Path\"",
                    "\"id\": \"lp-full-test-001\", \"name\": \"Full SAT Adaptive Path\""
            );

            mockMvc.perform(post("/api/learning-paths")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(pathWithUniqueId))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.id").value("lp-full-test-001"))
                    .andExpect(jsonPath("$.name").value("Full SAT Adaptive Path"));
        }

        @Test
        @Order(5)
        @DisplayName("Should update existing path when same ID is reused")
        void shouldUpdateExistingPath() throws Exception {
            String original = """
                    {
                      "id": "lp-update-test",
                      "name": "Original Name",
                      "status": "draft",
                      "version": 1,
                      "nodes": [],
                      "edges": []
                    }
                    """;
            String updated = """
                    {
                      "id": "lp-update-test",
                      "name": "Updated Name",
                      "status": "published",
                      "version": 2,
                      "nodes": [],
                      "edges": []
                    }
                    """;

            mockMvc.perform(post("/api/learning-paths")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(original))
                    .andExpect(status().isCreated());

            mockMvc.perform(post("/api/learning-paths")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(updated))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.name").value("Updated Name"))
                    .andExpect(jsonPath("$.status").value("published"));

            // Verify the update persisted
            mockMvc.perform(get("/api/learning-paths/lp-update-test"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.name").value("Updated Name"))
                    .andExpect(jsonPath("$.status").value("published"))
                    .andExpect(jsonPath("$.version").value(2));
        }

        @Test
        @Order(6)
        @DisplayName("Should save published status correctly")
        void shouldSavePublishedStatus() throws Exception {
            String publishedPath = """
                    {
                      "id": "lp-published-test",
                      "name": "Published Path",
                      "status": "published",
                      "version": 1,
                      "nodes": [],
                      "edges": []
                    }
                    """;

            mockMvc.perform(post("/api/learning-paths")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(publishedPath))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.status").value("published"));
        }
    }

    // ─── GET /api/learning-paths/{id} ───────────────────────

    @Nested
    @DisplayName("GET /api/learning-paths/{id} — Load Learning Path")
    @TestMethodOrder(MethodOrderer.OrderAnnotation.class)
    class LoadLearningPath {

        @Test
        @Order(1)
        @DisplayName("Should return 404 for non-existent path")
        void nonExistentPath_shouldReturn404() throws Exception {
            mockMvc.perform(get("/api/learning-paths/does-not-exist"))
                    .andExpect(status().isNotFound())
                    .andExpect(jsonPath("$.error").value("Not Found"))
                    .andExpect(jsonPath("$.message").isString())
                    .andExpect(jsonPath("$.timestamp").isString());
        }

        @Test
        @Order(2)
        @DisplayName("Round-trip: Save then load should preserve all node data")
        void roundTrip_shouldPreserveNodes() throws Exception {
            String path = FULL_PATH.replace(
                    "\"name\": \"Full SAT Adaptive Path\"",
                    "\"id\": \"lp-roundtrip-nodes\", \"name\": \"Roundtrip Nodes Test\""
            );

            mockMvc.perform(post("/api/learning-paths")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(path))
                    .andExpect(status().isCreated());

            mockMvc.perform(get("/api/learning-paths/lp-roundtrip-nodes"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.name").value("Roundtrip Nodes Test"))
                    .andExpect(jsonPath("$.nodes").isArray())
                    .andExpect(jsonPath("$.nodes", hasSize(5)))
                    .andExpect(jsonPath("$.nodes[0].id").value("node-start"))
                    .andExpect(jsonPath("$.nodes[0].type").value("start"))
                    .andExpect(jsonPath("$.nodes[0].position.x").value(420))
                    .andExpect(jsonPath("$.nodes[0].position.y").value(60));
        }

        @Test
        @Order(3)
        @DisplayName("Round-trip: Should preserve edge data and conditions")
        void roundTrip_shouldPreserveEdges() throws Exception {
            String path = FULL_PATH.replace(
                    "\"name\": \"Full SAT Adaptive Path\"",
                    "\"id\": \"lp-roundtrip-edges\", \"name\": \"Roundtrip Edges Test\""
            );

            mockMvc.perform(post("/api/learning-paths")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(path))
                    .andExpect(status().isCreated());

            mockMvc.perform(get("/api/learning-paths/lp-roundtrip-edges"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.edges").isArray())
                    .andExpect(jsonPath("$.edges", hasSize(3)))
                    .andExpect(jsonPath("$.edges[0].sourceNodeId").value("node-start"))
                    .andExpect(jsonPath("$.edges[0].targetNodeId").value("node-math-1"))
                    .andExpect(jsonPath("$.edges[0].isDefault").value(true))
                    .andExpect(jsonPath("$.edges[0].conditions.operator").value("AND"))
                    .andExpect(jsonPath("$.edges[0].conditions.rules").isArray());
        }

        @Test
        @Order(4)
        @DisplayName("Round-trip: Should preserve conditional rules with metric and value")
        void roundTrip_shouldPreserveConditionalRules() throws Exception {
            String path = FULL_PATH.replace(
                    "\"name\": \"Full SAT Adaptive Path\"",
                    "\"id\": \"lp-roundtrip-rules\", \"name\": \"Roundtrip Rules Test\""
            );

            mockMvc.perform(post("/api/learning-paths")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(path))
                    .andExpect(status().isCreated());

            mockMvc.perform(get("/api/learning-paths/lp-roundtrip-rules"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.edges[1].conditions.rules[0].metric").value("score"))
                    .andExpect(jsonPath("$.edges[1].conditions.rules[0].operator").value("lt"))
                    .andExpect(jsonPath("$.edges[1].conditions.rules[0].value").value(50))
                    .andExpect(jsonPath("$.edges[1].conditions.rules[0].sourceType").value("assessment"))
                    .andExpect(jsonPath("$.edges[1].conditions.rules[0].sourceNodeId").value("node-math-1"));
        }

        @Test
        @Order(5)
        @DisplayName("Round-trip: Should preserve canvas state (zoom, offset)")
        void roundTrip_shouldPreserveCanvasState() throws Exception {
            String path = FULL_PATH.replace(
                    "\"name\": \"Full SAT Adaptive Path\"",
                    "\"id\": \"lp-roundtrip-canvas\", \"name\": \"Roundtrip Canvas Test\""
            );

            mockMvc.perform(post("/api/learning-paths")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(path))
                    .andExpect(status().isCreated());

            mockMvc.perform(get("/api/learning-paths/lp-roundtrip-canvas"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.canvas.zoom").value(0.75))
                    .andExpect(jsonPath("$.canvas.offsetX").value(-50))
                    .andExpect(jsonPath("$.canvas.offsetY").value(20));
        }

        @Test
        @Order(6)
        @DisplayName("Round-trip: Should preserve node config (duration, assessment)")
        void roundTrip_shouldPreserveNodeConfig() throws Exception {
            String path = FULL_PATH.replace(
                    "\"name\": \"Full SAT Adaptive Path\"",
                    "\"id\": \"lp-roundtrip-config\", \"name\": \"Roundtrip Config Test\""
            );

            mockMvc.perform(post("/api/learning-paths")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(path))
                    .andExpect(status().isCreated());

            mockMvc.perform(get("/api/learning-paths/lp-roundtrip-config"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.nodes[1].config.approximateDurationMinutes").value(35))
                    .andExpect(jsonPath("$.nodes[1].config.assessment.maxScore").value(100))
                    .andExpect(jsonPath("$.nodes[1].config.assessment.passingScore").value(50));
        }

        @Test
        @Order(7)
        @DisplayName("Content-Type should be application/json")
        void shouldReturnJson() throws Exception {
            // Save first
            mockMvc.perform(post("/api/learning-paths")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(PATH_WITH_ID))
                    .andExpect(status().isCreated());

            mockMvc.perform(get("/api/learning-paths/lp-test-fixed-id"))
                    .andExpect(status().isOk())
                    .andExpect(content().contentTypeCompatibleWith("application/json"));
        }
    }

    // ─── GET /api/learning-paths — List All ───────────────

    @Nested
    @DisplayName("GET /api/learning-paths — List All Paths")
    class ListLearningPaths {

        @Test
        @DisplayName("Should return an array")
        void shouldReturnArray() throws Exception {
            mockMvc.perform(get("/api/learning-paths"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$").isArray());
        }

        @Test
        @DisplayName("List should include saved paths after saving one")
        void shouldIncludeSavedPaths() throws Exception {
            String path = """
                    {
                      "id": "lp-list-verify",
                      "name": "List Verify Path",
                      "status": "draft",
                      "version": 1,
                      "nodes": [],
                      "edges": []
                    }
                    """;

            mockMvc.perform(post("/api/learning-paths")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(path))
                    .andExpect(status().isCreated());

            mockMvc.perform(get("/api/learning-paths"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$[?(@.id=='lp-list-verify')].name",
                            hasItem("List Verify Path")))
                    .andExpect(jsonPath("$[?(@.id=='lp-list-verify')].status",
                            hasItem("draft")));
        }

        @Test
        @DisplayName("List items should contain id, name, description, status, version fields")
        void shouldContainMetadataFields() throws Exception {
            String path = """
                    {
                      "id": "lp-list-fields",
                      "name": "Fields Test",
                      "description": "Testing field presence",
                      "status": "published",
                      "version": 3,
                      "nodes": [],
                      "edges": []
                    }
                    """;

            mockMvc.perform(post("/api/learning-paths")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(path))
                    .andExpect(status().isCreated());

            mockMvc.perform(get("/api/learning-paths"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$[?(@.id=='lp-list-fields')].name",
                            hasItem("Fields Test")))
                    .andExpect(jsonPath("$[?(@.id=='lp-list-fields')].description",
                            hasItem("Testing field presence")))
                    .andExpect(jsonPath("$[?(@.id=='lp-list-fields')].status",
                            hasItem("published")))
                    .andExpect(jsonPath("$[?(@.id=='lp-list-fields')].version",
                            hasItem(3)));
        }
    }

    // ─── Edge Cases & Error Handling ───────────────────────

    @Nested
    @DisplayName("Edge Cases & Error Handling")
    class EdgeCases {

        @Test
        @DisplayName("Should handle empty nodes and edges arrays")
        void shouldHandleEmptyArrays() throws Exception {
            String emptyPath = """
                    {
                      "id": "lp-empty-arrays",
                      "name": "Empty Path",
                      "status": "draft",
                      "version": 1,
                      "nodes": [],
                      "edges": []
                    }
                    """;

            mockMvc.perform(post("/api/learning-paths")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(emptyPath))
                    .andExpect(status().isCreated());

            mockMvc.perform(get("/api/learning-paths/lp-empty-arrays"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.nodes").isArray())
                    .andExpect(jsonPath("$.nodes", hasSize(0)))
                    .andExpect(jsonPath("$.edges").isArray())
                    .andExpect(jsonPath("$.edges", hasSize(0)));
        }

        @Test
        @DisplayName("Should preserve complex conditional rules with score_range")
        void shouldPreserveScoreRangeRules() throws Exception {
            String pathWithRange = """
                    {
                      "id": "lp-score-range",
                      "name": "Score Range Test",
                      "status": "draft",
                      "version": 1,
                      "nodes": [
                        { "id": "n1", "componentId": "c1", "type": "start", "label": "S", "position": { "x": 0, "y": 0 } },
                        { "id": "n2", "componentId": "c2", "type": "end", "label": "E", "position": { "x": 0, "y": 100 } }
                      ],
                      "edges": [
                        {
                          "id": "e1",
                          "sourceNodeId": "n1",
                          "targetNodeId": "n2",
                          "conditions": {
                            "operator": "OR",
                            "rules": [
                              {
                                "id": "r1",
                                "sourceType": "assessment",
                                "sourceNodeId": "n1",
                                "metric": "score_range",
                                "operator": "between",
                                "range": { "min": 40, "max": 70, "minInclusive": true, "maxInclusive": false }
                              }
                            ]
                          }
                        }
                      ]
                    }
                    """;

            mockMvc.perform(post("/api/learning-paths")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(pathWithRange))
                    .andExpect(status().isCreated());

            mockMvc.perform(get("/api/learning-paths/lp-score-range"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.edges[0].conditions.operator").value("OR"))
                    .andExpect(jsonPath("$.edges[0].conditions.rules[0].metric").value("score_range"))
                    .andExpect(jsonPath("$.edges[0].conditions.rules[0].range.min").value(40))
                    .andExpect(jsonPath("$.edges[0].conditions.rules[0].range.max").value(70))
                    .andExpect(jsonPath("$.edges[0].conditions.rules[0].range.minInclusive").value(true))
                    .andExpect(jsonPath("$.edges[0].conditions.rules[0].range.maxInclusive").value(false));
        }

        @Test
        @DisplayName("Should preserve multiple rules per edge condition")
        void shouldPreserveMultipleRules() throws Exception {
            String pathWithMultipleRules = """
                    {
                      "id": "lp-multi-rules",
                      "name": "Multi Rules Test",
                      "status": "draft",
                      "version": 1,
                      "nodes": [
                        { "id": "n1", "componentId": "c1", "type": "start", "label": "S", "position": { "x": 0, "y": 0 } },
                        { "id": "n2", "componentId": "c2", "type": "end", "label": "E", "position": { "x": 0, "y": 100 } }
                      ],
                      "edges": [
                        {
                          "id": "e1",
                          "sourceNodeId": "n1",
                          "targetNodeId": "n2",
                          "conditions": {
                            "operator": "AND",
                            "rules": [
                              { "id": "r1", "sourceType": "assessment", "sourceNodeId": "n1", "metric": "completion", "operator": "eq", "value": true },
                              { "id": "r2", "sourceType": "assessment", "sourceNodeId": "n1", "metric": "score", "operator": "gte", "value": 70 },
                              { "id": "r3", "sourceType": "assessment", "sourceNodeId": "n1", "metric": "time_spent_minutes", "operator": "lte", "value": 30 }
                            ]
                          }
                        }
                      ]
                    }
                    """;

            mockMvc.perform(post("/api/learning-paths")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(pathWithMultipleRules))
                    .andExpect(status().isCreated());

            mockMvc.perform(get("/api/learning-paths/lp-multi-rules"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.edges[0].conditions.rules", hasSize(3)))
                    .andExpect(jsonPath("$.edges[0].conditions.rules[0].metric").value("completion"))
                    .andExpect(jsonPath("$.edges[0].conditions.rules[1].metric").value("score"))
                    .andExpect(jsonPath("$.edges[0].conditions.rules[2].metric").value("time_spent_minutes"));
        }

        @Test
        @DisplayName("Should handle path without description field")
        void shouldHandleMissingDescription() throws Exception {
            String noDesc = """
                    {
                      "id": "lp-no-desc",
                      "name": "No Description",
                      "status": "draft",
                      "version": 1,
                      "nodes": [],
                      "edges": []
                    }
                    """;

            mockMvc.perform(post("/api/learning-paths")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(noDesc))
                    .andExpect(status().isCreated());

            mockMvc.perform(get("/api/learning-paths/lp-no-desc"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.name").value("No Description"));
        }

        @Test
        @DisplayName("Should handle path with long description")
        void shouldHandleLongDescription() throws Exception {
            String longDesc = "A".repeat(500);
            String path = """
                    {
                      "id": "lp-long-desc",
                      "name": "Long Description Path",
                      "description": "%s",
                      "status": "draft",
                      "version": 1,
                      "nodes": [],
                      "edges": []
                    }
                    """.formatted(longDesc);

            mockMvc.perform(post("/api/learning-paths")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(path))
                    .andExpect(status().isCreated());

            mockMvc.perform(get("/api/learning-paths/lp-long-desc"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.description").value(longDesc));
        }
    }
}
