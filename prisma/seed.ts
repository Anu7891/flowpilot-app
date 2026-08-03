/**
 * FlowPilot seed - idempotent demo data matching the Phase-2 design fixtures.
 * Run: npm run db:seed   (refuses in production unless SEED_FORCE=1)
 */
import { PrismaClient, WorkspaceRole, ProjectStatus, TaskStatus, TaskPriority, NotificationType, EntityType, OnboardingStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  if (process.env.NODE_ENV === 'production' && process.env.SEED_FORCE !== '1') {
    throw new Error('Refusing to seed a production database (set SEED_FORCE=1 to override).');
  }

  const passwordHash = await bcrypt.hash('demo1234', 12);

  const userDefs = [
    { email: 'mara@acme.dev',  name: 'Mara Kis' },
    { email: 'jonas@acme.dev', name: 'Jonas Reid' },
    { email: 'amara@acme.dev', name: 'Amara Osei' },
    { email: 'theo@acme.dev',  name: 'Theo Park' },
  ];
  const users = [] as Awaited<ReturnType<typeof prisma.user.upsert>>[];
  for (const u of userDefs) {
    users.push(await prisma.user.upsert({
      where: { email: u.email },
      update: { name: u.name },
      create: { ...u, passwordHash, onboardingStatus: OnboardingStatus.COMPLETED },
    }));
  }
  const [mara, jonas, amara, theo] = users;

  const ws = await prisma.workspace.upsert({
    where: { slug: 'acme' },
    update: { name: 'Acme Inc.' },
    create: { name: 'Acme Inc.', slug: 'acme', ownerId: mara.id },
  });

  const roles: [string, WorkspaceRole][] = [
    [mara.id, WorkspaceRole.OWNER],
    [jonas.id, WorkspaceRole.ADMIN],
    [amara.id, WorkspaceRole.MEMBER],
    [theo.id, WorkspaceRole.GUEST],
  ];
  for (const [userId, role] of roles) {
    await prisma.workspaceMember.upsert({
      where: { workspaceId_userId: { workspaceId: ws.id, userId } },
      update: { role },
      create: { workspaceId: ws.id, userId, role, invitedBy: userId === mara.id ? null : mara.id },
    });
  }

  // wipe previous seed content inside the workspace, then rebuild (idempotent)
  await prisma.task.deleteMany({ where: { project: { workspaceId: ws.id } } });
  await prisma.project.deleteMany({ where: { workspaceId: ws.id } });
  await prisma.notification.deleteMany({ where: { userId: { in: users.map((u) => u.id) } } });
  await prisma.activityLog.deleteMany({ where: { workspaceId: ws.id } });

  const projectDefs = [
    { name: 'Checkout revamp',  description: 'One-page checkout, payment retries, Apple Pay.', status: ProjectStatus.ACTIVE,   icon: 'cart' },
    { name: 'Mobile app beta',  description: 'iOS + Android beta with offline boards.',        status: ProjectStatus.ACTIVE,   icon: 'phone' },
    { name: 'SOC 2 readiness',  description: 'Controls, evidence collection, audit prep.',     status: ProjectStatus.PLANNING, icon: 'shield' },
  ];
  const projects = [];
  for (const p of projectDefs) {
    projects.push(await prisma.project.create({ data: { ...p, workspaceId: ws.id, createdBy: mara.id } }));
  }
  const [checkout, mobile, soc2] = projects;

  type SeedTask = [string, TaskStatus, TaskPriority, string | null, string, number | null];
  const t = (title: string, s: TaskStatus, pr: TaskPriority, assignee: string | null, reporter: string, est: number | null): SeedTask =>
    [title, s, pr, assignee, reporter, est];

  const taskDefs: { project: string; tasks: SeedTask[] }[] = [
    { project: checkout.id, tasks: [
      t('Payment retry logic for failed cards', TaskStatus.IN_PROGRESS, TaskPriority.URGENT, mara.id, jonas.id, 8),
      t('Apple Pay entitlement + review notes', TaskStatus.IN_REVIEW,  TaskPriority.HIGH,   jonas.id, mara.id, 3),
      t('Checkout A/B: one-page vs stepped',    TaskStatus.IN_REVIEW,  TaskPriority.MEDIUM, amara.id, mara.id, 5),
      t('Log declined-card reasons',            TaskStatus.TODO,       TaskPriority.MEDIUM, amara.id, jonas.id, 2),
      t('Alert on >2% failure rate',            TaskStatus.TODO,       TaskPriority.HIGH,   null,     mara.id, 5),
      t('Retry banner UI on checkout',          TaskStatus.BACKLOG,    TaskPriority.LOW,    null,     amara.id, 3),
      t('Webhooks v2 rollout',                  TaskStatus.DONE,       TaskPriority.MEDIUM, jonas.id, mara.id, 8),
      t('Remove legacy card vault',             TaskStatus.CANCELED,   TaskPriority.NONE,   null,     jonas.id, null),
    ]},
    { project: mobile.id, tasks: [
      t('Offline board sync engine',      TaskStatus.IN_PROGRESS, TaskPriority.HIGH,   amara.id, mara.id, 13),
      t('Push notification permissions',  TaskStatus.TODO,        TaskPriority.MEDIUM, jonas.id, mara.id, 3),
      t('Beta invite flow',               TaskStatus.BACKLOG,     TaskPriority.MEDIUM, null,     amara.id, 5),
      t('Crash reporting setup',          TaskStatus.DONE,        TaskPriority.HIGH,   amara.id, jonas.id, 2),
    ]},
    { project: soc2.id, tasks: [
      t('Access review process doc',  TaskStatus.TODO,    TaskPriority.MEDIUM, mara.id, mara.id, 3),
      t('Vendor inventory',           TaskStatus.BACKLOG, TaskPriority.LOW,    null,    mara.id, 2),
      t('Evidence collection tooling',TaskStatus.BACKLOG, TaskPriority.MEDIUM, null,    mara.id, 8),
    ]},
  ];

  let firstTaskId = '';
  for (const group of taskDefs) {
    let pos = 0;
    for (const [title, status, priority, assigneeId, reporterId, est] of group.tasks) {
      pos += 1024;
      const task = await prisma.task.create({ data: {
        projectId: group.project, title, status, priority, assigneeId, reporterId,
        estimatedHours: est, position: pos,
        dueDate: status === TaskStatus.DONE || status === TaskStatus.CANCELED ? null
          : new Date(Date.now() + (pos / 1024) * 86_400_000),
      }});
      if (!firstTaskId) firstTaskId = task.id;
    }
  }

  await prisma.comment.createMany({ data: [
    { taskId: firstTaskId, userId: jonas.id, message: 'Stripe retries cover soft declines only - do we also want network-failure retries here?' },
    { taskId: firstTaskId, userId: mara.id,  message: 'Yes, but capped at 2 attempts with jitter. Adding acceptance criteria now.' },
  ]});

  await prisma.attachment.createMany({ data: [
    { taskId: firstTaskId, uploadedBy: mara.id, fileName: 'retry-flow.png',  fileUrl: 'https://files.local/retry-flow.png',  fileSize: 48_213, mimeType: 'image/png' },
    { taskId: firstTaskId, uploadedBy: jonas.id, fileName: 'decline-codes.csv', fileUrl: 'https://files.local/decline-codes.csv', fileSize: 9_120, mimeType: 'text/csv' },
  ]});

  await prisma.notification.createMany({ data: [
    { userId: mara.id, type: NotificationType.TASK_ASSIGNED, title: 'You were assigned "Payment retry logic for failed cards"', metadata: { taskId: firstTaskId } },
    { userId: mara.id, type: NotificationType.COMMENT_ADDED, title: 'Jonas commented on "Payment retry logic"', isRead: true, metadata: { taskId: firstTaskId } },
    { userId: jonas.id, type: NotificationType.MEMBER_JOINED, title: 'Theo Park joined Acme Inc.', isRead: false, metadata: {} },
  ]});

  await prisma.activityLog.createMany({ data: [
    { workspaceId: ws.id, userId: mara.id,  entityType: EntityType.WORKSPACE, entityId: ws.id, action: 'workspace.created', metadata: {} },
    { workspaceId: ws.id, userId: mara.id,  entityType: EntityType.PROJECT, entityId: checkout.id, action: 'project.created', metadata: { name: 'Checkout revamp' } },
    { workspaceId: ws.id, userId: jonas.id, entityType: EntityType.TASK, entityId: firstTaskId, action: 'task.created', metadata: { title: 'Payment retry logic for failed cards' } },
    { workspaceId: ws.id, userId: mara.id,  entityType: EntityType.TASK, entityId: firstTaskId, action: 'task.status_changed', metadata: { from: 'TODO', to: 'IN_PROGRESS' } },
    { workspaceId: ws.id, userId: jonas.id, entityType: EntityType.COMMENT, entityId: firstTaskId, action: 'comment.added', metadata: {} },
  ]});

  console.log('Seed complete: workspace "acme", 4 users (password: demo1234), 3 projects, 15 tasks.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
