import { type JSXOpeningElement, parseSync } from '@swc/core';
import { Visitor } from '@swc/core/Visitor.js';
import { LinesAndColumns } from 'lines-and-columns';
import { createOffset } from './offset';

export function transformJSX(
  code: string,
  cb: (index: number, line: number, column: number) => void,
  opts: { isJSX: boolean; isTsx: boolean },
) {
  const ast = parseSync(code, {
    target: 'esnext',
    syntax: opts.isTsx ? 'typescript' : 'ecmascript',
    jsx: opts.isJSX,
    tsx: opts.isTsx,
  });

  const lc = new LinesAndColumns(code);
  const offset = createOffset(code, ast.span.start);

  const visitor = new (class extends Visitor {
    // 跳过 TypeScript 类型节点，保持不变
    visitTsType(node) {
      return node;
    }

    visitJSXOpeningElement(node: JSXOpeningElement) {
      const index = offset(node.span.end) - (node.selfClosing ? 2 : 1);
      const { line, column } = lc.locationForIndex(offset(node.span.start))!;
      cb(index, line + 1, column + 1);

      return node;
    }
  })();

  visitor.visitModule(ast); // 遍历 AST 并执行转换
}
