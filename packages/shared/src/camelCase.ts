/**
 * 驼峰命名正则匹配规则
 *
 * 匹配以下模式并捕获首字母：
 * 1. 字符串开头后接小写字母
 * 2. 路径符号（./-_）后接小写字母
 *
 * 示例匹配：
 * - "test-case" 中的 "-c"
 * - "path/to/file" 中的 "/t" 和 "/f"
 */
const CAMEL_CASE_RE = /(?:(?=^)|(?:[./\-_]+))([a-z])/g;

/**
 * 将字符串转换为驼峰命名格式
 *
 * @param inputStr 需要转换的原始字符串
 * @returns 转换后的驼峰格式字符串
 *
 * @示例
 * camelCase("hello-world")   => "helloWorld"
 * camelCase("path/to/file")  => "pathToFile"
 */
export function camelCase(inputStr: string): string {
  return inputStr.replace(
    CAMEL_CASE_RE,
    /**
     * 正则替换回调函数
     *
     * @param _match 完整匹配项（本实现中未使用）
     * @param firstLetter 捕获的第一个分组（目标字母）
     * @param _offset 匹配项在字符串中的偏移量（未使用）
     * @param _originalStr 原始输入字符串（未使用）
     */
    (_: string, firstLetter: string) => {
      return firstLetter.toUpperCase();
    },
  );
}
