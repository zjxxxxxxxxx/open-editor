import { addClass, removeClass, replaceChildren, applyStyle } from '../utils/dom';
import { treeCloseBridge, openEditorBridge, treeOpenBridge } from '../bridge';
import { getOptions } from '../options';
import { type CodeSource, type CodeSourceMeta } from '../resolve';

interface TreeUIElements {
  /** 根容器元素 */
  root: HTMLElement;
  /** 弹出层容器 */
  popup: HTMLElement;
  /** 关闭按钮元素 */
  popupClose: HTMLElement;
  /** 弹出层内容区域 */
  popupBody: HTMLElement;
}

/** 组件树UI展示组件 */
export function TreeUI() {
  // 样式常量（避免硬编码）
  const LOCK_SCREEN_CLASS = 'oe-lock-screen';

  const { once } = getOptions();
  const elements = {} as TreeUIElements;

  // 初始化桥接器事件监听
  initBridgeListeners();

  /** 初始化所有桥接器事件监听 */
  function initBridgeListeners() {
    treeOpenBridge.on(handleTreeOpen);
    treeCloseBridge.on(handleTreeClose);
  }

  /** 处理树形结构打开事件 */
  function handleTreeOpen(source: CodeSource) {
    renderTree(source);
    applyStyle(elements.root, { display: 'block' });
    addClass(document.body, LOCK_SCREEN_CLASS);
  }

  /** 处理树形结构关闭事件 */
  function handleTreeClose() {
    applyStyle(elements.root, { display: 'none' });
    removeClass(document.body, LOCK_SCREEN_CLASS);
  }

  /** 渲染组件树内容 */
  function renderTree(source: CodeSource) {
    const hasTree = source.tree.length > 0;
    const content = (
      <>
        <div className="oe-tree-title">
          <span className="oe-tree-tag">{source.el} in </span>
          {`<ComponentTree>`}
        </div>
        <div className="oe-tree-content">
          {hasTree ? buildTree(source.tree) : '>> 未找到组件树 😭'}
        </div>
      </>
    );

    // 根据是否有数据设置错误状态
    const popupClass = hasTree ? 'oe-tree-error' : '';
    hasTree ? removeClass(elements.popup, popupClass) : addClass(elements.popup, popupClass);

    replaceChildren(elements.popupBody, content);
  }

  /** 递归构建树形结构 */
  function buildTree(tree: CodeSourceMeta[]) {
    const meta = tree.pop()!;
    const tagName = `<${meta.name}>`;
    const fileName = `${meta.file}:${meta.line}:${meta.column}`;

    return (
      <div className="oe-tree-item" key={meta.name}>
        {/* 树节点元素 */}
        <div
          className="oe-tree-node"
          title="点击在编辑器中打开"
          onClick={() => handleNodeClick(meta)}
        >
          {tagName}
          <span className="oe-tree-file">{fileName}</span>
        </div>

        {/* 递归渲染子树 */}
        {tree.length > 0 && (
          <>
            <div className="oe-tree-line" />
            {buildTree(tree)}
            <div className="oe-tree-node">{tagName}</div>
          </>
        )}
      </div>
    );
  }

  /** 处理节点点击事件 */
  function handleNodeClick(meta: CodeSourceMeta) {
    if (once) treeCloseBridge.emit();
    openEditorBridge.emit([meta]);
  }

  return (
    <div
      className="oe-tree"
      ref={(el) => (elements.root = el!)}
      onClick={() => treeCloseBridge.emit()}
      onQuickExit={() => treeCloseBridge.emit()}
    >
      {/* 弹出层容器 */}
      <div
        className="oe-tree-popup"
        ref={(el) => (elements.popup = el!)}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 关闭按钮 */}
        <button
          className="oe-tree-close"
          ref={(el) => (elements.popupClose = el!)}
          onClick={() => treeCloseBridge.emit()}
        >
          <svg viewBox="0 0 1024 1024" fill="currentColor">
            <path d="M569.02728271 509.40447998L877.59753418 817.97473145 820.57025146 872.40649414 512 563.83624268 198.23870849 882.78857422 141.21142578 823.16577148l313.76129151-318.95233154L146.40246582 195.64318847 203.42974854 141.21142578 512 449.78167724 820.57025146 141.21142578 877.59753418 200.83422852 569.02728271 509.40447998z" />
          </svg>
        </button>

        {/* 内容区域 */}
        <div className="oe-tree-body" ref={(el) => (elements.popupBody = el!)} />
      </div>
    </div>
  );
}
