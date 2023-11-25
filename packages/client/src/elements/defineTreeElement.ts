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
import {
  type ElementSource,
  type ElementSourceMeta,
  resolveSource,
} from '../resolve';

export interface HTMLTreeElement extends HTMLElement {
  open(el: HTMLElement): void;
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
}
.popup {
  position: fixed;
  top: 50%;
  left: 50%;
  z-index: var(--z-index-tree);
  transform: translate(-50%, -50%);
  color: var(--text);
  background: var(--fill-opacity);
  backdrop-filter: contrast(1.8) blur(40px);
  box-shadow: 0 0 1px var(--fill-2);
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
  background: transparent;
  border: none;
  border-radius: 99px;
}
.close:hover {
  backdrop-filter: contrast(80%);
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
.el {
  font-size: 14px;
}
.tree {
  position: relative;
  padding-left: 10px;
}
.line {
  position: absolute;
  left: 11px;
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
    private holdEl?: HTMLElement;

    constructor() {
      super();

      host(this, {
        css: CSS,
        html: jsx(
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

    open = (el: HTMLElement) => {
      overrideStyle.mount();
      this.renderBodyContent(resolveSource(el, true));
      applyStyle(this.root, {
        display: 'block',
      });
    };

    close = () => {
      applyStyle(this.root, {
        display: 'none',
      });
      this.renderBodyContent();
      overrideStyle.unmount();
    };

    private setHoldElement = (e: PointerEvent) => {
      this.holdEl = <HTMLElement>e.target;
    };

    // Prevent the display of the component tree by long press, which accidentally triggers the click event
    private checkHoldElement = (e: PointerEvent) => {
      return <HTMLElement>e.target === this.holdEl;
    };

    private safeClose = (e: PointerEvent) => {
      if (this.checkHoldElement(e)) {
        this.close();
      }
    };

    private tryOpenEditor = (e: PointerEvent) => {
      const el = <HTMLElement>e.target!;
      const source = <ElementSourceMeta>(<unknown>el.dataset);
      if (this.checkHoldElement(e) && isStr(source.file)) {
        openEditor(source, (e) => this.dispatchEvent(e));
        this.dispatchEvent(new CustomEvent('exit'));
      }
    };

    private renderBodyContent(source?: ElementSource) {
      // empty
      if (!source) {
        return (this.popupBody.innerHTML = '');
      }

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
              className: 'el',
            },
            `${source.el} in `,
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
    const dataset = withFile ? toDataset(meta) : {};
    return jsx(
      'span',
      {
        className: 'tag',
        title: withFile ? 'Click to open in your editor' : null,
        ...dataset,
      },
      jsx('span', {
        className: 'name',
        __text: `<${name}/>`,
        ...dataset,
      }),
      withFile
        ? jsx('span', {
            className: 'file',
            __text: `${file}:${line}:${column}`,
            ...dataset,
          })
        : null,
    );
  }

  function toDataset(meta: ElementSourceMeta) {
    return Object.fromEntries(
      Object.entries(meta).map(([k, v]) => [`data-${k}`, v]),
    );
  }

  customElements.define(InternalElements.HTML_TREE_ELEMENT, TreeElement);
}
