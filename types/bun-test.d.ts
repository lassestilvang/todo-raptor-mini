declare module 'bun:test' {
  type AsyncFn = () => void | Promise<void>;
  type HookFn = (fn: AsyncFn) => void;

  export function describe(name: string, fn: AsyncFn): void;
  export function it(name: string, fn: AsyncFn): void;
  export function test(name: string, fn: (args: any) => void | Promise<void>): void;
  export const expect: any;
  export const beforeEach: HookFn;
  export const afterEach: HookFn;
}
