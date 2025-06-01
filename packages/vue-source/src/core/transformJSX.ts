import { parse } from '@babel/parser';
import traverse from '@babel/traverse';

export function transformJSX(
  code: string,
  cb: (index: number, line: number, column: number) => void,
  options: {
    startIndex?: number;
    startLine?: number;
    startColumn?: number;
    isTsx?: boolean;
  },
) {
  const { isTsx, startIndex = 0, startLine = 1, startColumn = 1 } = options;

  const ast = parse(code, {
    sourceType: 'unambiguous',
    startIndex,
    startLine,
    // babel start at 0
    startColumn: startColumn - 1,
    // @ts-ignore
    plugins: ['jsx', isTsx ? 'typescript' : undefined].filter(Boolean),
  });
  traverse(ast, {
    JSXOpeningElement({ node }) {
      // <></> return
      if (!node.name) return;

      const index = node.loc!.end.index - (node.selfClosing ? 2 : 1);
      const { line, column } = node.loc!.start;

      cb(index, line, column + 1);
    },
  });
}
