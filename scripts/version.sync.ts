import { resolve } from 'node:path';
import chalk from 'chalk';
import { packages, packagesRoot, playgrounds, playgroundsRoot, readJSON, writeJSON } from './utils';

// 执行脚本
main();

/**
 * 收集本地包版本并更新 playground 的依赖版本
 */
function main(): void {
  const versions = collectVersions();
  updatePlaygroundDeps(versions);
}

/**
 * 读取每个本地包的 package.json，返回一个包名到版本号的映射对象
 *
 * @returns 包名 -> 版本号 的映射
 */
function collectVersions() {
  const versions: Record<string, string> = {};

  packages.forEach((pkg) => {
    const pkgPath = resolve(packagesRoot, pkg, 'package.json');
    const pkgJson = readJSON(pkgPath);
    versions[pkgJson.name] = pkgJson.version;
  });

  return versions;
}

/**
 * 根据本地包版本映射，更新每个 playground 的 devDependencies 中对应包的版本
 *
 * @param versions - 包名 -> 版本号 的映射
 */
function updatePlaygroundDeps(versions: Record<string, string>) {
  playgrounds.forEach((playground) => {
    const pkgPath = resolve(playgroundsRoot, playground, 'package.json');
    const pkgJson = readJSON(pkgPath);

    // 遍历所有 devDependencies，若在本地版本映射中存在则替换
    Object.keys(pkgJson.devDependencies).forEach((depName) => {
      const localVersion = versions[depName];
      if (localVersion) {
        pkgJson.devDependencies[depName] = localVersion;

        console.log(
          `${chalk.cyanBright(pkgJson.name)}: updated ${chalk.yellowBright(
            depName,
          )} to version ${chalk.greenBright(localVersion)}`,
        );
      }
    });

    // 将更新后的 package.json 写回磁盘
    writeJSON(pkgPath, pkgJson);
  });
}
