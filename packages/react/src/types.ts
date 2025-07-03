export interface Options {
  /**
   * 源码根路径 | Source root path
   *
   * @default process.cwd()
   */
  rootDir?: string;
  /**
   * 是否生成 sourceMap | Generate sourceMap
   *
   * @default false
   */
  sourceMap?: boolean;
  /**
   * 包含的文件 | Files to include
   *
   * @default /\.(jsx|tsx)$/
   */
  include?: string | RegExp | (string | RegExp)[];
  /**
   * 排除的文件 | Files to exclude
   *
   * @default /\/node_modules\//
   */
  exclude?: string | RegExp | (string | RegExp)[];
}
