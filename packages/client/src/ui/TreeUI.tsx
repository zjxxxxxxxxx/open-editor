import { addClass, removeClass, replaceChild, applyStyle } from '../utils/dom';
import { treeCloseBridge, openEditorBridge, treeOpenBridge } from '../bridge';
import { getOptions } from '../options';
import { type CodeSource, type CodeSourceMeta } from '../resolve';

interface TreeUIElements {
  /** 根容器元素 */
  root: HTMLElement;
  /** 弹出层容器 */
  popup: HTMLElement;
  /** 关闭按钮元素 */
  close: HTMLElement;
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
   *
   * @param source 组件代码数据（包含组件树信息）
   */
  function handleTreeOpen(source: CodeSource) {
    renderTreeContent(source);
    applyStyle(elements.root, { display: 'block' });
    addClass(document.body, STYLE_CONSTANTS.LOCK_SCREEN);
  }

  /**
   * 处理树形结构关闭事件
   */
  function handleTreeClose() {
    applyStyle(elements.root, { display: 'none' });
    removeClass(document.body, STYLE_CONSTANTS.LOCK_SCREEN);
  }

  /**
   * 渲染组件树内容（包括标题和节点树或错误提示）
   *
   * @param source 组件代码数据
   */
  function renderTreeContent(source: CodeSource) {
    const hasTreeData = source.tree.length > 0;
    const content = (
      <>
        <div className="oe-tree-title">
          <span className="oe-tree-tag">{source.el} in </span>
          {`<ComponentTree>`}
        </div>
        <div className="oe-tree-content">
          {hasTreeData
            ? renderTreeNodes(source.tree, source.tree.length - 1)
            : '>> 未找到组件树 😭'}
        </div>
      </>
    );

    // 根据是否存在树数据设置错误样式
    if (!hasTreeData) {
      addClass(elements.popup, STYLE_CONSTANTS.ERROR);
    } else {
      removeClass(elements.popup, STYLE_CONSTANTS.ERROR);
    }

    // 更新弹出层内容区域
    replaceChild(elements.content, content);
  }

  /**
   * 递归渲染树节点
   *
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
        {/* 树节点：点击后在编辑器中打开对应代码 */}
        <div
          className="oe-tree-node"
          title="点击在编辑器中打开"
          onClick={() => handleNodeClick(meta)}
        >
          {name}
          <span className="oe-tree-file">{file}</span>
        </div>
        {/* 如果后续还有节点，则递归渲染，并添加连接线和重复显示当前节点 */}
        {index > 0 && (
          <>
            <div className="oe-tree-line" />
            {renderTreeNodes(nodes, index - 1)}
            <div className="oe-tree-node">{name}</div>
          </>
        )}
      </div>
    );
  }

  /**
   * 处理节点点击事件
   *
   * 当节点被点击时，若 once 模式开启则关闭树视图，
   * 同时通过 bridge 传递节点数据给编辑器打开对应文件。
   *
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
      {/* 弹出层容器 */}
      <div
        className="oe-tree-popup"
        ref={(el) => (elements.popup = el)}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 关闭按钮 */}
        <button
          className="oe-tree-close"
          ref={(el) => (elements.close = el)}
          onClick={() => treeCloseBridge.emit()}
        >
          <svg viewBox="0 0 1024 1024" fill="currentColor">
            <path d="M569.02728271 509.40447998L877.59753418 817.97473145 820.57025146 872.40649414 512 563.83624268 198.23870849 882.78857422 141.21142578 823.16577148l313.76129151-318.95233154L146.40246582 195.64318847 203.42974854 141.21142578 512 449.78167724 820.57025146 141.21142578 877.59753418 200.83422852 569.02728271 509.40447998z" />
          </svg>
        </button>
        {/* 内容区域 */}
        <div className="oe-tree-content" ref={(el) => (elements.content = el)} />
      </div>
    </div>
  );
}
