import { addClass, removeClass, getHtml, resetChildren } from '../../utils/ui';
import { off, on } from '../../utils/event';
import { openEditor } from '../../utils/openEditor';
import { type SourceCodeMeta, resolveSource } from '../../resolve';
import { getOptions } from '../../options';
import { HTMLCustomElement } from '../HTMLCustomElement';

export class HTMLTreeElement extends HTMLCustomElement<{
  root: HTMLElement;
  overlay: HTMLElement;
  popup: HTMLElement;
  popupClose: HTMLElement;
  popupBody: HTMLElement;
  clickable: boolean;
}> {
  declare isOpen: boolean;

  constructor() {
    super();
    this.open = this.open.bind(this);
    this.close = this.close.bind(this);
    this.enableClick = this.enableClick.bind(this);
    this.exit = this.exit.bind(this);
  }

  override host() {
    return (
      <>
        <link rel="stylesheet" href="./index.css" />
        <div
          className="oe-root"
          ref={(el) => (this.state.root = el)}
          onQuickExit={this.close}
        >
          <div
            className="oe-overlay"
            ref={(el) => (this.state.overlay = el)}
            onClick={this.exit}
          />
          <div className="oe-popup" ref={(el) => (this.state.popup = el)}>
            <button
              className="oe-close"
              ref={(el) => (this.state.popupClose = el)}
              onClick={this.exit}
            >
              <svg
                viewBox="0 0 1024 1024"
                width="100%"
                height="100%"
                fill="currentColor"
              >
                <path d="M569.02728271 509.40447998L877.59753418 817.97473145 820.57025146 872.40649414 512 563.83624268 198.23870849 882.78857422 141.21142578 823.16577148l313.76129151-318.95233154L146.40246582 195.64318847 203.42974854 141.21142578 512 449.78167724 820.57025146 141.21142578 877.59753418 200.83422852 569.02728271 509.40447998z" />
              </svg>
            </button>
            <div className="oe-body" ref={(el) => (this.state.popupBody = el)}>
              {/* tree element insert here */}
            </div>
          </div>
        </div>
      </>
    );
  }

  open(el: HTMLElement) {
    this.isOpen = true;
    this.renderTree(el);
    this.enableClick();
    addClass(this.state.root, 'oe-show');
    addClass(getHtml(), 'oe-screen-lock');
  }

  close() {
    this.isOpen = false;
    removeClass(this.state.root, 'oe-show');
    removeClass(getHtml(), 'oe-screen-lock');
  }

  private renderTree(el: HTMLElement) {
    const source = resolveSource(el, true);
    const hasTree = source.tree.length > 0;
    const content = (
      <>
        <div className="oe-title">
          <span className="oe-tag">{source.el} in </span>
          {`<ComponentTree>`}
        </div>
        <div className="oe-content">
          {hasTree ? this.buildTree(source.tree) : '>> not found 😭.'}
        </div>
      </>
    );
    if (hasTree) {
      removeClass(this.state.popup, 'oe-error');
    } else {
      addClass(this.state.popup, 'oe-error');
    }
    resetChildren(this.state.popupBody, content);
  }

  private buildTree(tree: SourceCodeMeta[]) {
    const meta = tree.pop()!;
    const tagName = `<${meta.name}>`;
    const fileName = `${meta.file}:${meta.line}:${meta.column}`;
    const onOpenEditor = () => this.openEditor(meta);
    return (
      <div className="oe-tree">
        <div
          className="oe-node"
          title="Click to open in your editor"
          onClick={onOpenEditor}
        >
          {tagName}
          <span className="oe-file">{fileName}</span>
        </div>
        {tree.length > 0 && (
          <>
            <div className="oe-line" />
            {this.buildTree(tree)}
            <div className="oe-node">{tagName}</div>
          </>
        )}
      </div>
    );
  }

  // Prevent the display of the component tree by long press, which accidentally triggers the click event
  private enableClick() {
    this.state.clickable = false;
    const enable = () => {
      this.state.clickable = true;
      off('pointerdown', enable);
    };
    on('pointerdown', enable);
  }

  private exit() {
    if (this.state.clickable) {
      this.close();
    }
  }

  private async openEditor(meta: SourceCodeMeta) {
    if (this.state.clickable) {
      try {
        addClass(getHtml(), 'oe-loading');
        const { once } = getOptions();
        if (once) this.close();
        const dispatch = (e: CustomEvent<URL>) => this.dispatchEvent(e);
        await openEditor(meta, dispatch);
      } finally {
        removeClass(getHtml(), 'oe-loading');
      }
    }
  }
}
