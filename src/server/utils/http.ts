import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { AppError } from './errors';

type Meta = Record<string, unknown>;

export const ok = <T>(data: T, meta?: Meta) => NextResponse.json(meta ? { data, meta } : { data });
export const created = <T>(data: T) => NextResponse.json({ data }, { status: 201 });
export const noContent = () => new NextResponse(null, { status: 204 });

type Handler<P> = (req: Request, ctx: { params: P }) => Promise<Response>;

/** Wraps a route handler: Zod + AppError -> clean JSON envelopes, everything else -> 500. */
export function route<P = Record<string, string>>(fn: Handler<P>): Handler<P> {
  return async (req, ctx) => {
    try {
      return await fn(req, ctx);
    } catch (e) {
      if (e instanceof ZodError) {
        return NextResponse.json(
          { error: { code: 'VALIDATION_ERROR', message: 'Invalid input.', details: e.flatten() } },
          { status: 400 },
        );
      }
      if (e instanceof AppError) {
        return NextResponse.json(
          { error: { code: e.code, message: e.message, ...(e.details ? { details: e.details } : {}) } },
          { status: e.status },
        );
      }
      console.error('[api] unhandled error:', e);
      return NextResponse.json(
        { error: { code: 'INTERNAL', message: 'Something went wrong on our side.' } },
        { status: 500 },
      );
    }
  };
}

export async function parseBody<T>(req: Request, schema: { parse: (v: unknown) => T }): Promise<T> {
  let raw: unknown = {};
  try { raw = await req.json(); } catch { /* empty body -> {} so Zod reports fields */ }
  return schema.parse(raw);
}

export function query(req: Request): URLSearchParams {
  return new URL(req.url).searchParams;
}
