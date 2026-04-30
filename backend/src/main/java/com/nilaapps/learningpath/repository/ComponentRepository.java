package com.nilaapps.learningpath.repository;

import com.nilaapps.learningpath.model.Component;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ComponentRepository extends JpaRepository<Component, String> {
}
