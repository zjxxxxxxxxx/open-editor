import { isStr } from '@open-editor/shared/type';
import { type DSValue, DS } from '@open-editor/shared/debugSource';
import { type ResolveDebug } from './resolveDebug';
import { ensureFileName, isValidFileName, normalizeName } from './resolveUtil';
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
  getSource(v?: T | null): DSValue | undefined;
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
    let [node, dsValue] = resolveAnchorPoint(debug);

    while (isValid(node)) {
      const file = ensureFileName(getFile(node) || '');

      if (isValidFileName(file)) {
        const meta = dsValue
          ? processSourceFile(node, file, dsValue)
          : processInstanceFile(node, file);

        if (meta && !processedFiles.has(meta.file)) {
          processedFiles.add(meta.file);
          tree.push(meta);
          // 更新源码路径
          dsValue = getSource(node);
        }

        // 非深度模式，且成功处理文件后终止
        if (!deep && meta) {
          return;
        }
      }

      node = getNext(node);
    }
  }

  /**
   * 处理带行列信息的源代码文件
   *
   * @param instance 当前组件实例
   * @param filePath 规范化后的文件路径（可能含行列号）
   * @param dsValue 当前组件的源码路径
   *
   * @returns 返回解析后的元数据，或 null 如果文件不一致
   */
  function processSourceFile(instance: T, filePath: string, dsValue: DSValue) {
    const instanceMeta = DS.parse(filePath);
    if (dsValue.file === instanceMeta.file) {
      return {
        name: normalizeName(getName(instance)),
        ...dsValue,
      };
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
    const instanceMeta = DS.parse(filePath);
    return {
      name: normalizeName(getName(instance)),
      ...instanceMeta,
    };
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
    const sourceFromAttr = debug.el?.getAttribute(DS.ID);
    if (isStr(sourceFromAttr)) {
      return [debug.value, DS.parse(sourceFromAttr)] as const;
    }
    // 回退到组件实例的源码信息
    return [debug.value, getSource(debug.value)] as const;
  }

  return vueResolver;
}
