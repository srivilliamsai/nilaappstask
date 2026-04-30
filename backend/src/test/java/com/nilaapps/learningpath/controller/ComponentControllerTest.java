package com.nilaapps.learningpath.controller;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.hamcrest.Matchers.greaterThanOrEqualTo;
import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.notNullValue;

@SpringBootTest
@AutoConfigureMockMvc
@DisplayName("Component Controller Tests")
class ComponentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Nested
    @DisplayName("GET /api/components — List All Components")
    class GetAllComponents {

        @Test
        @DisplayName("Should return HTTP 200 OK")
        void shouldReturnOk() throws Exception {
            mockMvc.perform(get("/api/components"))
                    .andExpect(status().isOk());
        }

        @Test
        @DisplayName("Should return exactly 10 seeded components")
        void shouldReturnAllSeededComponents() throws Exception {
            mockMvc.perform(get("/api/components"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.items").isArray())
                    .andExpect(jsonPath("$.items", hasSize(10)))
                    .andExpect(jsonPath("$.totalCount").value(10));
        }

        @Test
        @DisplayName("Should match available-content.schema.json structure")
        void shouldMatchSchemaStructure() throws Exception {
            mockMvc.perform(get("/api/components"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.items[0].id").isString())
                    .andExpect(jsonPath("$.items[0].title").isString())
                    .andExpect(jsonPath("$.items[0].shortDescription").isString())
                    .andExpect(jsonPath("$.items[0].type").isString())
                    .andExpect(jsonPath("$.items[0].approximateDurationMinutes").isNumber())
                    .andExpect(jsonPath("$.items[0].metadata").exists());
        }

        @Test
        @DisplayName("Should contain both unit and assessment types")
        void shouldContainBothTypes() throws Exception {
            mockMvc.perform(get("/api/components"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.items[?(@.type=='unit')]").isNotEmpty())
                    .andExpect(jsonPath("$.items[?(@.type=='assessment')]").isNotEmpty());
        }

        @Test
        @DisplayName("Assessment components should have maxScore and passingScore metadata")
        void assessmentsShouldHaveAssessmentMetadata() throws Exception {
            mockMvc.perform(get("/api/components"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.items[?(@.type=='assessment')].metadata.assessment.maxScore").exists())
                    .andExpect(jsonPath("$.items[?(@.type=='assessment')].metadata.assessment.passingScore").exists());
        }

        @Test
        @DisplayName("Unit components should have recommendedMinutes metadata")
        void unitsShouldHaveUnitMetadata() throws Exception {
            mockMvc.perform(get("/api/components"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.items[?(@.type=='unit')].metadata.unit.recommendedMinutes").exists());
        }

        @Test
        @DisplayName("Should include specific known component: cmp-assess-math-1")
        void shouldContainMathAssessment() throws Exception {
            mockMvc.perform(get("/api/components"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.items[?(@.id=='cmp-assess-math-1')].title",
                            hasItem("Math Module 1 Assessment")))
                    .andExpect(jsonPath("$.items[?(@.id=='cmp-assess-math-1')].type",
                            hasItem("assessment")))
                    .andExpect(jsonPath("$.items[?(@.id=='cmp-assess-math-1')].approximateDurationMinutes",
                            hasItem(35)));
        }

        @Test
        @DisplayName("Should include specific known component: cmp-unit-math-2-easy")
        void shouldContainMathEasyUnit() throws Exception {
            mockMvc.perform(get("/api/components"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.items[?(@.id=='cmp-unit-math-2-easy')].title",
                            hasItem("Math Module 2 - Easy")))
                    .andExpect(jsonPath("$.items[?(@.id=='cmp-unit-math-2-easy')].type",
                            hasItem("unit")));
        }

        @Test
        @DisplayName("Should include the final assessment with max score 200")
        void shouldContainFinalAssessment() throws Exception {
            mockMvc.perform(get("/api/components"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.items[?(@.id=='cmp-assess-final')].metadata.assessment.maxScore",
                            hasItem(200)))
                    .andExpect(jsonPath("$.items[?(@.id=='cmp-assess-final')].metadata.assessment.passingScore",
                            hasItem(120)));
        }

        @Test
        @DisplayName("Content-Type should be application/json")
        void shouldReturnJson() throws Exception {
            mockMvc.perform(get("/api/components"))
                    .andExpect(status().isOk())
                    .andExpect(content().contentTypeCompatibleWith("application/json"));
        }
    }

    @Nested
    @DisplayName("Invalid methods on /api/components")
    class InvalidMethods {

        @Test
        @DisplayName("POST /api/components should return 405 Method Not Allowed")
        void postShouldReturn405() throws Exception {
            mockMvc.perform(post("/api/components")
                            .content("{}").contentType("application/json"))
                    .andExpect(status().isMethodNotAllowed());
        }
    }
}
