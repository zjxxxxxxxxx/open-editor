import { isStr } from '@open-editor/shared';
import {
  append,
  jsx,
  applyStyle,
  globalStyle,
  host,
  addClass,
  reomveClass,
} from '../utils/html';
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
  touch-action: none;
}
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  z-index: var(--z-index-tree);
  width: 100vw;
  height: 100vh;
  backdrop-filter: blur(8px);
}
.popup {
  position: fixed;
  top: 50%;
  left: 50%;
  z-index: var(--z-index-tree);
  transform: translate(-50%, -50%);
  color: var(--text);
  background: var(--fill);
  box-shadow: 0 0 1px var(--fill-3);
  border-radius: 14px;
}
.close {
  position: absolute;
  top: 4px;
  right: 4px;
  padding: 8px;
  width: 32px;
  height: 32px;
  color: var(--text);
  background: var(--fill);
  border: none;
  border-radius: 99px;
}
.close:hover {
  background: var(--fill-2);
}
.body {
  padding: 16px 24px;
  font-size: 12px;
  overflow: hidden;
}
.error, .error .close, .error .tag {
  color: var(--red);
}
.error .close:hover {
  background: var(--red-light);
}
.content {
  --w: calc(100vw - 148px);
  --h: calc(100vh - 148px);

  padding-right: 12px;
  min-width: 220px;
  max-width: min(var(--w), 500px);
  max-height: min(var(--h), 600px);
  white-space: nowrap;
  overflow: auto;
  scrollbar-width: none;
}
.content::-webkit-scrollbar {
  display: none;
}
.title {
  padding: 0 32px 16px 0;
  font-size: 18px;
  font-weight: 500;
}
.element {
  font-size: 14px;
}
.tree {
  position: relative;
  padding-left: 12px;
}
.line {
  position: absolute;
  left: 13px;
  top: 22px;
  opacity: 0.2;
  width: 1px;
  height: calc(100% - 44px);
  background: var(--text);
}
.tag {
  margin: 2px 0;
}
.tag[data-file]:hover > *,
.tag[data-file]:hover ~ .tag > * {
  opacity: 1;
}
.tag[data-file]:hover ~ .line {
  opacity: 0.6;
}
.name {
  font-size: 13px;
  font-weight: 500;
}
.file {
  padding-left: 6px;
  font-size: 12px;
  color: var(--text-2);
  text-decoration: underline;
}
.name,
.file {
  opacity: 0.6;
}
`;

const overrideCSS = postcss`
:root {
  overflow: hidden !important;
}
`;

export function defineTreeElement() {
  const overrideStyle = globalStyle(overrideCSS);

  class TreeElement extends HTMLElement implements HTMLTreeElement {
    private root!: HTMLElement;
    private overlay!: HTMLElement;
    private popup!: HTMLElement;
    private popupClose!: HTMLElement;
    private popupBody!: HTMLElement;
    private holdElement?: HTMLElement;

    constructor() {
      super();

      host({
        root: this,
        style: CSS,
        element: jsx(
          'div',
          {
            ref: (el) => (this.root = el),
            className: 'root',
          },
          jsx('div', {
            ref: (el) => (this.overlay = el),
            className: 'overlay',
          }),
          jsx(
            'div',
            {
              ref: (el) => (this.popup = el),
              className: 'popup',
            },
            jsx('button', {
              ref: (el) => (this.popupClose = el),
              className: 'close',
              __html: close,
            }),
            jsx('div', {
              className: 'body',
              ref: (el) => (this.popupBody = el),
            }),
          ),
        ),
      });
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
      overrideStyle.insert();
      this.render(resolveSource(element, true));
      applyStyle(this.root, {
        display: 'block',
      });
    };

    close = () => {
      overrideStyle.remove();
      applyStyle(this.root, {
        display: 'none',
      });
      this.popupBody.innerHTML = '';
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
      append(
        this.popupBody,
        jsx(
          'div',
          {
            className: 'title',
          },
          jsx(
            'span',
            {
              className: 'element',
            },
            `${source.element} in `,
          ),
          `<ComponentTree>`,
        ),
      );

      if (source.tree.length) {
        reomveClass(this.popup, 'error');
        append(
          this.popupBody,
          jsx(
            'div',
            {
              className: 'content tree',
            },
            ...buildTree(source.tree),
          ),
        );
      } else {
        addClass(this.popup, 'error');
        append(
          this.popupBody,
          jsx(
            'div',
            {
              className: 'content tag',
            },
            '>> not found 😭.',
          ),
        );
      }
    }
  }

  function buildTree(tree: ElementSourceMeta[]) {
    let nodes: HTMLElement[] = [];
    while (tree.length) {
      const meta = tree.shift()!;
      const startNode = createNode(meta, true);
      if (nodes.length) {
        const lineNode = jsx('div', {
          className: 'line',
        });
        const childNode = jsx(
          'div',
          {
            className: 'tree',
          },
          ...nodes,
        );
        const endNode = createNode(meta);
        nodes = [startNode, lineNode, childNode, endNode];
      } else {
        nodes = [startNode];
      }
    }
    return nodes;
  }

  function createNode(meta: ElementSourceMeta, withFile?: boolean) {
    const { name, file, line = 1, column = 1 } = meta ?? {};
    const dataset = withFile
      ? Object.fromEntries(
          Object.entries(meta).map(([k, v]) => [`data-${k}`, v]),
        )
      : {};
    return jsx(
      'div',
      {
        className: 'tag',
        ...dataset,
      },
      jsx('span', {
        className: 'name',
        ...dataset,
        __text: `<${name}/>`,
      }),
      withFile
        ? jsx('span', {
            className: 'file',
            ...dataset,
            __text: `${file}:${line}:${column}`,
          })
        : null,
    );
  }

  customElements.define(InternalElements.HTML_TREE_ELEMENT, TreeElement);
}
