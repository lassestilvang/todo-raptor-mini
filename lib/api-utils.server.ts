/**
 * Utility to handle both sync and async params in Next.js 16 dynamic routes.
 * In Next.js 16, params can be a Promise in dynamic routes.
 *
 * @example
 * export async function GET(req: Request, { params }: { params: any }) {
 *   const { id } = await resolveParams(params);
 *   // ... rest of handler
 * }
 */
export async function resolveParams<T extends Record<string, any>>(
  params: T | Promise<T>
): Promise<T> {
  return params && typeof (params as any).then === 'function' ? await params : params;
}

/**
 * Get error status code and message from an error.
 * Useful for consistent error handling across API routes.
 */
export function getErrorStatusAndMessage(err: unknown): { status: number; message: string } {
  // Validation errors from Zod
  if (err instanceof Error && err.name === 'ZodError') {
    const zodErr = err as any;
    const messages = zodErr.errors?.map((e: any) => `${e.path.join('.')}: ${e.message}`).join('; ') || 'Validation failed';
    return { status: 400, message: messages };
  }

  // Generic errors
  if (err instanceof Error) {
    if (err.message.includes('not found') || err.message.includes('not exists')) {
      return { status: 404, message: err.message };
    }
    return { status: 400, message: err.message };
  }

  // Fallback for unknown errors
  return { status: 500, message: 'An unexpected error occurred' };
}

/**
 * Parse request JSON with error handling.
 */
export async function safeParseJson(req: Request): Promise<Record<string, any> | null> {
  try {
    return await req.json();
  } catch {
    return null;
  }
}
