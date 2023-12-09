import { isStr } from '@open-editor/shared';
import {
  append,
  jsx,
  host,
  addClass,
  removeClass,
  getHtml,
} from '../utils/html';
import { off, on } from '../utils/event';
import { openEditor } from '../utils/openEditor';
import close from '../icons/close';
import { InternalElements } from '../constants';
import {
  type SourceCode,
  type SourceCodeMeta,
  resolveSource,
} from '../resolve';
import { getOptions } from '../options';

export interface HTMLTreeElement extends HTMLElement {
  show: boolean;
  open(el: HTMLElement): void;
  close(): void;
}

const CSS = postcss`
.oe-root {
  display: none;
  touch-action: none;
}
.oe-overlay {
  position: fixed;
  top: 0;
  left: 0;
  z-index: var(--z-index-tree);
  width: 100vw;
  height: 100vh;
  backdrop-filter: blur(10px);
}
.oe-popup {
  position: fixed;
  top: 50%;
  left: 50%;
  z-index: var(--z-index-tree);
  transform: translate(-50%, -50%);
  color: var(--text);
  background: var(--fill-opt);
  backdrop-filter: blur(20px);
  box-shadow: 0 0 1px var(--fill-2);
  border-radius: 14px;
}
.oe-close {
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
.oe-close:hover {
  backdrop-filter: contrast(0.5);
}
.oe-body {
  padding: 16px 24px;
  overflow: hidden;
}
.oe-error, .oe-error .oe-close, .oe-error .oe-tag {
  color: var(--red);
}
.oe-error .oe-close:hover {
  background: var(--red-light);
}
.oe-content {
  --w: calc(100vw - 96px);
  --h: calc(100vh - 148px);

  min-width: 220px;
  max-width: min(var(--w), 500px);
  max-height: min(var(--h), 600px);
  white-space: nowrap;
  overflow: auto;
  scrollbar-width: none;
}
.oe-content::-webkit-scrollbar {
  display: none;
}
.oe-title {
  padding: 0 32px 16px 0;
  font-size: 18px;
  font-weight: 500;
}
.oe-el {
  font-size: 14px;
}
.oe-tree {
  position: relative;
  padding-left: 10px;
}
.oe-line {
  position: absolute;
  left: 11px;
  top: 22px;
  opacity: 0.2;
  width: 1px;
  height: calc(100% - 44px);
  background: var(--text);
}
.oe-tag {
  margin: 2px 0;
  font-size: 14px;
  font-weight: 500;
  opacity: 0.6;
}
.oe-tag[data-file]:hover,
.oe-tag[data-file]:hover ~ .oe-tag {
  opacity: 1;
}
.oe-tag[data-file]:hover ~ .oe-line {
  opacity: 0.6;
}
.oe-file {
  padding-left: 6px;
  color: var(--text-2);
  font-size: 12px;
  font-weight: 300;
  text-decoration: underline;
  pointer-events: none;
}
.oe-show {
  display: block;
}
`;

export function defineTreeElement() {
  class TreeElement extends HTMLElement implements HTMLTreeElement {
    show = false;

    private root!: HTMLElement;
    private overlay!: HTMLElement;
    private popup!: HTMLElement;
    private popupClose!: HTMLElement;
    private popupBody!: HTMLElement;
    private clickable = false;

    constructor() {
      super();

      host(this, {
        css: CSS,
        html: jsx(
          'div',
          {
            ref: (el) => (this.root = el),
            className: 'oe-root',
          },
          jsx('div', {
            ref: (el) => (this.overlay = el),
            className: 'oe-overlay',
          }),
          jsx(
            'div',
            {
              ref: (el) => (this.popup = el),
              className: 'oe-popup',
            },
            jsx('button', {
              ref: (el) => (this.popupClose = el),
              className: 'oe-close',
              __html: close,
            }),
            jsx('div', {
              className: 'oe-body',
              ref: (el) => (this.popupBody = el),
            }),
          ),
        ),
      });
    }

    open = (el: HTMLElement) => {
      this.show = true;
      this.renderBodyContent(resolveSource(el, true));
      this.enableClick();

      addClass(this.root, 'oe-show');
      addClass(getHtml(), 'oe-screen-lock');

      on('quickexit', this.close);
      on('click', this.exit, {
        target: this.overlay,
      });
      on('click', this.exit, {
        target: this.popupClose,
      });
      on('click', this.openEditor, {
        target: this.popupBody,
      });
    };

    close = () => {
      this.show = false;
      this.renderBodyContent();

      removeClass(this.root, 'oe-show');
      removeClass(getHtml(), 'oe-screen-lock');

      off('quickexit', this.close);
      off('click', this.exit, {
        target: this.overlay,
      });
      off('click', this.exit, {
        target: this.popupClose,
      });
      off('click', this.openEditor, {
        target: this.popupBody,
      });
    };

    // Prevent the display of the component tree by long press, which accidentally triggers the click event
    private enableClick = () => {
      this.clickable = false;
      const enableClick = () => {
        this.clickable = true;
        off('pointerdown', enableClick);
      };
      on('pointerdown', enableClick);
    };

    private exit = () => {
      if (this.clickable) {
        this.close();
      }
    };

    private openEditor = async (e: PointerEvent) => {
      const el = <HTMLElement>e.target!;
      const source = <SourceCodeMeta>(<unknown>el.dataset);
      if (this.clickable && isStr(source.file)) {
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

    private renderBodyContent(source?: SourceCode) {
      // empty
      if (!source) {
        return (this.popupBody.innerHTML = '');
      }

      const hasTree = source.tree.length > 0;
      const treeNodes = hasTree ? buildTree(source.tree) : ['>> not found 😭.'];

      if (hasTree) removeClass(this.popup, 'oe-error');
      else addClass(this.popup, 'oe-error');

      append(
        this.popupBody,
        jsx(
          'div',
          {
            className: 'oe-title',
          },
          jsx(
            'span',
            {
              className: 'oe-el',
            },
            `${source.el} in `,
          ),
          `<ComponentTree>`,
        ),
        jsx(
          'div',
          {
            className: 'oe-content oe-tree',
          },
          ...treeNodes,
        ),
      );
    }
  }

  function buildTree(tree: SourceCodeMeta[]) {
    let nodes: HTMLElement[] = [];

    while (tree.length) {
      const meta = tree.shift()!;
      const startNode = createNode(meta, true);
      if (nodes.length) {
        nodes = [
          startNode,
          jsx('div', {
            className: 'oe-line',
          }),
          jsx(
            'div',
            {
              className: 'oe-tree',
            },
            ...nodes,
          ),
          createNode(meta),
        ];
      } else {
        nodes = [startNode];
      }
    }

    return nodes;
  }

  function createNode(meta: SourceCodeMeta, withFile?: boolean) {
    const { name, file, line = 1, column = 1 } = meta ?? {};
    const dataset = withFile ? toDataset(meta) : {};
    return jsx(
      'span',
      {
        className: 'oe-tag',
        title: withFile ? 'Click to open in your editor' : null,
        ...dataset,
      },
      withFile ? `<${name}>` : `<${name}/>`,
      withFile
        ? jsx(
            'span',
            {
              className: 'oe-file',
            },
            `${file}:${line}:${column}`,
          )
        : null,
    );
  }

  function toDataset(meta: SourceCodeMeta) {
    return Object.fromEntries(
      Object.entries(meta).map(([k, v]) => [`data-${k}`, v]),
    );
  }

  customElements.define(InternalElements.HTML_TREE_ELEMENT, TreeElement);
}
