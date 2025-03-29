import { isStr, normalizePath } from '@open-editor/shared';
import { type ResolveDebug } from './resolveDebug';
import { ensureFileName, isValidFileName } from './resolveUtil';
import { type CodeSourceMeta } from '.';

/**
 * Vue解析器配置项接口
 * @template T 实例类型，默认为any
 */
export interface VueResolverOptions<T = any> {
  /** 验证实例有效性 */
  isValid(v?: T): boolean;
  /** 获取下一个关联实例 */
  getNext(v: T): T | null | undefined;
  /** 获取源代码路径 */
  getSource(v: T): string | undefined;
  /** 获取文件路径 */
  getFile(v: T): string | undefined;
  /** 获取实例名称 */
  getName(v: T): string | undefined;
}

export type VueResolver<T = any> = ReturnType<typeof createVueResolver<T>>;

/**
 * 创建Vue组件树解析器
 * @param opts 解析器配置选项
 * @returns 返回可用于遍历Vue组件树的解析函数
 */
export function createVueResolver<T = any>(opts: VueResolverOptions<T>) {
  const { isValid, getNext, getSource, getFile, getName } = opts;

  /**
   * 核心解析函数
   * @param debug 调试信息对象
   * @param tree 源代码元数据树的引用
   * @param deepMode 是否深度遍历模式
   */
  function vueResolver(debug: ResolveDebug<T>, tree: Partial<CodeSourceMeta>[], deepMode: boolean) {
    const processedFiles = new Set<string>(); // 已处理文件记录器
    let [currentInstance, currentSource] = resolveAnchorPoint(debug);

    // 主遍历逻辑
    while (isValid(currentInstance)) {
      const normalizedFile = normalizeSource(getFile(currentInstance));

      if (isValidFileName(normalizedFile)) {
        const shouldBreak = currentSource
          ? processSourceFile(normalizedFile)
          : processInstanceFile(normalizedFile);

        if (shouldBreak) return;
      }

      currentInstance = getNext(currentInstance);
    }

    /**
     * 处理源代码关联文件
     * @param filePath 规范化后的文件路径
     */
    function processSourceFile(filePath: string) {
      const sourceMeta = parseSourcePath(currentSource!);
      const instanceMeta = parseSourcePath(filePath);

      // 源文件匹配校验
      if (sourceMeta.file === instanceMeta.file) {
        if (!processedFiles.has(sourceMeta.file)) {
          addToTree(currentInstance, sourceMeta);
          currentSource = normalizeSource(getSource(currentInstance));
        }
        return !deepMode; // 决定是否终止遍历
      }
      return false;
    }

    /**
     * 处理实例关联文件
     * @param filePath 规范化后的文件路径
     */
    function processInstanceFile(filePath: string) {
      const instanceMeta = parseSourcePath(filePath);

      if (!processedFiles.has(instanceMeta.file)) {
        addToTree(currentInstance, instanceMeta);
      }
      return !deepMode; // 决定是否终止遍历
    }

    /**
     * 添加元数据到结果树
     * @param instance 当前Vue实例
     * @param meta 解析后的路径元数据
     */
    function addToTree(instance: T, meta: ReturnType<typeof parseSourcePath>) {
      processedFiles.add(meta.file);
      tree.push({
        name: getName(instance) ?? extractFileName(meta.file),
        file: meta.file,
        line: meta.line,
        column: meta.column,
      });
    }
  }

  /**
   * 解析锚点信息
   * @param debug 调试信息对象
   */
  function resolveAnchorPoint(debug: ResolveDebug) {
    const sourceFromAttr = normalizeSource(debug.el.getAttribute('__source'));
    if (isStr(sourceFromAttr)) {
      return [debug.value, sourceFromAttr] as const;
    }
    return [debug.value, normalizeSource(getSource(debug.value))] as const;
  }

  /**
   * 规范化源代码路径
   * @param source 原始路径字符串
   */
  function normalizeSource(source?: string | null) {
    return source && ensureFileName(normalizePath(source));
  }

  /**
   * 解析源代码路径为结构化元数据
   * @param source 原始路径字符串
   */
  function parseSourcePath(source: string) {
    const [file = '', line = 1, column = 1] = source.split(/:(?=\d)/);
    return {
      file,
      line: Number(line),
      column: Number(column),
    };
  }

  /**
   * 从文件路径中提取显示名称
   * @param filePath 完整文件路径
   */
  function extractFileName(filePath = '') {
    const [, baseName] = filePath.match(/([^/]+)\.[^.]+$/) || [];
    return baseName || 'AnonymousComponent';
  }

  return vueResolver;
}
