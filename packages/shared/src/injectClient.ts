/**
 * 检测代码中是否包含严格模式声明的正则表达式
 * 匹配 'use strict' 或 "use strict" 开头且可能跟随分号的语句
 */
const useStrictPattern = /^['"]use strict['"];?/;

/**
 * 向目标代码中注入客户端初始化逻辑
 *
 * @param code 原始代码内容
 * @param userOpts 注入配置选项
 *
 * @returns 包含客户端初始化逻辑的完整代码
 */
export function injectClient(code: string, userOpts: AnyObject): string {
  // 解构配置参数，分离模块类型标识和其他配置
  const { isCommonjs, ...clientOptions } = userOpts;

  // 生成严格模式声明（如果原始代码包含则保留）
  const useStrictHeader = useStrictPattern.test(code) ? '"use strict";\n' : '';

  // 根据模块类型生成不同的依赖引入语句
  const moduleImport = isCommonjs
    ? 'const { setupClient } = require("@open-editor/client");\n'
    : 'import { setupClient } from "@open-editor/client";\n';

  // 清理原始代码中可能存在的严格模式声明（避免重复）
  const cleanedCode = code.replace(useStrictPattern, '');

  // 生成客户端初始化代码片段
  const clientSetupCode = `\nif (typeof window !== "undefined") {
  setupClient(${JSON.stringify(clientOptions)});
}\n`;

  // 组合所有代码片段形成最终结果
  return useStrictHeader + moduleImport + cleanedCode + clientSetupCode;
}
