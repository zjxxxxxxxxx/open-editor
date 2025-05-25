import { DEBUG_SOURCE } from '@open-editor/shared';
import MagicString from 'magic-string';
import { type JSXOpeningElement, parseSync } from '@swc/core';
import { Visitor } from '@swc/core/Visitor';
import { LinesAndColumns } from 'lines-and-columns';
import { type ResolvedOptions } from '../types';
import { parseID } from './parseID';
import { createOffset } from './offset';

export function transform(code: string, id: string, opts: ResolvedOptions) {
  const { file, isTsx } = parseID(id, opts.rootDir);

  const ast = parseSync(code, {
    target: 'esnext',
    syntax: isTsx ? 'typescript' : 'ecmascript',
    jsx: true,
    tsx: isTsx,
  });

  let s!: MagicString;
  let lc!: LinesAndColumns;
  let offset!: (val: number) => number;

  function setupVars() {
    s ??= new MagicString(code);
    lc ??= new LinesAndColumns(code);
    offset ??= createOffset(code, ast.span.start);
  }

  const visitor = new (class extends Visitor {
    // 跳过 TypeScript 类型节点，保持不变
    visitTsType(node) {
      return node;
    }

    visitJSXOpeningElement(node: JSXOpeningElement) {
      setupVars();

      const index = offset(node.span.end) - (node.selfClosing ? 2 : 1);
      // 1. 获取 AST 节点的起始字节偏移量
      const charIndex = offset(node.span.start);
      // 2. 将字符偏移量转换为行和列
      const loc = lc.locationForIndex(charIndex)!;
      const line = loc.line + 1; // 行号转换为 1-based
      const column = loc.column + 1; // 列号也转换为 1-based

      // 3. 使用 MagicString 在正确的位置插入 __source 属性
      // node.span.end 指向的是 `>` 或 `/>` 字符的后一个位置的字节偏移量。
      // prependLeft 在这个位置之前插入，正好是在 `>` 或 `/>` 内部的前面。
      s.prependLeft(index, ` ${DEBUG_SOURCE}="${file}:${line}:${column}"`);

      return node;
    }
  })();

  visitor.visitModule(ast); // 遍历 AST 并执行转换

  // 如果没有 `JSXOpeningElement` 节点被访问，`s` 可能没有被初始化
  if (!s) return null;

  // 返回转换后的代码和可选的 Source Map
  return {
    code: s.toString(),
    map: opts.sourceMap ? s.generateMap({ source: id, file: id }) : null,
  };
}
