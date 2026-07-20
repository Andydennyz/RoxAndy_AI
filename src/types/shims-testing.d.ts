declare module '@testing-library/jest-dom/vitest';

declare module '@testing-library/react' {
  const whatever: any;
  export default whatever;
}

declare module 'vitest' {
  export const afterEach: any;
  export const beforeEach: any;
  export const describe: any;
  export const it: any;
  export const expect: any;
  export const vi: any;
  const _default: any;
  export default _default;
}
