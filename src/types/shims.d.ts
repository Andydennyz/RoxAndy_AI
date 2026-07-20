declare module 'react-syntax-highlighter' {
  import * as React from 'react';
  export const Prism: React.ComponentType<any>;
  const SyntaxHighlighter: {
    Prism: React.ComponentType<any>;
  } | React.ComponentType<any>;
  export default SyntaxHighlighter;
}

declare module 'react-syntax-highlighter/dist/esm/styles/prism' {
  export const oneDark: any;
  const styles: { [key: string]: any };
  export default styles;
}
