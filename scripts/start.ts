import { resolve } from 'node:path';
import consola from 'consola';
import enquirer from 'enquirer';
import minimist from 'minimist';
import {
  executeCommand,
  playgrounds,
  projectRoot,
  readJSON,
  rollupRoot,
  viteRoot,
  webpackRoot,
} from './utils';

/**
 * 主函数 - 程序入口
 * 1. 解析命令行参数
 * 2. 链接选中的 playground 项目
 * 3. 执行选中的脚本
 */
async function main() {
  try {
    // 解析命令行参数
    const { playground, script } = await parseArguments();

    // 获取构建工具路径
    const toolkitPath = determineToolkitPath(playground);

    // 执行项目链接
    linkPlaygroundProject(playground, toolkitPath);

    // 执行选定脚本
    executePlaygroundScript(playground, script);
  } catch (error) {
    consola.error('程序异常终止');
    process.exit(1);
  }
}

/**
 * 解析命令行参数
 * @returns 包含 playground 名称和脚本名称的对象
 */
async function parseArguments() {
  const cliArgs = minimist(process.argv.slice(1));
  return {
    playground: cliArgs.playground || (await selectPlayground()),
    script: cliArgs.script || (await selectScript(cliArgs.playground)),
  };
}

/**
 * 根据 playground 名称确定构建工具路径
 * @param playground 选择的 playground 名称
 * @returns 构建工具根路径
 */
function determineToolkitPath(playground: string): string {
  const toolkitMap = {
    rollup: rollupRoot,
    vite: viteRoot,
    webpack: webpackRoot,
  };

  return toolkitMap[playground.split('-')[0] as keyof typeof toolkitMap] || webpackRoot;
}

/**
 * 链接 playground 项目到指定构建工具
 * @param playground 选择的 playground 名称
 * @param toolkitPath 构建工具路径
 */
function linkPlaygroundProject(playground: string, toolkitPath: string) {
  const projectPath = resolve(projectRoot, 'playgrounds', playground);
  consola.info(`正在链接 ${toolkitPath} 到 ${projectPath}`);

  executeCommand(
    [`cd ${projectPath}`, `pnpm link ${toolkitPath}`, `cd ${projectRoot}`].join(' && '),
  );
}

/**
 * 执行 playground 项目的指定脚本
 * @param playground 选择的 playground 名称
 * @param script 要执行的脚本名称
 */
function executePlaygroundScript(playground: string, script: string) {
  consola.info(`正在执行 ${playground} 的 ${script} 脚本`);
  executeCommand(`pnpm --filter @playground/${playground} ${script}`);
}

/**
 * 交互式选择 playground 项目
 * @returns 用户选择的 playground 名称
 */
async function selectPlayground(): Promise<string> {
  const response = await enquirer.prompt<{ playground: string }>({
    type: 'select',
    name: 'playground',
    message: '请选择要操作的 playground 项目',
    choices: playgrounds.map((name) => ({
      name,
      message: `项目名称: ${name}`,
    })),
  });
  return response.playground;
}

/**
 * 交互式选择要执行的脚本
 * @param playground 已选择的 playground 名称
 * @returns 用户选择的脚本名称
 */
async function selectScript(playground: string): Promise<string> {
  const packageJsonPath = resolve('playgrounds', playground, 'package.json');
  const { scripts } = readJSON(packageJsonPath);

  const response = await enquirer.prompt<{ script: string }>({
    type: 'select',
    name: 'script',
    message: '请选择要执行的脚本',
    choices: Object.entries(scripts).map(([name, content]) => ({
      name,
      value: name,
      message: `${name.padEnd(12)} ${content}`,
    })),
  });

  return response.script;
}

main();
