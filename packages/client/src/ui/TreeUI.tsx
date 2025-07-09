import { addClass, removeClass, replaceChild } from '../utils/dom';
import { treeCloseBridge, openEditorBridge, treeOpenBridge } from '../bridge';
import { getOptions } from '../options';
import { type CodeSource, type CodeSourceMeta } from '../resolve';

interface TreeUIElements {
  /** 根容器元素 */
  root: HTMLElement;
  /** 元素名显示区域 */
  el: HTMLElement;
  /** 弹出层内容区域 */
  content: HTMLElement;
}

/**
 * 组件树 UI 展示组件
 */
export function TreeUI() {
  // 样式常量统一管理
  const STYLE_CONSTANTS = {
    LOCK_SCREEN: 'oe-lock-screen',
    SHOW: 'oe-tree-show',
    ERROR: 'oe-tree-error',
  };

  // 从配置项中获取 once 模式选项
  const { once } = getOptions();
  const elements = {} as TreeUIElements;

  // 初始化桥接器事件监听
  setupBridgeListeners();

  /**
   * 注册桥接器事件监听
   */
  function setupBridgeListeners() {
    treeOpenBridge.on(handleTreeOpen);
    treeCloseBridge.on(handleTreeClose);
  }

  /**
   * 处理树形结构打开事件
   * @param source 组件代码数据（包含组件树信息）
   */
  function handleTreeOpen(source: CodeSource) {
    renderTreeContent(source);
    addClass(elements.root, STYLE_CONSTANTS.SHOW);
    addClass(document.body, STYLE_CONSTANTS.LOCK_SCREEN);
  }

  /**
   * 处理树形结构关闭事件
   */
  function handleTreeClose() {
    removeClass(elements.root, STYLE_CONSTANTS.SHOW);
    removeClass(document.body, STYLE_CONSTANTS.LOCK_SCREEN);
  }

  /**
   * 渲染组件树内容（包括标题和节点树或错误提示）
   * @param source 组件代码数据
   */
  function renderTreeContent(source: CodeSource) {
    const hasTreeData = source.tree.length > 0;

    // 根据是否存在树数据设置错误样式
    if (!hasTreeData) {
      addClass(elements.root, STYLE_CONSTANTS.ERROR);
    } else {
      removeClass(elements.root, STYLE_CONSTANTS.ERROR);
    }

    elements.el.textContent = `${source.el} in `;

    const content = hasTreeData ? (
      renderTreeNodes(source.tree, source.tree.length - 1)
    ) : (
      <>{'>> 未找到组件树 😭'}</>
    );

    // 更新弹出层内容区域
    replaceChild(elements.content, content);
  }

  /**
   * 递归渲染树节点
   * @param nodes 节点数据数组
   * @param index 当前处理节点的索引，从后向前 -1
   * @returns 构造好的 JSX 结构
   */
  function renderTreeNodes(nodes: CodeSourceMeta[], index: number) {
    const meta = nodes[index];
    const name = `<${meta.name}>`;
    const file = `${meta.file}:${meta.line}:${meta.column}`;

    return (
      <div className="oe-tree-item">
        <div className="oe-tree-node" data-open onClick={() => handleNodeClick(meta)}>
          {name}
          <span className="oe-tree-file">{file}</span>
        </div>
        {/* 如果后续还有节点，则递归渲染，并添加连接线和重复显示当前节点 */}
        {index > 0 && (
          <>
            <div className="oe-tree-line" />
            {renderTreeNodes(nodes, index - 1)}
            <div className="oe-tree-node" data-close>
              {name}
            </div>
          </>
        )}
      </div>
    );
  }

  /**
   * 处理节点点击事件
   *
   * 当节点被点击时，若 once 模式开启则关闭树视图，
   * 同时通过 bridge 传递节点数据给编辑器打开对应文件
   * @param meta 当前节点的元数据信息
   */
  function handleNodeClick(meta: CodeSourceMeta) {
    if (once) treeCloseBridge.emit();
    openEditorBridge.emit([meta]);
  }

  return (
    <div
      className="oe-tree"
      ref={(el) => (elements.root = el)}
      onClick={() => treeCloseBridge.emit()}
      onQuickExit={() => treeCloseBridge.emit()}
    >
      <div className="oe-tree-popup" onClick={(e) => e.stopPropagation()}>
        <button className="oe-tree-close" onClick={() => treeCloseBridge.emit()}>
          <svg viewBox="0 0 1024 1024" fill="currentColor">
            <path d="M569.02728271 509.40447998L877.59753418 817.97473145 820.57025146 872.40649414 512 563.83624268 198.23870849 882.78857422 141.21142578 823.16577148l313.76129151-318.95233154L146.40246582 195.64318847 203.42974854 141.21142578 512 449.78167724 820.57025146 141.21142578 877.59753418 200.83422852 569.02728271 509.40447998z" />
          </svg>
        </button>
        <div className="oe-tree-title">
          <span className="oe-tree-el" ref={(el) => (elements.el = el)} />
          <span className="oe-tree-name">{'<ComponentTree>'}</span>
        </div>
        <div className="oe-tree-content" ref={(el) => (elements.content = el)} />
      </div>
    </div>
  );
}
