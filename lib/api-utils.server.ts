export async function resolveParams<T extends Record<string, string | undefined>>(
  params: T | Promise<T>
): Promise<T> {
  return params && typeof (params as Promise<T>).then === 'function' ? await params : params;
}

export function getErrorStatusAndMessage(err: unknown): { status: number; message: string } {
  if (err instanceof Error && err.name === 'ZodError') {
    const zodErr = err as { errors?: Array<{ path: (string | number)[]; message: string }> };
    const messages =
      zodErr.errors?.map((e) => `${e.path.join('.')}: ${e.message}`).join('; ') ||
      'Validation failed';
    return { status: 400, message: messages };
  }

  if (err instanceof Error) {
    if (err.message.includes('not found') || err.message.includes('not exists')) {
      return { status: 404, message: err.message };
    }
    return { status: 400, message: err.message };
  }

  return { status: 500, message: 'An unexpected error occurred' };
}

export async function safeParseJson(req: Request): Promise<Record<string, unknown> | null> {
  try {
    return await req.json();
  } catch {
    return null;
  }
}
