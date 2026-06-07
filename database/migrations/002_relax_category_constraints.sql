-- ============================================================
--  PAPLU PHYSICS — Migration 002: Relax category constraints
--  Run in Supabase SQL Editor → Run
-- ============================================================
--
--  The categories table was seeded with three hardcoded CHECK
--  constraints that only accept specific values for class_level,
--  subject, and section. This migration drops those constraints so
--  the admin can create categories for any class (e.g. "8th", "JEE"),
--  any subject (e.g. "Chemistry", "Biology"), and any exam type.
--
--  The columns remain TEXT — only the restriction is lifted.
--  No existing data is changed.
-- ============================================================

ALTER TABLE categories DROP CONSTRAINT IF EXISTS categories_class_level_check;
ALTER TABLE categories DROP CONSTRAINT IF EXISTS categories_subject_check;
ALTER TABLE categories DROP CONSTRAINT IF EXISTS categories_section_check;
