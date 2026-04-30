package com.nilaapps.learningpath.service;

import com.nilaapps.learningpath.dto.ComponentDto;
import com.nilaapps.learningpath.dto.ComponentListResponse;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
@DisplayName("Component Service Tests")
class ComponentServiceTest {

    @Autowired
    private ComponentService componentService;

    @Test
    @DisplayName("Should return a non-null response")
    void shouldReturnNonNullResponse() {
        ComponentListResponse response = componentService.getAllComponents();
        assertNotNull(response);
        assertNotNull(response.getItems());
    }

    @Test
    @DisplayName("Should return exactly 10 components from seed data")
    void shouldReturn10Components() {
        ComponentListResponse response = componentService.getAllComponents();
        assertEquals(10, response.getItems().size());
        assertEquals(10, response.getTotalCount());
    }

    @Test
    @DisplayName("All components should have required fields populated")
    void allComponentsShouldHaveRequiredFields() {
        ComponentListResponse response = componentService.getAllComponents();
        for (ComponentDto dto : response.getItems()) {
            assertNotNull(dto.getId(), "ID should not be null");
            assertNotNull(dto.getTitle(), "Title should not be null");
            assertNotNull(dto.getShortDescription(), "Short description should not be null");
            assertNotNull(dto.getType(), "Type should not be null");
            assertNotNull(dto.getApproximateDurationMinutes(), "Duration should not be null");
            assertTrue(dto.getType().equals("unit") || dto.getType().equals("assessment"),
                    "Type should be 'unit' or 'assessment', got: " + dto.getType());
        }
    }

    @Test
    @DisplayName("Assessment components should have assessment metadata")
    void assessmentsShouldHaveMetadata() {
        ComponentListResponse response = componentService.getAllComponents();
        response.getItems().stream()
                .filter(dto -> "assessment".equals(dto.getType()))
                .forEach(dto -> {
                    assertNotNull(dto.getMetadata(), "Assessment should have metadata");
                    assertNotNull(dto.getMetadata().getAssessment(), "Assessment should have assessment metadata");
                    assertNotNull(dto.getMetadata().getAssessment().getMaxScore(), "Max score should not be null");
                    assertNotNull(dto.getMetadata().getAssessment().getPassingScore(), "Passing score should not be null");
                    assertTrue(dto.getMetadata().getAssessment().getPassingScore() <= dto.getMetadata().getAssessment().getMaxScore(),
                            "Passing score should be <= max score");
                });
    }

    @Test
    @DisplayName("Unit components should have unit metadata")
    void unitsShouldHaveMetadata() {
        ComponentListResponse response = componentService.getAllComponents();
        response.getItems().stream()
                .filter(dto -> "unit".equals(dto.getType()))
                .forEach(dto -> {
                    assertNotNull(dto.getMetadata(), "Unit should have metadata");
                    assertNotNull(dto.getMetadata().getUnit(), "Unit should have unit metadata");
                    assertNotNull(dto.getMetadata().getUnit().getRecommendedMinutes(), "Recommended minutes should not be null");
                    assertTrue(dto.getMetadata().getUnit().getRecommendedMinutes() > 0,
                            "Recommended minutes should be positive");
                });
    }

    @Test
    @DisplayName("Should have 4 assessment and 6 unit components")
    void shouldHaveCorrectTypeCounts() {
        ComponentListResponse response = componentService.getAllComponents();
        long assessmentCount = response.getItems().stream()
                .filter(dto -> "assessment".equals(dto.getType())).count();
        long unitCount = response.getItems().stream()
                .filter(dto -> "unit".equals(dto.getType())).count();
        assertEquals(4, assessmentCount, "Should have 4 assessments");
        assertEquals(6, unitCount, "Should have 6 units");
    }
}
