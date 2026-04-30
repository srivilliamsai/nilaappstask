package com.nilaapps.learningpath.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nilaapps.learningpath.exception.ResourceNotFoundException;
import com.nilaapps.learningpath.model.LearningPath;
import com.nilaapps.learningpath.repository.LearningPathRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class LearningPathService {

    private final LearningPathRepository learningPathRepository;
    private final ObjectMapper objectMapper;

    public LearningPathService(LearningPathRepository learningPathRepository, ObjectMapper objectMapper) {
        this.learningPathRepository = learningPathRepository;
        this.objectMapper = objectMapper;
    }

    /**
     * Saves a learning path. The entire JSON body is stored as-is in the payload column
     * to preserve exact canvas state (positions, zoom, edges, rules).
     * If the payload contains an "id", it performs an update; otherwise creates new.
     */
    public JsonNode saveLearningPath(String jsonBody) {
        try {
            JsonNode root = objectMapper.readTree(jsonBody);

            String id = root.has("id") && !root.get("id").asText().isEmpty()
                    ? root.get("id").asText()
                    : "lp-" + UUID.randomUUID().toString().substring(0, 8);

            String name = root.has("name") ? root.get("name").asText() : "Untitled Path";
            String description = root.has("description") ? root.get("description").asText() : "";
            String status = root.has("status") ? root.get("status").asText() : "draft";
            int version = root.has("version") ? root.get("version").asInt() : 1;

            LearningPath entity = learningPathRepository.findById(id).orElse(new LearningPath());
            entity.setId(id);
            entity.setName(name);
            entity.setDescription(description);
            entity.setStatus(status);
            entity.setVersion(version);
            entity.setPayload(jsonBody);

            learningPathRepository.save(entity);

            // Return the saved payload with the resolved ID
            return objectMapper.readTree(
                    objectMapper.writeValueAsString(
                            objectMapper.createObjectNode()
                                    .put("id", id)
                                    .put("name", name)
                                    .put("status", status)
                                    .put("message", "Learning path saved successfully")
                    )
            );
        } catch (Exception e) {
            throw new RuntimeException("Failed to save learning path: " + e.getMessage(), e);
        }
    }

    /**
     * Loads a learning path by ID. Returns the full JSON payload as-is.
     */
    public JsonNode getLearningPath(String id) {
        LearningPath entity = learningPathRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Learning path not found with id: " + id));
        try {
            return objectMapper.readTree(entity.getPayload());
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse stored learning path: " + e.getMessage(), e);
        }
    }

    /**
     * Lists all saved learning paths (metadata only).
     */
    public JsonNode listLearningPaths() {
        List<LearningPath> paths = learningPathRepository.findAll();
        try {
            var arrayNode = objectMapper.createArrayNode();
            for (LearningPath lp : paths) {
                arrayNode.add(
                        objectMapper.createObjectNode()
                                .put("id", lp.getId())
                                .put("name", lp.getName())
                                .put("description", lp.getDescription())
                                .put("status", lp.getStatus())
                                .put("version", lp.getVersion())
                );
            }
            return arrayNode;
        } catch (Exception e) {
            throw new RuntimeException("Failed to list learning paths: " + e.getMessage(), e);
        }
    }
}
