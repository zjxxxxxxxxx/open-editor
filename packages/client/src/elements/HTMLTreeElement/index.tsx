import { isStr } from '@open-editor/shared';
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
  show = false;

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
            <div
              className="oe-body"
              ref={(el) => (this.state.popupBody = el)}
              onClick={this.openEditor}
            >
              {/* tree element insert here */}
            </div>
          </div>
        </div>
      </>
    );
  }

  open = (el: HTMLElement) => {
    this.show = true;
    this.renderBodyContent(el);
    this.enableClick();

    addClass(this.state.root, 'oe-show');
    addClass(getHtml(), 'oe-screen-lock');
  };

  close = () => {
    this.show = false;

    removeClass(this.state.root, 'oe-show');
    removeClass(getHtml(), 'oe-screen-lock');
  };

  // Prevent the display of the component tree by long press, which accidentally triggers the click event
  private enableClick = () => {
    this.state.clickable = false;
    const enable = () => {
      this.state.clickable = true;
      off('pointerdown', enable);
    };
    on('pointerdown', enable);
  };

  private exit = () => {
    if (this.state.clickable) {
      this.close();
    }
  };

  private openEditor = async (e: MouseEvent) => {
    const el = e.target as HTMLElement;
    const source = el.dataset as unknown as SourceCodeMeta;
    if (this.state.clickable && isStr(source.file)) {
      try {
        addClass(getHtml(), 'oe-loading');
        const { once } = getOptions();
        if (once) this.close();
        await openEditor(source, (e) => this.dispatchEvent(e));
      } finally {
        removeClass(getHtml(), 'oe-loading');
      }
    }
  };

  private renderBodyContent(el: HTMLElement) {
    const source = resolveSource(el, true);
    const hasTree = source.tree.length > 0;
    const content = (
      <>
        <div className="oe-title">
          <span className="oe-el">{source.el} in </span>
          {`<ComponentTree>`}
        </div>
        <div className="oe-content oe-tree">
          {hasTree ? buildTree(source.tree) : '>> not found 😭.'}
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
}

function buildTree(tree: SourceCodeMeta[]) {
  let nodes: HTMLElement | null = null;

  while (tree.length) {
    const meta = tree.shift()!;
    const dataset = toDataset(meta);
    const { name, file, line = 1, column = 1 } = meta;
    const tag = (
      <p className="oe-tag" title="Click to open in your editor" {...dataset}>
        {`<${name}>`}
        <span className="oe-file">
          {file}:{line}:{column}
        </span>
      </p>
    );

    if (!nodes) {
      nodes = tag;
    } else {
      nodes = (
        <>
          {tag}
          <div className="oe-line"></div>
          <div className="oe-tree">{nodes}</div>
          <p className="oe-tag">{`<${name}>`}</p>
        </>
      );
    }
  }

  return nodes;
}

function toDataset(meta: SourceCodeMeta) {
  return Object.fromEntries(
    Object.entries(meta).map(([k, v]) => [`data-${k}`, v]),
  );
}
