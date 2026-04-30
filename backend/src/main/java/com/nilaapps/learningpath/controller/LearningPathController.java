package com.nilaapps.learningpath.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.nilaapps.learningpath.service.LearningPathService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST controller for learning path CRUD operations.
 * POST /api/learning-paths      → save a learning path (body matches learning-path.schema.json)
 * GET  /api/learning-paths/{id} → load a previously saved learning path
 * GET  /api/learning-paths      → list all saved learning paths (metadata only)
 */
@RestController
@RequestMapping("/api/learning-paths")
public class LearningPathController {

    private final LearningPathService learningPathService;

    public LearningPathController(LearningPathService learningPathService) {
        this.learningPathService = learningPathService;
    }

    @PostMapping
    public ResponseEntity<JsonNode> saveLearningPath(@RequestBody String body) {
        JsonNode result = learningPathService.saveLearningPath(body);
        return ResponseEntity.status(HttpStatus.CREATED).body(result);
    }

    @GetMapping("/{id}")
    public ResponseEntity<JsonNode> getLearningPath(@PathVariable String id) {
        return ResponseEntity.ok(learningPathService.getLearningPath(id));
    }

    @GetMapping
    public ResponseEntity<JsonNode> listLearningPaths() {
        return ResponseEntity.ok(learningPathService.listLearningPaths());
    }
}
