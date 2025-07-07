import { type Plugin } from 'rollup';
import MagicString from 'magic-string';

export interface CodePluginOptions {
  /**
   * 控制是否生成 sourceMap，用于调试时映射压缩后的代码到原始位置
   * @default false
   */
  sourceMap?: boolean;
}

// 匹配所有 code`...` 模板字符串，并捕获内部任意字符（包括换行）
const CODE_RE = /code`([\s\S]*?)`/g;
// 匹配所有换行符、符号前后的多余空格，用于一步到位地压缩 code 内容
const CODE_COMPACT_RE = /[\n\r\f]+|\s*([{}()[\];,=+\-*/:&|!])\s*|([=+\-*/:&|])\s+/g;

export default function codePlugin(opts: CodePluginOptions = {}): Plugin {
  return {
    name: 'rollup:code',

    transform(code, id) {
      // 如果源码不包含 code`，则无需处理
      if (!code.includes('code`')) return null;

      const magic = new MagicString(code); // MagicString 实例，用于高效修改代码

      // 使用 matchAll 迭代所有匹配项，获取匹配内容和精确位置
      for (const match of code.matchAll(CODE_RE)) {
        const raw = match[0]; // 完整匹配的字符串，如 'code`...`'
        const content = match[1]; // 捕获组1的内容，即模板字符串内部
        const offset = match.index!; // 匹配项的起始索引

        // 使用一步到位的正则替换，简化 code 内容的清洗过程
        const processedContent = content
          .replace(CODE_COMPACT_RE, (_, p1, p2) => p1 || p2 || '') // 替换换行、符号前/后空格
          .trim(); // 移除最终的首尾空白

        // 用处理后的单行字符串替换原始模板字面量部分
        magic.overwrite(offset, offset + raw.length, `\`${processedContent}\``);
      }

      // 返回转换后的代码和 sourceMap
      return {
        code: magic.toString(),
        map: opts.sourceMap ? magic.generateMap({ source: id, file: id }) : null,
      };
    },
  };
}
