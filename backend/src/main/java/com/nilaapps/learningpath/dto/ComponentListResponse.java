package com.nilaapps.learningpath.dto;

import java.util.List;

/**
 * Response wrapper for GET /api/components.
 * Matches available-content.schema.json root shape: { items[], totalCount }
 */
public class ComponentListResponse {

    private List<ComponentDto> items;
    private int totalCount;

    public ComponentListResponse() {}

    public ComponentListResponse(List<ComponentDto> items, int totalCount) {
        this.items = items;
        this.totalCount = totalCount;
    }

    public List<ComponentDto> getItems() { return items; }
    public void setItems(List<ComponentDto> items) { this.items = items; }

    public int getTotalCount() { return totalCount; }
    public void setTotalCount(int totalCount) { this.totalCount = totalCount; }
}
