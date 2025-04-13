import { isStr, normalizePath } from '@open-editor/shared';
import { type ResolveDebug } from './resolveDebug';
import { ensureFileName, isValidFileName, normalizeMeta } from './resolveUtil';
import { type CodeSourceMeta } from '.';

/**
 * Vue 解析器配置项接口
 *
 * @template T 实例类型，默认为any
 */
export interface VueResolverOptions<T = any> {
  /** 验证实例有效性 */
  isValid(v?: T | null): v is T;
  /** 获取下一个关联实例 */
  getNext(v: T): T | null | undefined;
  /** 获取源代码路径（含行列信息） */
  getSource(v?: T | null): string | undefined;
  /** 获取文件路径 */
  getFile(v: T): string | undefined;
  /** 获取实例名称 */
  getName(v: T): string | undefined;
}

// Vue 解析器类型
export type VueResolver<T = any> = ReturnType<typeof createVueResolver<T>>;

/**
 * 创建Vue组件树解析器
 *
 * @param opts 解析器配置选项
 *
 * @returns 返回支持深度遍历的 Vue 组件解析函数
 */
export function createVueResolver<T = any>(opts: VueResolverOptions<T>) {
  const { isValid, getNext, getSource, getFile, getName } = opts;

  /**
   * 核心解析函数
   *
   * @param debug 调试信息对象（包含 DOM 元素和组件实例）
   * @param tree 源代码元数据树（用于收集结果）
   * @param deep 是否深度遍历模式（true 时遍历子树）
   */
  function vueResolver(debug: ResolveDebug<T>, tree: CodeSourceMeta[], deep?: boolean) {
    const processedFiles = new Set<string>();
    let [currentInstance, currentSource] = resolveAnchorPoint(debug);

    while (isValid(currentInstance)) {
      const normalizedFile = normalizeSource(getFile(currentInstance));

      if (isValidFileName(normalizedFile)) {
        const meta = currentSource
          ? processSourceFile(currentInstance, normalizedFile, currentSource)
          : processInstanceFile(currentInstance, normalizedFile);

        if (meta && !processedFiles.has(meta.file)) {
          processedFiles.add(meta.file);
          tree.push(meta);
          // 更新源码路径
          currentSource = normalizeSource(getSource(currentInstance));
        }

        // 非深度模式，且成功处理文件后终止
        if (!deep && meta) {
          return;
        }
      }

      currentInstance = getNext(currentInstance);
    }
  }

  /**
   * 处理带行列信息的源代码文件
   *
   * @param instance 当前组件实例
   * @param filePath 规范化后的文件路径（可能含行列号）
   * @param currentSource 当前组件的源码路径
   *
   * @returns 返回解析后的元数据，或 null 如果文件不一致
   */
  function processSourceFile(instance: T, filePath: string, currentSource: string) {
    const sourceMeta = parseSourcePath(currentSource);
    const instanceMeta = parseSourcePath(filePath);
    if (sourceMeta.file === instanceMeta.file) {
      return normalizeMeta({
        name: getName(instance) ?? extractFileName(sourceMeta.file),
        file: sourceMeta.file,
        line: sourceMeta.line,
        column: sourceMeta.column,
      });
    }
    return null;
  }

  /**
   * 处理组件关联的普通文件
   * @param instance 当前组件实例
   * @param filePath 规范化后的文件路径
   * @returns 返回解析后的元数据
   */
  function processInstanceFile(instance: T, filePath: string) {
    const instanceMeta = parseSourcePath(filePath);
    return normalizeMeta({
      name: getName(instance) ?? extractFileName(instanceMeta.file),
      file: instanceMeta.file,
      line: instanceMeta.line,
      column: instanceMeta.column,
    });
  }

  /**
   * 解析遍历锚点（优先使用 DOM 属性中的源码信息）
   *
   * @param debug 调试信息对象
   *
   * @returns 返回[起始实例, 源码路径]元组
   */
  function resolveAnchorPoint(debug: ResolveDebug<T>) {
    // 优先从DOM属性获取源码信息
    const sourceFromAttr = normalizeSource(debug.el?.getAttribute('__source'));
    if (isStr(sourceFromAttr)) {
      return [debug.value, sourceFromAttr] as const;
    }
    // 回退到组件实例的源码信息
    return [debug.value, normalizeSource(getSource(debug.value))] as const;
  }

  /**
   * 标准化文件路径（统一格式处理）
   *
   * @param source 原始路径字符串
   *
   * @returns 返回处理后的有效路径或 undefined
   */
  function normalizeSource(source?: string | null) {
    if (source) {
      return ensureFileName(normalizePath(source));
    }
  }

  /**
   * 解析路径字符串为结构化元数据
   *
   * @param source 原始路径（可能含行列号）
   *
   * @example "src/App.vue:12:8" → { file: 'src/App.vue', line: 12, column: 8 }
   */
  function parseSourcePath(source: string) {
    const [file, line, column] = source.split(/:(?=\d)/);
    return {
      file,
      line: Number(line),
      column: Number(column),
    };
  }

  /**
   * 从文件路径提取显示名称
   *
   * @param filePath 完整文件路径
   *
   * @example "src/components/Button.vue" → "Button"
   */
  function extractFileName(filePath = '') {
    const [, baseName] = filePath.match(/([^/]+)\.[^.]+$/) || [];
    return baseName;
  }

  return vueResolver;
}
