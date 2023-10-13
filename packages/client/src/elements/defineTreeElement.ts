import { isStr } from '@open-editor/shared';
import { append, applyStyle, create, off, on } from '../utils/document';
import { createStyleInject } from '../utils/createStyleInject';
import { openEditor } from '../utils/openEditor';
import { InternalElements } from '../constants';
import type { ElementSource, ElementSourceMeta } from '../resolve';
import { resolveSource } from '../resolve';

export interface HTMLTreeElement extends HTMLElement {
  open(element: HTMLElement): void;
  close(): void;
}

const CSS = postcss`
.root {
  position: fixed;
  top: 0;
  left: 0;
  z-index: var(--z-index-tree);
  display: none;
  width: 100vw;
  height: 100vh;
  backdrop-filter: blur(8px);
  background-color: var(--bg-opt);
}
.popup {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: inline-block;
  padding: 20px;
  border: 2px solid var(--green);
  border-radius: 6px;
  background-color: var(--bg-color);
}
.content {
  padding-right: 14px;
  min-width: min(calc(100vw - 152px), 300px);
  max-width: min(calc(100vw - 152px), 800px);
  max-height: min(calc(100vh - 152px), 600px);
  white-space: nowrap;
  overflow: auto;
  scrollbar-width: none;
}
.content::-webkit-scrollbar {
  display: none;
}
.tree {
  position: relative;
  padding-left: 14px;
}
.line {
  position: absolute;
  left: 15px;
  top: 22px;
  opacity: 0.1;
  width: 1px;
  height: calc(100% - 44px);
  background: var(--green);
}
.close {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 16px;
  height: 16px;
  fill: var(--green);
}
.title {
  padding-bottom: 12px;
  font-size: 16px;
  font-weight: 500;
  color: var(--green);
}
.element {
  font-size: 14px;
  color: var(--element);
}
.empty {
  color: var(--red);
  fill: var(--red);
  border-color: var(--red);
}
.tag[data-file]:hover > *,
.tag[data-file]:hover ~ .tag > * {
  opacity: 1;
}
.tag[data-file]:hover ~ .line {
  opacity: 0.6;
}
.msg {
  font-size: 12px;
  text-decoration: underline;
}
.name {
  font-size: 14px;
  font-weight: 500;
  color: var(--green);
}
.file {
  font-size: 12px;
  color: var(--cyan);
}
.name,
.file {
  opacity: 0.3;
}
`;

const scrollLockCSS = postcss`
body {
  overflow: hidden !important;
}
`;

const closeIcon = `
<svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
  <path d="M619.53908575 512l327.95607772-327.19338858a76.26885573 76.26885573 0 1 0-108.30177489-108.30177489L512 404.46091425l-327.19338858-327.95607772a76.26885573 76.26885573 0 0 0-108.30177489 108.30177489l327.95607772 327.19338858-327.95607772 327.19338858a76.26885573 76.26885573 0 0 0 0 108.30177489 76.26885573 76.26885573 0 0 0 108.30177489 0l327.19338858-327.95607772 327.19338858 327.95607772a76.26885573 76.26885573 0 0 0 108.30177489 0 76.26885573 76.26885573 0 0 0 0-108.30177489z"></path>
</svg>
`;

export function defineTreeElement() {
  const scrollLockStyle = createStyleInject(scrollLockCSS);

  class TreeElement extends HTMLElement implements HTMLTreeElement {
    private root: HTMLElement;
    private popup: HTMLElement;
    private holdElement?: HTMLElement;

    constructor() {
      super();

      const shadow = this.attachShadow({ mode: 'closed' });
      shadow.innerHTML = `<style>${CSS}</style>`;

      this.root = create('div');
      this.root.classList.add('root');

      this.popup = create('div');
      this.popup.classList.add('popup');

      append(this.root, this.popup);
      append(shadow, this.root);
    }

    connectedCallback() {
      on('click', this.handlePopupEvent, {
        target: this.popup,
      });
      on('pointerdown', this.setHoldElement, {
        target: this.popup,
      });
    }

    disconnectedCallback() {
      off('click', this.handlePopupEvent, {
        target: this.popup,
      });
      off('pointerdown', this.setHoldElement, {
        target: this.popup,
      });
      off('click', this.close, {
        target: this.root.querySelector('.close'),
      });
    }

    open = (element: HTMLElement) => {
      const source = resolveSource(element, true);

      const hasTree = !!source.tree.length;
      if (hasTree) {
        this.renderTreeView(source);
      } else {
        this.renderEmptyView(source);
      }

      applyStyle(this.root, {
        display: 'block',
      });
      on('click', this.close, {
        target: this.root.querySelector('.close'),
      });

      scrollLockStyle.insert();
    };

    close = () => {
      applyStyle(this.root, {
        display: 'none',
      });
      scrollLockStyle.remove();
    };

    private renderTreeView(source: ElementSource) {
      this.popup.classList.remove('empty');
      const title = `<div class="title"><span class="element">${source.element} in </span> &lt;ComponentTree&gt;</div>`;
      const close = `<span class="close">${closeIcon}</span>`;
      const tree = buildTree(source.tree);
      const content = `<div class="content"><div class="tree">${tree}</div></div>`;
      this.popup.innerHTML = `${title} ${close} ${content}`;
    }

    private renderEmptyView(source: ElementSource) {
      this.popup.classList.add('empty');
      const title = `<div class="title empty"><span class="element">${source.element} in </span> &lt;ComponentTree&gt;</div>`;
      const close = `<span class="close empty">${closeIcon}</span>`;
      const content = `<div class="msg empty">empty tree 😭.</div>`;
      this.popup.innerHTML = `${title} ${close} ${content}`;
    }

    private setHoldElement = (event: PointerEvent) => {
      this.holdElement = <HTMLElement>event.target;
    };

    private handlePopupEvent = (event: PointerEvent) => {
      const element = <HTMLElement>event.target;
      // Prevent the display of the component tree by long press, which accidentally triggers the click event
      if (element === this.holdElement && isStr(element.dataset.file)) {
        openEditor(
          <ElementSourceMeta>(<unknown>element.dataset),
          this.dispatchEvent.bind(this),
        );
        this.dispatchEvent(new CustomEvent('exit'));
      }
    };
  }

  function buildTree(tree: ElementSourceMeta[]) {
    let template = '';
    while (tree.length) {
      const meta = tree.shift()!;
      const startTag = createTag(meta, true);
      if (!template) {
        template = startTag;
      } else {
        const endTag = createTag(meta);
        const childTag = `<div class="tree">${template}</div><div class="line"></div>`;
        template = `${startTag} ${childTag} ${endTag}`;
      }
    }
    return template;
  }

  function createTag(meta: ElementSourceMeta, withFile?: boolean) {
    const { name, file, line = 1, column = 1 } = meta ?? {};

    if (!withFile) {
      return `<div class="tag"><span class="name">&lt;/${name}&gt;</span></div>`;
    }

    const dataset = Object.entries(meta).reduce(
      (str, [key, value]) => `${str} data-${key}="${value}"`,
      '',
    );
    const tagName = `<span class="name" ${dataset}>&lt;${name}&gt;</span>`;
    const fileName = `<span class="file" ${dataset}>${file}:${line}:${column}</span>`;
    return `<div class="tag" ${dataset}> ${tagName} ${fileName} </div>`;
  }

  customElements.define(InternalElements.HTML_TREE_ELEMENT, TreeElement);
}
