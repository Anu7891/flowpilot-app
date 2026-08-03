-- FlowPilot Phase 4 — run this in the Neon SQL Editor (branch: production, database: neondb).
-- 100% additive + idempotent: safe to run once or many times, no existing data is touched.
-- Steps: clear the editor (Ctrl+A, Delete), paste ALL of this, click Run.

DO $$ BEGIN CREATE TYPE "InvitationStatus" AS ENUM ('PENDING','ACCEPTED','REJECTED','EXPIRED','REVOKED'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'WORKSPACE_INVITE';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'INVITE_ACCEPTED';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'ROLE_CHANGED';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'MEMBER_REMOVED';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'WORKSPACE_ARCHIVED';

ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "last_active_at" TIMESTAMP(3);
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "last_workspace_id" TEXT;

ALTER TABLE "workspaces" ADD COLUMN IF NOT EXISTS "color" TEXT;
ALTER TABLE "workspaces" ADD COLUMN IF NOT EXISTS "icon" TEXT;
ALTER TABLE "workspaces" ADD COLUMN IF NOT EXISTS "archived_at" TIMESTAMP(3);

CREATE TABLE IF NOT EXISTS "workspace_invitations" (
  "id" TEXT NOT NULL,
  "workspace_id" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "token" TEXT NOT NULL,
  "role" "WorkspaceRole" NOT NULL DEFAULT 'MEMBER',
  "invited_by" TEXT,
  "status" "InvitationStatus" NOT NULL DEFAULT 'PENDING',
  "expires_at" TIMESTAMP(3) NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "workspace_invitations_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "workspace_settings" (
  "workspace_id" TEXT NOT NULL,
  "timezone" TEXT NOT NULL DEFAULT 'UTC',
  "date_format" TEXT NOT NULL DEFAULT 'DD MMM YYYY',
  "default_view" TEXT NOT NULL DEFAULT 'board',
  "notification_prefs" JSONB NOT NULL DEFAULT '{}',
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "workspace_settings_pkey" PRIMARY KEY ("workspace_id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "workspace_invitations_token_key" ON "workspace_invitations"("token");
CREATE INDEX IF NOT EXISTS "workspace_invitations_workspace_id_status_idx" ON "workspace_invitations"("workspace_id","status");
CREATE INDEX IF NOT EXISTS "workspace_invitations_email_status_idx" ON "workspace_invitations"("email","status");

DO $$ BEGIN ALTER TABLE "workspace_invitations" ADD CONSTRAINT "workspace_invitations_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "workspace_invitations" ADD CONSTRAINT "workspace_invitations_invited_by_fkey" FOREIGN KEY ("invited_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "workspace_settings" ADD CONSTRAINT "workspace_settings_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Record the migration so `prisma migrate deploy` treats it as already applied.
INSERT INTO "_prisma_migrations" (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count)
SELECT gen_random_uuid()::text, '0cb134559a504f6b957dad326328bc54bfc90e98ad5ec5f1148a1b315e21125e', now(), '20260713120000_phase4_workspaces', NULL, NULL, now(), 1
WHERE NOT EXISTS (SELECT 1 FROM "_prisma_migrations" WHERE migration_name = '20260713120000_phase4_workspaces');
