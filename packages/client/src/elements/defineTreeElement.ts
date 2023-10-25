import { isStr } from '@open-editor/shared';
import { append, create } from '../utils/dom';
import { applyStyle, createGlobalStyle, setShadowStyle } from '../utils/style';
import { off, on } from '../utils/event';
import { openEditor } from '../utils/openEditor';
import close from '../icons/close';
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
  --w: calc(100vw - 100px);
  --h: calc(100vh - 100px);

  position: fixed;
  top: 50%;
  left: 50%;
  z-index: var(--z-index-tree);
  transform: translate(-50%, -50%);
  display: inline-block;
  padding: 12px;
  min-width: 250px;
  max-width: min(var(--w), 800px);
  max-height: min(var(--h), 600px);
  border: 1px solid var(--green);
  filter: drop-shadow(0px 0px 2px var(--green));
  border-radius: 2px;
  background-color: var(--bg-color);
}
.popup.empty {
  border: 1px solid var(--red);
  filter: drop-shadow(0px 0px 2px var(--red));
}
.close {
  position: absolute;
  top: 4px;
  right: 4px;
  padding: 8px;
  width: 32px;
  height: 32px;
  color: var(--green);
  background: var(--bg-color);
  border: none;
  border-radius: 99px;
  backdrop-filter: blur(8px);
}
.close:hover {
  background: var(--green-light);
}
.body {
  font-size: 12px;
  overflow: hidden;
}
.empty, .empty .close, .empty .title {
  color: var(--red);
  fill: var(--red);
  border-color: var(--red);
}
.empty .close:hover {
  background: var(--red-light);
}
.content {
  position: relative;
  padding: 0px 12px;
  white-space: nowrap;
  overflow: auto;
  scrollbar-width: none;
}
.content::-webkit-scrollbar {
  display: none;
}
.title {
  padding: 0 38px 4px 0;
  font-size: 14px;
  font-weight: 500;
  color: var(--green);
  white-space: nowrap;
}
.element {
  color: var(--element);
}
.tree {
  position: relative;
  padding-left: 12px;
  width: fit-content;
}
.line {
  position: absolute;
  left: 13px;
  top: 22px;
  opacity: 0.1;
  width: 1px;
  height: calc(100% - 44px);
  background: var(--green);
}
.tag[data-file]:hover > *,
.tag[data-file]:hover ~ .tag > * {
  opacity: 1;
}
.tag[data-file]:hover ~ .line {
  opacity: 0.6;
}
.msg {
  text-decoration: underline;
}
.name {
  font-size: 13px;
  font-weight: 500;
  color: var(--green);
}
.file {
  color: var(--cyan);
}
.name,
.file {
  opacity: 0.5;
}
`;

const overrideCSS = postcss`
:root {
  overflow: hidden !important;
}
`;

export function defineTreeElement() {
  const overrideStyle = createGlobalStyle(overrideCSS);

  class TreeElement extends HTMLElement implements HTMLTreeElement {
    private root!: HTMLElement;
    private overlay!: HTMLElement;
    private popup!: HTMLElement;
    private popupClose!: HTMLElement;
    private popupBody!: HTMLElement;
    private holdElement?: HTMLElement;

    constructor() {
      super();

      const shadow = this.attachShadow({ mode: 'closed' });
      setShadowStyle(shadow, CSS);

      create(
        'div',
        {
          ref: (el) => (this.root = el),
          className: 'root',
        },
        create('div', {
          ref: (el) => (this.overlay = el),
          className: 'overlay',
        }),
        create(
          'div',
          {
            ref: (el) => (this.popup = el),
            className: 'popup',
          },
          create('button', {
            ref: (el) => (this.popupClose = el),
            className: 'close',
            __html: close,
          }),
          create('div', {
            className: 'body',
            ref: (el) => (this.popupBody = el),
          }),
        ),
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
          className: 'content',
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
          '>> not found 😭.',
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
