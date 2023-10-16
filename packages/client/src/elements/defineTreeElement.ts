import { isStr } from '@open-editor/shared';
import { append, create } from '../utils/dom';
import { applyStyle, createGlobalStyle, setShadowStyle } from '../utils/style';
import { off, on } from '../utils/event';
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
  display: none;
}
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  z-index: var(--z-index-tree);
  width: 100vw;
  height: 100vh;
  backdrop-filter: blur(8px);
  background-color: var(--bg-opt);
}
.popup {
  position: fixed;
  top: 50%;
  left: 50%;
  z-index: var(--z-index-tree);
  transform: translate(-50%, -50%);
  display: inline-block;
  padding: 22px 28px;
  border: 2px solid var(--green);
  border-radius: 6px;
  background-color: var(--bg-color);
}
.content {
  padding-right: 14px;
  min-width: min(calc(100vw - 176px), 300px);
  max-width: min(calc(100vw - 176px), 800px);
  max-height: min(calc(100vh - 176px), 600px);
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
  white-space: nowrap;
}
.element {
  font-size: 14px;
  color: var(--element);
}
.empty, .empty .close, .empty .title {
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

const overrideCSS = postcss`
:root {
  overflow: hidden !important;
}
`;

const closeIcon = `
<svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
  <path d="M619.53908575 512l327.95607772-327.19338858a76.26885573 76.26885573 0 1 0-108.30177489-108.30177489L512 404.46091425l-327.19338858-327.95607772a76.26885573 76.26885573 0 0 0-108.30177489 108.30177489l327.95607772 327.19338858-327.95607772 327.19338858a76.26885573 76.26885573 0 0 0 0 108.30177489 76.26885573 76.26885573 0 0 0 108.30177489 0l327.19338858-327.95607772 327.19338858 327.95607772a76.26885573 76.26885573 0 0 0 108.30177489 0 76.26885573 76.26885573 0 0 0 0-108.30177489z"></path>
</svg>
`;

export function defineTreeElement() {
  const overrideStyle = createGlobalStyle(overrideCSS);

  class TreeElement extends HTMLElement implements HTMLTreeElement {
    private root: HTMLElement;
    private overlay: HTMLElement;
    private popup: HTMLElement;
    private popupClose: HTMLElement;
    private popupBody: HTMLElement;
    private holdElement?: HTMLElement;

    constructor() {
      super();

      const shadow = this.attachShadow({ mode: 'closed' });
      setShadowStyle(shadow, CSS);

      this.root = create(
        'div',
        {
          className: 'root',
        },
        (this.overlay = create('div', {
          className: 'overlay',
        })),
        (this.popup = create(
          'div',
          {
            className: 'popup',
          },
          (this.popupClose = create('span', {
            className: 'close',
            __html: closeIcon,
          })),
          (this.popupBody = create('div')),
        )),
      );

      append(shadow, this.root);
    }

    connectedCallback() {
      on('pointerdown', this.setHoldElement, {
        target: this.root,
      });
      on('click', this.safeClose, {
        target: this.overlay,
      });
      on('click', this.safeClose, {
        target: this.popupClose,
      });
      on('click', this.tryOpenEditor, {
        target: this.popupBody,
      });
    }

    disconnectedCallback() {
      off('pointerdown', this.setHoldElement, {
        target: this.root,
      });
      off('click', this.safeClose, {
        target: this.overlay,
      });
      off('click', this.safeClose, {
        target: this.popupClose,
      });
      off('click', this.tryOpenEditor, {
        target: this.popupBody,
      });
    }

    open = (element: HTMLElement) => {
      const source = resolveSource(element, true);
      this.render(source);
      overrideStyle.insert();
      applyStyle(this.root, {
        display: 'block',
      });
    };

    close = () => {
      this.popupBody.innerHTML = '';
      overrideStyle.remove();
      applyStyle(this.root, {
        display: 'none',
      });
    };

    private setHoldElement = (event: PointerEvent) => {
      this.holdElement = <HTMLElement>event.target;
    };

    // Prevent the display of the component tree by long press, which accidentally triggers the click event
    private checkHoldElement = (event: PointerEvent) => {
      return <HTMLElement>event.target === this.holdElement;
    };

    private safeClose = (event: PointerEvent) => {
      if (this.checkHoldElement(event)) {
        this.close();
      }
    };

    private tryOpenEditor = (event: PointerEvent) => {
      const element = <HTMLElement>event.target!;
      const source = <ElementSourceMeta>(<unknown>element.dataset);
      if (this.checkHoldElement(event) && isStr(source.file)) {
        openEditor(source, (event) => this.dispatchEvent(event));
        this.dispatchEvent(new CustomEvent('exit'));
      }
    };

    private render(source: ElementSource) {
      const title = create(
        'div',
        {
          className: 'title',
        },
        create(
          'span',
          {
            className: 'element',
          },
          `${source.element} in `,
        ),
        `<ComponentTree>`,
      );
      append(this.popupBody, title);

      const hasTree = !!source.tree.length;
      if (hasTree) {
        const content = create('div', {
          className: 'content tree',
          __html: buildTree(source.tree),
        });
        append(this.popupBody, content);
        this.popup.classList.remove('empty');
      } else {
        const content = create(
          'div',
          {
            className: 'msg',
          },
          'empty tree 😭.',
        );
        append(this.popupBody, content);
        this.popup.classList.add('empty');
      }
    }
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
