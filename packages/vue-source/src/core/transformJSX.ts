import { parse, ParserOptions } from '@babel/parser';
import traverse from '@babel/traverse';

export interface TransformJSXOptions {
  /**
   * 这段 `code` 在原始文件中的起始字符偏移（0-based）。
   * 如果传入的 `code` 只是整个 SFC 文件的一部分，需要设置该值才能让 node.start/node.end
   * 对应原始文件中的绝对偏移；否则保持默认 0 即可。
   */
  startIndex?: number;

  /**
   * 这段 `code` 在原始文件中的起始行号（1-based）。
   * 用于让 `node.loc.start.line` 对应到原始文件中的正确行。
   */
  startLine?: number;

  /**
   * 这段 `code` 在原始文件中的起始列号（1-based）。
   * 用于让 `node.loc.start.column` 对应到原始文件中的正确列。
   */
  startColumn?: number;

  /**
   * 如果代码是 TSX，而不仅仅是 JSX，则传 `true`。会同时打开 `typescript` 插件，以便正确解析 TSX 语法。
   */
  isTsx?: boolean;
}

/**
 * 将传入的 JSX/TSX 代码解析成 AST，然后对所有的 JSX 开始标签插桩：
 * 在每个 `<Foo>` 或 `<Foo />` 标签的闭合尖括号之前调用回调，
 * 回调参数包含在原始文件中的绝对偏移、行号和列号。
 *
 * @param code - 需要解析的 JSX/TSX 代码片段
 * @param cb - 回调
 * @param options - 配置项
 */
export function transformJSX(
  code: string,
  cb: (index: number, line: number, column: number) => void,
  options: TransformJSXOptions,
) {
  const { isTsx = false, startIndex = 0, startLine = 1, startColumn = 1 } = options;

  // Babel Parser 配置，包含行列及字符偏移信息
  const parserOpts: ParserOptions = {
    sourceType: 'unambiguous',
    startIndex,
    startLine,
    startColumn: startColumn - 1, // Babel 需要 0-based 的列号
    ranges: true, // 开启后会生成 node.start/node.end，以及 node.range
    plugins: isTsx ? ['jsx', 'typescript'] : ['jsx'],
  };

  // 解析 code 为 AST，File 节点包含所有子节点及位置信息
  const ast = parse(code, parserOpts);

  // 遍历 AST，针对每个 JSXOpeningElement 计算插桩位置并回调
  traverse(ast, {
    JSXOpeningElement({ node }) {
      // 计算标签闭合符号前的偏移位置
      // 自闭合标签 `<Foo />`：node.end 指向 `/>` 之后，需要减 2 定位到 `/` 之前
      // 普通标签 `<Foo>`：node.end 指向 `>` 之后，需要减 1 定位到 `>` 之前
      const index = node.selfClosing ? node.end! - 2 : node.end! - 1;

      const { line, column } = node.loc!.start;
      cb(index, line, column + 1);
    },
  });
}
