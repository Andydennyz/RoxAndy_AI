declare module '@vitejs/plugin-react-swc' {
  const plugin: any;
  export default plugin;
}

declare module 'vitest/config' {
  export function defineConfig(cfg: any): any;
}

declare module 'path' {
  const p: any;
  export default p;
}

declare const process: any;
