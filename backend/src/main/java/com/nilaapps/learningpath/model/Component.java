package com.nilaapps.learningpath.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/**
 * JPA entity representing an available content component
 * that can be dragged onto the learning path canvas.
 */
@Entity
@Table(name = "components")
public class Component {

    @Id
    @Column(length = 100)
    private String id;

    @Column(nullable = false, length = 150)
    private String title;

    @Column(name = "short_description", nullable = false, length = 280)
    private String shortDescription;

    @Column(nullable = false, length = 20)
    private String type; // "unit" or "assessment"

    @Column(name = "approximate_duration_minutes", nullable = false)
    private Integer approximateDurationMinutes;

    // Assessment-specific metadata
    @Column(name = "max_score")
    private Integer maxScore;

    @Column(name = "passing_score")
    private Integer passingScore;

    // Unit-specific metadata
    @Column(name = "recommended_minutes")
    private Integer recommendedMinutes;

    public Component() {}

    public Component(String id, String title, String shortDescription, String type,
                     Integer approximateDurationMinutes, Integer maxScore,
                     Integer passingScore, Integer recommendedMinutes) {
        this.id = id;
        this.title = title;
        this.shortDescription = shortDescription;
        this.type = type;
        this.approximateDurationMinutes = approximateDurationMinutes;
        this.maxScore = maxScore;
        this.passingScore = passingScore;
        this.recommendedMinutes = recommendedMinutes;
    }

    // Getters and setters
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

    public Integer getMaxScore() { return maxScore; }
    public void setMaxScore(Integer maxScore) { this.maxScore = maxScore; }

    public Integer getPassingScore() { return passingScore; }
    public void setPassingScore(Integer passingScore) { this.passingScore = passingScore; }

    public Integer getRecommendedMinutes() { return recommendedMinutes; }
    public void setRecommendedMinutes(Integer recommendedMinutes) { this.recommendedMinutes = recommendedMinutes; }
}
