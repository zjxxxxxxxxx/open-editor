/**
 * 表示调试信息中源代码位置的值对象。
 */
export interface DSValue {
  /**
   * 文件路径或名称。
   */
  file: string;
  /**
   * 行号（从 1 开始）。
   */
  line: number;
  /**
   * 列号（从 1 开始）。
   */
  column: number;
}

/**
 * 字符串形式的调试源信息，格式：`${file}:${line}:${column}`。
 * - file：文件路径或名称
 * - line：行号（从 1 开始）
 * - column：列号（从 1 开始）
 */
export type DSString = `${string}:${number}:${number}`;

/**
 * DS 类提供将 dsValue 与 dsString 之间相互转换的静态方法，
 * 以及统一的 key 与分隔符定义。
 */
export class DS {
  /**
   * 在 DOM 或数据属性中存储调试信息时使用的属性名。
   */
  static readonly ID = 'data-debug-source';

  /**
   * 将 file、line、column 拼接为字符串时使用的分隔符。
   */
  static readonly S = ':';

  /**
   * 将 dsValue 对象序列化为 dsString。
   *
   * @param dsValue - 包含 file、line、column 的对象。
   *                       - file: 必须提供（例如 "src/app.ts"）。
   *                       - line: 如果未提供，则默认值为 1。
   *                       - column: 如果未提供，则默认值为 1。
   * @returns 按照 `${file}:${line}:${column}` 格式拼接好的字符串。
   *
   * @example
   * ```ts
   * const value: dsValue = { file: 'src/index.ts', line: 10, column: 5 };
   * const str = DS.stringify(value);
   * // str === "src/index.ts:10:5"
   * ```
   */
  static stringify(dsValue: Partial<DSValue> & { file: string }): DSString {
    const { file, line = 1, column = 1 } = dsValue;
    // 将各项转换为字符串并用分隔符连接，返回类型断言为 dsString。
    return [file, line, column].join(DS.S) as DSString;
  }

  /**
   * 将 dsString 解析为 dsValue 对象。
   *
   * @param dsString - 形如 `${file}:${line}:${column}` 的字符串。
   *                            - file: 文件路径或名称
   *                            - line: 行号（如果缺失或无法转换为数字，则默认为 1）
   *                            - column: 列号（如果缺失或无法转换为数字，则默认为 1）
   * @returns 一个对象，包含解析后的 file、line 与 column。
   *
   * @throws 如果传入的字符串格式不符合 `${file}:${line}:${column}`，会默认将缺失的行号/列号视为 1。
   *
   * @example
   * ```ts
   * const str: dsString = 'src/index.ts:10:5';
   * const value = DS.parse(str);
   * // value === { file: 'src/index.ts', line: 10, column: 5 }
   *
   * const incomplete = 'src/index.ts:20';
   * const defaulted = DS.parse(incomplete as dsString);
   * // defaulted === { file: 'src/index.ts', line: 20, column: 1 }
   * ```
   */
  static parse(dsString: string): DSValue {
    // 使用静态分隔符将字符串拆分为最多三部分：[file, rawLine, rawColumn]
    const [file, rawLine, rawColumn] = dsString.split(DS.S, 3);

    // 将 rawLine 转为数字，若转换结果为 NaN 或原始值为空，则返回 1
    const line = Number(rawLine) || 1;
    // 将 rawColumn 转为数字，若转换结果为 NaN 或原始值为空，则返回 1
    const column = Number(rawColumn) || 1;

    return { file, line, column };
  }
}
