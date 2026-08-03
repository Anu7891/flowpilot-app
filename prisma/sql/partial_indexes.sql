-- Optional live-row partial indexes (run once: npm run db:indexes)
-- These serve hot queries while excluding soft-deleted rows.
CREATE INDEX IF NOT EXISTS tasks_board_live_idx
  ON tasks (project_id, status, position) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS tasks_assignee_live_idx
  ON tasks (assignee_id, status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS projects_sidebar_live_idx
  ON projects (workspace_id, archived) WHERE deleted_at IS NULL;
