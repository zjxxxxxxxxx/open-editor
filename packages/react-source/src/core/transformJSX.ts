import { DEBUG_SOURCE } from '@open-editor/shared';
import MagicString from 'magic-string';
import { type JSXOpeningElement, parseSync } from '@swc/core';
import { Visitor } from '@swc/core/Visitor';
import { LinesAndColumns } from 'lines-and-columns';
import { type ResolvedOptions } from '../types';
import { parseID } from './parseID';
import { createOffset } from './offset';

export function transformJSX(code: string, id: string, opts: ResolvedOptions) {
  const { file, isJSX, isTsx } = parseID(id, opts.rootDir);

  const ast = parseSync(code, {
    target: 'esnext',
    syntax: isTsx ? 'typescript' : 'ecmascript',
    jsx: isJSX,
    tsx: isTsx,
  });

  const s = new MagicString(code);
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

      s.prependLeft(index, ` ${DEBUG_SOURCE}="${file}:${line + 1}:${column + 1}"`);

      return node;
    }
  })();

  visitor.visitModule(ast); // 遍历 AST 并执行转换

  if (!s.hasChanged()) return null;

  // 返回转换后的代码和可选的 Source Map
  return {
    code: s.toString(),
    map: opts.sourceMap ? s.generateMap({ source: id, file: id }) : null,
  };
}
