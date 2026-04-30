package com.nilaapps.learningpath.service;

import com.nilaapps.learningpath.dto.ComponentDto;
import com.nilaapps.learningpath.dto.ComponentListResponse;
import com.nilaapps.learningpath.model.Component;
import com.nilaapps.learningpath.repository.ComponentRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ComponentService {

    private final ComponentRepository componentRepository;

    public ComponentService(ComponentRepository componentRepository) {
        this.componentRepository = componentRepository;
    }

    /**
     * Returns all available components formatted to match available-content.schema.json.
     */
    public ComponentListResponse getAllComponents() {
        List<Component> entities = componentRepository.findAll();
        List<ComponentDto> dtos = entities.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
        return new ComponentListResponse(dtos, dtos.size());
    }

    private ComponentDto toDto(Component entity) {
        ComponentDto dto = new ComponentDto();
        dto.setId(entity.getId());
        dto.setTitle(entity.getTitle());
        dto.setShortDescription(entity.getShortDescription());
        dto.setType(entity.getType());
        dto.setApproximateDurationMinutes(entity.getApproximateDurationMinutes());

        // Build metadata based on type
        ComponentDto.MetadataDto metadata = new ComponentDto.MetadataDto();

        if ("assessment".equals(entity.getType()) && entity.getMaxScore() != null) {
            ComponentDto.AssessmentMetadataDto assessmentMeta = new ComponentDto.AssessmentMetadataDto();
            assessmentMeta.setMaxScore(entity.getMaxScore());
            assessmentMeta.setPassingScore(entity.getPassingScore());
            metadata.setAssessment(assessmentMeta);
        }

        if ("unit".equals(entity.getType()) && entity.getRecommendedMinutes() != null) {
            ComponentDto.UnitMetadataDto unitMeta = new ComponentDto.UnitMetadataDto();
            unitMeta.setRecommendedMinutes(entity.getRecommendedMinutes());
            metadata.setUnit(unitMeta);
        }

        dto.setMetadata(metadata);
        return dto;
    }
}
