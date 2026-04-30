-- Seed data for the Available Content components
-- These populate the left-side panel in the builder UI
-- Using MERGE to avoid duplicate key errors during test context reloads

MERGE INTO components (id, title, short_description, type, approximate_duration_minutes, max_score, passing_score, recommended_minutes) KEY(id) VALUES
('cmp-assess-math-1', 'Math Module 1 Assessment', 'Baseline math diagnostic used to route learners into adaptive paths.', 'assessment', 35, 100, 50, NULL);

MERGE INTO components (id, title, short_description, type, approximate_duration_minutes, max_score, passing_score, recommended_minutes) KEY(id) VALUES
('cmp-unit-math-2-easy', 'Math Module 2 - Easy', 'Foundational math remediation unit covering basic concepts.', 'unit', 35, NULL, NULL, 30);

MERGE INTO components (id, title, short_description, type, approximate_duration_minutes, max_score, passing_score, recommended_minutes) KEY(id) VALUES
('cmp-unit-math-2-advanced', 'Math Module 2 - Advanced', 'Advanced math unit for high-performing learners.', 'unit', 35, NULL, NULL, 30);

MERGE INTO components (id, title, short_description, type, approximate_duration_minutes, max_score, passing_score, recommended_minutes) KEY(id) VALUES
('cmp-assess-reading-1', 'Reading & Comp Module 1', 'Reading comprehension assessment for adaptive routing.', 'assessment', 32, 100, 50, NULL);

MERGE INTO components (id, title, short_description, type, approximate_duration_minutes, max_score, passing_score, recommended_minutes) KEY(id) VALUES
('cmp-unit-reading-2-easy', 'R&C Module 2 - Easy', 'Basic reading comprehension remediation unit.', 'unit', 32, NULL, NULL, 25);

MERGE INTO components (id, title, short_description, type, approximate_duration_minutes, max_score, passing_score, recommended_minutes) KEY(id) VALUES
('cmp-unit-reading-2-advanced', 'R&C Module 2 - Advanced', 'Advanced reading comprehension unit for proficient readers.', 'unit', 32, NULL, NULL, 25);

MERGE INTO components (id, title, short_description, type, approximate_duration_minutes, max_score, passing_score, recommended_minutes) KEY(id) VALUES
('cmp-unit-science-1', 'Science Fundamentals', 'Core science concepts covering physics, chemistry, and biology basics.', 'unit', 40, NULL, NULL, 35);

MERGE INTO components (id, title, short_description, type, approximate_duration_minutes, max_score, passing_score, recommended_minutes) KEY(id) VALUES
('cmp-assess-final', 'Final Comprehensive Assessment', 'End-of-path comprehensive assessment covering all modules.', 'assessment', 60, 200, 120, NULL);

MERGE INTO components (id, title, short_description, type, approximate_duration_minutes, max_score, passing_score, recommended_minutes) KEY(id) VALUES
('cmp-unit-writing-1', 'Writing Skills Workshop', 'Interactive writing skills unit with practice exercises.', 'unit', 45, NULL, NULL, 40);

MERGE INTO components (id, title, short_description, type, approximate_duration_minutes, max_score, passing_score, recommended_minutes) KEY(id) VALUES
('cmp-assess-writing-1', 'Writing Assessment', 'Evaluates grammar, structure, and clarity of written responses.', 'assessment', 30, 80, 40, NULL);
