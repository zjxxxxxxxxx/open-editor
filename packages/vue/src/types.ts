export interface Options {
  /**
   * source root path
   *
   * @default process.cwd()
   */
  rootDir?: string;
  /**
   * generate sourceMap
   *
   * @default false
   */
  sourceMap?: boolean;
  /**
   * @default /\.(vue|jsx|tsx)$/
   */
  include?: string | RegExp | (string | RegExp)[];
  /**
   * @default /\/node_modules\//
   */
  exclude?: string | RegExp | (string | RegExp)[];
}
