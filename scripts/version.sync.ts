import { resolve } from 'node:path';
import { readFileSync, writeFileSync } from 'node:fs';
import { parseDocument, YAMLMap, type Scalar } from 'yaml';
import chalk from 'chalk';
import {
  packages,
  packagesRoot,
  playgrounds,
  playgroundsRoot,
  projectRoot,
  readJSON,
  writeJSON,
} from './utils';

const PACKAGE_PREFIX = '@open-editor/';

// 脚本入口
main();

function main() {
  // 收集所有本地包的版本
  const versions = collectVersions();
  // 更新 playground 的 package.json 依赖
  updatePlaygroundDeps(versions);
  // 更新 pnpm-lock.yaml 中的依赖
  updatePnpmLockDeps(versions);
}

/**
 * 收集本地包名及其版本
 * @returns 包含包名和版本号的对象
 */
function collectVersions() {
  const versions: AnyObject<string> = {};
  for (const pkgDir of packages) {
    const pkgPath = resolve(packagesRoot, pkgDir, 'package.json');
    const pkgJson = readJSON(pkgPath);
    versions[pkgJson.name] = pkgJson.version;
  }
  return versions;
}

/**
 * 更新 playground 包中对本地包的依赖版本
 * @param versions - 本地包名到版本号的映射
 */
function updatePlaygroundDeps(versions: AnyObject<string>) {
  for (const pkgDir of playgrounds) {
    const pkgPath = resolve(playgroundsRoot, pkgDir, 'package.json');
    const pkgJson = readJSON(pkgPath);

    // 更新 dependencies 和 devDependencies
    if (pkgJson.dependencies) {
      updateDepsVersion(pkgJson.name, pkgJson.dependencies, versions);
    }
    if (pkgJson.devDependencies) {
      updateDepsVersion(pkgJson.name, pkgJson.devDependencies, versions);
    }
    writeJSON(pkgPath, pkgJson);
  }
}

/**
 * 更新依赖对象中本地包的版本
 * @param pkgName - 父包名，用于日志输出
 * @param deps - 依赖对象（如 package.json 中的 dependencies）
 * @param versions - 本地包名到版本号的映射
 */
function updateDepsVersion(pkgName: string, deps: AnyObject<string>, versions: AnyObject<string>) {
  for (const depName of Object.keys(deps)) {
    // 只处理本地包
    if (pkgName.startsWith(PACKAGE_PREFIX)) {
      const version = versions[depName];
      deps[depName] = version;
      console.log(
        `${chalk.cyanBright(pkgName)}: updated ${chalk.yellowBright(
          depName,
        )} to version ${chalk.greenBright(version)}`,
      );
    }
  }
}

/**
 * 更新 pnpm-lock.yaml 中 playground 相关的本地包版本
 * 使用 'yaml' 库以保持文件格式
 * @param versions - 本地包名到版本号的映射
 */
function updatePnpmLockDeps(versions: AnyObject<string>) {
  const pnpmLockPath = resolve(projectRoot, 'pnpm-lock.yaml');
  const doc = parseDocument(readFileSync(pnpmLockPath, 'utf8'));
  const importersNode = (doc.contents as YAMLMap).get('importers') as YAMLMap;

  for (const importerPair of importersNode.items) {
    const importerPath = (importerPair.key as Scalar).value as string;
    // 检查是否是 playground 路径
    if (importerPath.startsWith('playgrounds/')) {
      const importerNode = importerPair.value as YAMLMap;
      // 更新 dependencies 和 devDependencies
      updateDepsInLockNode(importerNode.get('dependencies') as YAMLMap, versions);
      updateDepsInLockNode(importerNode.get('devDependencies') as YAMLMap, versions);
    }
  }
  writeFileSync(pnpmLockPath, doc.toString(), 'utf8');
}

/**
 * 更新 YAML 节点中本地包的 specifier
 * @param depsNode - YAML 依赖节点
 * @param versions - 本地包名到版本号的映射
 */
function updateDepsInLockNode(depsNode: YAMLMap, versions: AnyObject<string>) {
  for (const depPair of depsNode.items) {
    const pkgName = (depPair.key as Scalar).value as string;
    // 只处理本地包
    if (pkgName.startsWith(PACKAGE_PREFIX)) {
      const version = versions[pkgName];
      (depPair.value as YAMLMap).set('specifier', version);
    }
  }
}
