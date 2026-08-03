export type ErrorCode =
  | 'VALIDATION_ERROR'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'RATE_LIMITED'
  | 'INTERNAL';

/** Single error type for the whole backend; routes map it to HTTP. */
export class AppError extends Error {
  constructor(
    public readonly code: ErrorCode,
    public readonly status: number,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const unauthorized = (msg = 'Sign in to continue.') => new AppError('UNAUTHORIZED', 401, msg);
export const forbidden = (msg = "You don't have permission to do that.") => new AppError('FORBIDDEN', 403, msg);
export const notFound = (what = 'Resource') => new AppError('NOT_FOUND', 404, `${what} not found.`);
export const conflict = (msg: string) => new AppError('CONFLICT', 409, msg);
export const rateLimited = () => new AppError('RATE_LIMITED', 429, 'Too many requests. Try again in a minute.');
