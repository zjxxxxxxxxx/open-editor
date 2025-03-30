import { isStr, normalizePath } from '@open-editor/shared';
import { type ResolveDebug } from './resolveDebug';
import { ensureFileName, isValidFileName, normalizeMeta } from './resolveUtil';
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
  /** 获取源代码路径（含行列信息） */
  getSource(v: T): string | undefined;
  /** 获取文件路径 */
  getFile(v: T): string | undefined;
  /** 获取实例名称 */
  getName(v: T): string | undefined;
}

export type VueResolver<T = any> = ReturnType<typeof createVueResolver<T>>;

// 开始
//   │
//   ├─▶ 锚点解析 → 确定起始组件和源码路径
//   │
//   ├─▶ 主循环遍历组件树
//   │   │
//   │   ├─▶ 有效性校验 → 过滤无效组件
//   │   │
//   │   ├─▶ 路径标准化 → 统一格式处理
//   │   │
//   │   ├─▶ 处理分流 → 判断处理源文件或组件文件
//   │   │   │
//   │   │   ├─▶ 源文件处理 → 解析行列信息
//   │   │   │
//   │   │   └─▶ 组件文件处理 → 提取基础信息
//   │   │
//   │   ├─▶ 元数据生成 → 标准化数据结构
//   │   │
//   │   └─▶ 深度控制 → 决定是否继续遍历子树
//   │
//   └─▶ 结果收集 → 输出标准化元数据树

/*------------------------------------------
核心流程说明：
1. 锚点解析阶段：通过调试信息定位起始组件
2. 主循环遍历阶段：逐级处理组件树节点
3. 文件处理阶段：
   a. 有源码路径 → 处理带行列信息的源文件
   b. 无源码路径 → 处理组件关联文件
4. 元数据生成阶段：标准化并缓存文件元数据
5. 深度控制阶段：根据模式决定是否继续遍历子树
-------------------------------------------*/

/**
 * 创建Vue组件树解析器
 * @param opts 解析器配置选项
 * @returns 返回支持深度遍历的Vue组件解析函数
 */
export function createVueResolver<T = any>(opts: VueResolverOptions<T>) {
  const { isValid, getNext, getSource, getFile, getName } = opts;

  /**
   * 核心解析函数
   * @param debug 调试信息对象（包含DOM元素和组件实例）
   * @param tree 源代码元数据树的引用（用于收集结果）
   * @param deep 是否深度遍历模式（true时遍历子树）
   */
  function vueResolver(debug: ResolveDebug<T>, tree: CodeSourceMeta[], deep?: boolean) {
    // 已处理文件记录器（避免重复处理同一文件）
    const processedFiles = new Set<string>();

    // 阶段1：锚点解析 - 确定遍历起点
    let [currentInstance, currentSource] = resolveAnchorPoint(debug);

    // 阶段2：主循环遍历 - 逐级处理组件树
    while (isValid(currentInstance)) {
      const normalizedFile = normalizeSource(getFile(currentInstance));

      // 有效性校验通过后执行处理
      if (isValidFileName(normalizedFile)) {
        // 阶段3：文件处理分流
        const shouldBreak = currentSource
          ? processSourceFile(normalizedFile) // 3a：处理带源码信息的文件
          : processInstanceFile(normalizedFile); // 3b：处理组件关联文件

        // 根据处理结果决定是否终止遍历
        if (shouldBreak) return;
      }

      // 移动到下一个组件实例
      currentInstance = getNext(currentInstance);
    }

    /*------------------------------------------
    文件处理子流程说明：
    - processSourceFile：处理包含行列信息的源码路径（如：src/App.vue:12:8）
    - processInstanceFile：处理普通组件文件路径（如：src/components/Button.vue）
    -------------------------------------------*/

    /**
     * 处理带行列信息的源代码文件
     * @param filePath 规范化后的文件路径（可能含行列号）
     * @returns 返回是否终止遍历的标识
     */
    function processSourceFile(filePath: string) {
      // 阶段4：元数据解析
      const sourceMeta = parseSourcePath(currentSource!);
      const instanceMeta = parseSourcePath(filePath);

      // 源文件一致性校验
      if (sourceMeta.file === instanceMeta.file) {
        if (!processedFiles.has(sourceMeta.file)) {
          // 阶段5：元数据注入
          addToTree(currentInstance, sourceMeta);
          // 更新当前源码路径
          currentSource = normalizeSource(getSource(currentInstance));
        }
        // 非深度模式立即终止遍历
        return !deep;
      }
      return false;
    }

    /**
     * 处理组件关联的普通文件
     * @param filePath 规范化后的文件路径
     * @returns 返回是否终止遍历的标识
     */
    function processInstanceFile(filePath: string) {
      const instanceMeta = parseSourcePath(filePath);

      if (!processedFiles.has(instanceMeta.file)) {
        addToTree(currentInstance, instanceMeta);
      }
      // 非深度模式立即终止遍历
      return !deep;
    }

    /**
     * 添加标准化元数据到结果树
     * @param instance 当前Vue组件实例
     * @param meta 解析后的路径元数据
     */
    function addToTree(instance: T, meta: ReturnType<typeof parseSourcePath>) {
      processedFiles.add(meta.file);
      tree.push(
        normalizeMeta({
          // 优先使用组件名，无则提取文件名
          name: getName(instance) ?? extractFileName(meta.file),
          file: meta.file,
          line: meta.line,
          column: meta.column,
        }),
      );
    }
  }

  /**
   * 解析遍历锚点（优先使用DOM属性中的源码信息）
   * @param debug 调试信息对象
   * @returns 返回[起始实例, 源码路径]元组
   */
  function resolveAnchorPoint(debug: ResolveDebug) {
    // 优先从DOM属性获取源码信息
    const sourceFromAttr = normalizeSource(debug.el.getAttribute('__source'));
    if (isStr(sourceFromAttr)) {
      return [debug.value, sourceFromAttr] as const;
    }
    // 回退到组件实例的源码信息
    return [debug.value, normalizeSource(getSource(debug.value))] as const;
  }

  /**
   * 标准化文件路径（统一格式处理）
   * @param source 原始路径字符串
   * @returns 返回处理后的有效路径或undefined
   */
  function normalizeSource(source?: string | null) {
    return source && ensureFileName(normalizePath(source));
  }

  /**
   * 解析路径字符串为结构化元数据
   * @param source 原始路径（可能含行列号）
   * @example "src/App.vue:12:8" → { file: 'src/App.vue', line: 12, column: 8 }
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
   * 从文件路径提取显示名称
   * @param filePath 完整文件路径
   * @example "src/components/Button.vue" → "Button"
   */
  function extractFileName(filePath = '') {
    const [, baseName] = filePath.match(/([^/]+)\.[^.]+$/) || [];
    return baseName;
  }

  return vueResolver;
}
