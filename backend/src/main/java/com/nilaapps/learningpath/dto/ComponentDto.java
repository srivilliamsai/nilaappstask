package com.nilaapps.learningpath.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

/**
 * DTO matching available-content.schema.json component definition.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ComponentDto {

    private String id;
    private String title;
    private String shortDescription;
    private String type;
    private Integer approximateDurationMinutes;
    private MetadataDto metadata;

    // --- Nested classes matching the schema ---

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class MetadataDto {
        private AssessmentMetadataDto assessment;
        private UnitMetadataDto unit;

        public AssessmentMetadataDto getAssessment() { return assessment; }
        public void setAssessment(AssessmentMetadataDto assessment) { this.assessment = assessment; }
        public UnitMetadataDto getUnit() { return unit; }
        public void setUnit(UnitMetadataDto unit) { this.unit = unit; }
    }

    public static class AssessmentMetadataDto {
        private Integer maxScore;
        private Integer passingScore;

        public Integer getMaxScore() { return maxScore; }
        public void setMaxScore(Integer maxScore) { this.maxScore = maxScore; }
        public Integer getPassingScore() { return passingScore; }
        public void setPassingScore(Integer passingScore) { this.passingScore = passingScore; }
    }

    public static class UnitMetadataDto {
        private Integer recommendedMinutes;

        public Integer getRecommendedMinutes() { return recommendedMinutes; }
        public void setRecommendedMinutes(Integer recommendedMinutes) { this.recommendedMinutes = recommendedMinutes; }
    }

    // --- Getters & Setters ---

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getShortDescription() { return shortDescription; }
    public void setShortDescription(String shortDescription) { this.shortDescription = shortDescription; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public Integer getApproximateDurationMinutes() { return approximateDurationMinutes; }
    public void setApproximateDurationMinutes(Integer approximateDurationMinutes) { this.approximateDurationMinutes = approximateDurationMinutes; }

    public MetadataDto getMetadata() { return metadata; }
    public void setMetadata(MetadataDto metadata) { this.metadata = metadata; }
}
