package com.nilaapps.learningpath.controller;

import com.nilaapps.learningpath.dto.ComponentListResponse;
import com.nilaapps.learningpath.service.ComponentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST controller for available content components.
 * GET /api/components → returns all draggable content for the left-side panel.
 */
@RestController
@RequestMapping("/api/components")
public class ComponentController {

    private final ComponentService componentService;

    public ComponentController(ComponentService componentService) {
        this.componentService = componentService;
    }

    @GetMapping
    public ResponseEntity<ComponentListResponse> getAllComponents() {
        return ResponseEntity.ok(componentService.getAllComponents());
    }
}
