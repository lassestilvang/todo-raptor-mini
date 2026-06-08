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
