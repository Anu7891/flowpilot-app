// One-off: apply Phase 4 migration idempotently to Neon, then record it in _prisma_migrations.
import 'dotenv/config';
import pg from 'pg';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

const url = process.env.DIRECT_URL || process.env.DATABASE_URL;
const client = new pg.Client({ connectionString: url, ssl: { rejectUnauthorized: false } });

const NAME = '20260713120000_phase4_workspaces';

const stmts = [
  `DO $$ BEGIN CREATE TYPE "InvitationStatus" AS ENUM ('PENDING','ACCEPTED','REJECTED','EXPIRED','REVOKED'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;`,
  `ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'WORKSPACE_INVITE';`,
  `ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'INVITE_ACCEPTED';`,
  `ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'ROLE_CHANGED';`,
  `ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'MEMBER_REMOVED';`,
  `ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'WORKSPACE_ARCHIVED';`,
  `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "last_active_at" TIMESTAMP(3);`,
  `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "last_workspace_id" TEXT;`,
  `ALTER TABLE "workspaces" ADD COLUMN IF NOT EXISTS "color" TEXT;`,
  `ALTER TABLE "workspaces" ADD COLUMN IF NOT EXISTS "icon" TEXT;`,
  `ALTER TABLE "workspaces" ADD COLUMN IF NOT EXISTS "archived_at" TIMESTAMP(3);`,
  `CREATE TABLE IF NOT EXISTS "workspace_invitations" (
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
  );`,
  `CREATE TABLE IF NOT EXISTS "workspace_settings" (
    "workspace_id" TEXT NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "date_format" TEXT NOT NULL DEFAULT 'DD MMM YYYY',
    "default_view" TEXT NOT NULL DEFAULT 'board',
    "notification_prefs" JSONB NOT NULL DEFAULT '{}',
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "workspace_settings_pkey" PRIMARY KEY ("workspace_id")
  );`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "workspace_invitations_token_key" ON "workspace_invitations"("token");`,
  `CREATE INDEX IF NOT EXISTS "workspace_invitations_workspace_id_status_idx" ON "workspace_invitations"("workspace_id","status");`,
  `CREATE INDEX IF NOT EXISTS "workspace_invitations_email_status_idx" ON "workspace_invitations"("email","status");`,
  `DO $$ BEGIN ALTER TABLE "workspace_invitations" ADD CONSTRAINT "workspace_invitations_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;`,
  `DO $$ BEGIN ALTER TABLE "workspace_invitations" ADD CONSTRAINT "workspace_invitations_invited_by_fkey" FOREIGN KEY ("invited_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;`,
  `DO $$ BEGIN ALTER TABLE "workspace_settings" ADD CONSTRAINT "workspace_settings_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;`,
];

const run = async () => {
  await client.connect();
  console.log('Connected to', (await client.query('select current_database() db')).rows[0].db);
  for (const s of stmts) {
    const label = s.replace(/\s+/g, ' ').slice(0, 70);
    try { await client.query(s); console.log('  ok  ', label); }
    catch (e) { console.log('  FAIL', label, '->', e.message); throw e; }
  }

  // Record in _prisma_migrations so `prisma migrate deploy` treats it as applied.
  const sql = readFileSync(new URL('./migrations/20260713120000_phase4_workspaces/migration.sql', import.meta.url), 'utf8');
  const checksum = createHash('sha256').update(sql).digest('hex');
  const existing = await client.query('SELECT 1 FROM "_prisma_migrations" WHERE migration_name=$1', [NAME]);
  if (existing.rowCount === 0) {
    await client.query(
      `INSERT INTO "_prisma_migrations" (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count)
       VALUES (gen_random_uuid()::text, $1, now(), $2, NULL, NULL, now(), 1)`,
      [checksum, NAME],
    );
    console.log('Recorded migration', NAME, 'in _prisma_migrations');
  } else {
    console.log('Migration already recorded');
  }

  const t = await client.query(`SELECT table_name FROM information_schema.tables WHERE table_name IN ('workspace_invitations','workspace_settings') ORDER BY table_name`);
  console.log('Tables present:', t.rows.map(r => r.table_name).join(', '));
  await client.end();
  console.log('DONE');
};

run().catch((e) => { console.error('ERROR', e.message); process.exit(1); });
