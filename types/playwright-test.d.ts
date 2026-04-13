declare module '@playwright/test' {
  export type Page = any;
  export type Locator = any;
  export type BrowserContext = any;
  export type Request = any;
  export type TestInfo = any;
  export type TestArgs = { page: Page; context?: BrowserContext; request?: Request };

  export const expect: any;
  export function defineConfig(config: any): any;
  export function describe(name: string, fn: () => void): void;
  export function test(name: string, fn: (args: TestArgs) => void | Promise<void>): void;
  export function beforeEach(fn: () => void | Promise<void>): void;
  export function afterEach(fn: () => void | Promise<void>): void;
}
