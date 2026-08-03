/** Cursor = base64url of (createdAt, id). Stable under concurrent inserts, no OFFSET scans. */
export type Cursor = { createdAt: string; id: string };

export function encodeCursor(row: { createdAt: Date; id: string }): string {
  return Buffer.from(JSON.stringify({ createdAt: row.createdAt.toISOString(), id: row.id })).toString('base64url');
}

export function decodeCursor(raw: string | null | undefined): Cursor | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(Buffer.from(raw, 'base64url').toString('utf8')) as Cursor;
    return typeof parsed.createdAt === 'string' && typeof parsed.id === 'string' ? parsed : null;
  } catch {
    return null;
  }
}

/** Prisma where-fragment: rows strictly older than the cursor (order: createdAt DESC, id DESC). */
export function afterCursor(c: Cursor | null) {
  if (!c) return {};
  const at = new Date(c.createdAt);
  return { OR: [{ createdAt: { lt: at } }, { createdAt: at, id: { lt: c.id } }] };
}

/** take limit+1 rows, slice, and hand back the next cursor if there is one. */
export function page<T extends { createdAt: Date; id: string }>(rows: T[], limit: number) {
  const items = rows.slice(0, limit);
  const nextCursor = rows.length > limit ? encodeCursor(items[items.length - 1]) : null;
  return { items, nextCursor };
}
