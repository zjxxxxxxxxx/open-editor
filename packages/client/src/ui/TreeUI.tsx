import { addClass, removeClass, replaceChildren, applyStyle } from '../utils/dom';
import { inspectorState } from '../inspector/inspectorState';
import { treeCloseBridge, openEditorBridge, treeOpenBridge } from '../bridge';
import { getOptions } from '../options';
import { type CodeSource, type CodeSourceMeta } from '../resolve';

export function TreeUI() {
  const { once } = getOptions();

  const state = {} as {
    root: HTMLElement;
    overlay: HTMLElement;
    popup: HTMLElement;
    popupClose: HTMLElement;
    popupBody: HTMLElement;
  };

  treeOpenBridge.on((source) => {
    inspectorState.isTreeOpen = true;

    renderTree(source);

    applyStyle(state.root, {
      display: 'block',
    });
    addClass(document.body, 'oe-lock-screen');
  });

  treeCloseBridge.on(() => {
    inspectorState.isTreeOpen = false;

    applyStyle(state.root, {
      display: 'none',
    });
    removeClass(document.body, 'oe-lock-screen');
  });

  function renderTree(source: CodeSource) {
    const hasTree = source.tree.length > 0;
    const content = (
      <>
        <div className="oe-tree-title">
          <span className="oe-tree-tag">{source.el} in </span>
          {`<ComponentTree>`}
        </div>
        <div className="oe-tree-content">
          {hasTree ? buildTree(source.tree) : '>> not found 😭.'}
        </div>
      </>
    );

    if (hasTree) {
      removeClass(state.popup, 'oe-tree-error');
    } else {
      addClass(state.popup, 'oe-tree-error');
    }

    replaceChildren(state.popupBody, content);
  }

  function buildTree(tree: CodeSourceMeta[]) {
    const meta = tree.pop()!;
    const tagName = `<${meta.name}>`;
    const fileName = `${meta.file}:${meta.line}:${meta.column}`;

    return (
      <div className="oe-tree-item">
        <div
          className="oe-tree-node"
          title="Click to open in your editor"
          onClick={() => {
            if (once) treeCloseBridge.emit();
            openEditorBridge.emit([meta]);
          }}
        >
          {tagName}
          <span className="oe-tree-file">{fileName}</span>
        </div>
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

  return (
    <div
      className="oe-tree"
      ref={(el) => (state.root = el)}
      onClick={() => treeCloseBridge.emit()}
      onQuickExit={() => treeCloseBridge.emit()}
    >
      <div
        className="oe-tree-popup"
        ref={(el) => (state.popup = el)}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="oe-tree-close"
          ref={(el) => (state.popupClose = el)}
          onClick={() => treeCloseBridge.emit()}
        >
          <svg viewBox="0 0 1024 1024" width="100%" height="100%" fill="currentColor">
            <path d="M569.02728271 509.40447998L877.59753418 817.97473145 820.57025146 872.40649414 512 563.83624268 198.23870849 882.78857422 141.21142578 823.16577148l313.76129151-318.95233154L146.40246582 195.64318847 203.42974854 141.21142578 512 449.78167724 820.57025146 141.21142578 877.59753418 200.83422852 569.02728271 509.40447998z" />
          </svg>
        </button>
        <div className="oe-tree-body" ref={(el) => (state.popupBody = el)}>
          {/* tree element insert here */}
        </div>
      </div>
    </div>
  );
}
