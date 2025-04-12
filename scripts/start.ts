// Node.js 路径解析模块
import { resolve } from 'node:path';
// 命令行日志输出工具
import consola from 'consola';
// 交互式命令行提示工具
import enquirer from 'enquirer';
// 命令行参数解析工具
import minimist from 'minimist';
// 命令行颜色处理工具
import chalk from 'chalk';
// 工具函数导入
import {
  executeCommand,
  playgrounds,
  projectRoot,
  readJSON,
  rollupRoot,
  viteRoot,
  webpackRoot,
} from './utils';

// 程序主入口
main();

/**
 * 主流程控制器
 * 1. 解析命令行参数
 * 2. 链接选中的 playground 项目
 * 3. 执行选中的脚本
 */
async function main() {
  try {
    // 步骤1: 解析命令行参数
    const { playground, script } = await parseArguments();

    // 步骤2: 确定构建工具路径
    const toolkitPath = determineToolkitPath(playground);

    // 步骤3: 创建项目软链接
    linkPlaygroundProject(playground, toolkitPath);

    // 步骤4: 执行目标脚本
    executePlaygroundScript(playground, script);
  } catch (error) {
    // 异常处理
    console.log();
    consola.error('程序异常终止');
    // 非正常退出状态码
    process.exit(1);
  }
}

/**
 * 参数解析器（包含 playground 名称和脚本名称的对象）
 */
async function parseArguments() {
  // 使用 minimist 解析命令行参数
  const cliArgs = minimist(process.argv.slice(1));

  // 优先使用命令行参数，否则进行交互式选择
  cliArgs.playground ??= await selectPlayground();
  cliArgs.script ??= await selectScript(cliArgs.playground);

  return cliArgs as unknown as { playground: string; script: string };
}

/**
 * 构建工具路径决策器
 *
 * @param playground - playground 项目名称（格式：工具名-场景名）
 *
 * @returns  构建工具根路径
 *
 * @example determineToolkitPath('vite-react') => '/path/to/vite'
 */
function determineToolkitPath(playground: string): string {
  // 构建工具映射表（根据项目名前缀判断）
  const toolkitMap = {
    rollup: rollupRoot,
    vite: viteRoot,
    webpack: webpackRoot,
  };

  // 分割项目名前缀（如 'vite-react' -> 'vite'）
  const prefix = playground.split('-')[0] as keyof typeof toolkitMap;

  // 返回对应工具路径，默认使用 webpack
  return toolkitMap[prefix] || webpackRoot;
}

/**
 * 创建项目软链接
 *
 * @param playground - 项目名称
 * @param toolkitPath - 构建工具路径
 */
function linkPlaygroundProject(playground: string, toolkitPath: string) {
  // 构建 playground 完整路径
  const projectPath = resolve(projectRoot, 'playgrounds', playground);
  console.log();
  consola.info(`正在链接 ${chalk.blueBright(toolkitPath)} \n到 ${chalk.greenBright(projectPath)}`);

  // 执行串联命令：切换目录 -> 创建链接 -> 返回根目录
  executeCommand(
    [`cd ${projectPath}`, `pnpm link ${toolkitPath}`, `cd ${projectRoot}`].join(' && '),
  );
}

/**
 * 执行 playground 脚本
 *
 * @param playground - 项目名称
 * @param script - 要执行的脚本名称
 */
function executePlaygroundScript(playground: string, script: string) {
  console.log();
  consola.info(`正在执行 ${playground} 的 ${script} 脚本`);
  // 使用 pnpm 的 --filter 参数定位具体项目
  executeCommand(`pnpm --filter @playground/${playground} ${script}`);
}

/**
 * 交互式选择 playground 项目
 *
 * @returns 用户选择的项目名称
 */
async function selectPlayground(): Promise<string> {
  const response = await enquirer.prompt<{ playground: string }>({
    // 选择器类型
    type: 'select',
    // 参数名称
    name: 'playground',
    message: '请选择要操作的 playground 项目',
    choices: playgrounds.map((name) => ({
      name,
      // 带格式的显示文本
      message: `项目名称: ${name}`,
    })),
  });
  return response.playground;
}

/**
 * 交互式选择执行脚本
 *
 * @param playground - 已选择的项目名称
 *
 * @returns 用户选择的脚本名称
 */
async function selectScript(playground: string): Promise<string> {
  // 读取目标项目的 package.json
  const packageJsonPath = resolve('playgrounds', playground, 'package.json');
  const { scripts } = readJSON(packageJsonPath);

  const response = await enquirer.prompt<{ script: string }>({
    type: 'select',
    name: 'script',
    message: '请选择要执行的脚本',
    choices: Object.entries(scripts).map(([name, content]) => ({
      name,
      value: name,
      // 对齐脚本名称和描述
      message: `${name.padEnd(12)} ${content}`,
    })),
  });

  return response.script;
}
