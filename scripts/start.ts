import { resolve } from 'node:path';
import consola from 'consola';
import enquirer from 'enquirer';
import minimist from 'minimist';
import { executeCommand, playgrounds, playgroundsRoot, readJSON } from './utils';

// 程序主入口
main();

/**
 * 主流程控制器
 */
async function main() {
  try {
    // 解析命令行参数
    const { playground, script } = await parseArguments();

    // 执行目标脚本
    executePlaygroundScript(playground, script);
  } catch {
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
 * 执行 playground 脚本
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
 * @param playground - 已选择的项目名称
 * @returns 用户选择的脚本名称
 */
async function selectScript(playground: string): Promise<string> {
  // 读取目标项目的 package.json
  const pkgPath = resolve(playgroundsRoot, playground, 'package.json');
  const { scripts } = readJSON(pkgPath);

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
