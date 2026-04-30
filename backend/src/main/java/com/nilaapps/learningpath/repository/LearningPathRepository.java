package com.nilaapps.learningpath.repository;

import com.nilaapps.learningpath.model.LearningPath;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LearningPathRepository extends JpaRepository<LearningPath, String> {
}
