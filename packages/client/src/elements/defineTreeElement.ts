import { append, applyStyle, create, off, on } from '../utils/document';
import { openEditor } from '../utils/openEditor';
import { ElementSource, ElementSourceMeta, resolveSource } from '../resolve';
import { InternalElements, ZIndex } from '../constants';

export interface HTMLTreeElement extends HTMLElement {
  open(element: HTMLElement): void;
  close(): void;
}

const CSS = `
.root {
  position: fixed;
  top: 0;
  left: 0;
  z-index: ${ZIndex.tree};
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
  min-width: 300px;
  max-width: calc(100vw - 112px);
  border: 2px solid var(--green);
  border-radius: 6px;
  background-color: var(--bg-color);
}

.content {
  padding-left: 0px;
  max-height: calc(100vh - 156px);
  white-space: nowrap;
  overflow: scroll;
  scrollbar-width: none;
}

.content::-webkit-scrollbar {
  display: none;
}

.tree {
  padding-left: 8px;
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
  color: var(--green);
}

.element {
  color: var(--element);
  font-size: 14px;
}

.empty {
  color: var(--red);
  fill: var(--red);
  border-color: var(--red);
}

.tag:hover > *,
.tag:hover ~ .tag > * {
  opacity: 1;
  text-decoration: underline;
}

.msg {
  font-size: 14px;
  font-weight: 200;
  text-decoration: underline;
}

.name {
  font-size: 14px;
  color: var(--green);
}

.file {
  font-size: 12px;
  font-weight: 300;
  color: var(--cyan);
}

.name,
.file {
  opacity: 0.8;
}
`;

const closeIcon = `
<svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
  <path d="M619.53908575 512l327.95607772-327.19338858a76.26885573 76.26885573 0 1 0-108.30177489-108.30177489L512 404.46091425l-327.19338858-327.95607772a76.26885573 76.26885573 0 0 0-108.30177489 108.30177489l327.95607772 327.19338858-327.95607772 327.19338858a76.26885573 76.26885573 0 0 0 0 108.30177489 76.26885573 76.26885573 0 0 0 108.30177489 0l327.19338858-327.95607772 327.19338858 327.95607772a76.26885573 76.26885573 0 0 0 108.30177489 0 76.26885573 76.26885573 0 0 0 0-108.30177489z"></path>
</svg>
`;

export function defineTreeElement() {
  class TreeElement extends HTMLElement implements HTMLTreeElement {
    #root: HTMLElement;
    #popup: HTMLElement;

    constructor() {
      super();

      const shadow = this.attachShadow({ mode: 'closed' });
      shadow.innerHTML = `<style>${CSS}</style>`;

      this.#root = create('div');
      this.#root.classList.add('root');

      this.#popup = create('div');
      this.#popup.classList.add('popup');

      append(this.#root, this.#popup);
      append(shadow, this.#root);
    }

    public connectedCallback() {
      on('click', this.close, {
        target: this.#root,
      });
      on('click', this.#handlePopupEvent, {
        target: this.#popup,
      });
    }

    public disconnectedCallback() {
      off('click', this.close, {
        target: this.#root,
      });
      off('click', this.#handlePopupEvent, {
        target: this.#popup,
      });
      off('click', this.close, {
        target: this.#root.querySelector('.close'),
      });
    }

    public open = (element: HTMLElement) => {
      const source = resolveSource(element, true);

      const hasTree = !!source.tree.length;
      if (hasTree) {
        this.#renderTreeView(source);
      } else {
        this.#renderEmptyView(source);
      }

      applyStyle(this.#root, {
        display: 'block',
      });
      on('click', this.close, {
        target: this.#root.querySelector('.close'),
      });
    };

    public close = () => {
      applyStyle(this.#root, {
        display: 'none',
      });
    };

    #renderTreeView(source: ElementSource) {
      this.#popup.classList.remove('empty');
      this.#popup.innerHTML = `
        <div class="title">
          <span class="element">${
            source.element
          } in </span> &lt;Component Tree&gt;
        </div>
        <span class="close">${closeIcon}</span>
        <div class="tree content">
          ${this.#buildTree(source.tree)}
        </div>
      `;
    }

    #renderEmptyView(source: ElementSource) {
      this.#popup.classList.add('empty');
      this.#popup.innerHTML = `
        <div class="title empty">
          <span class="element">${source.element} in </span> &lt;Component Tree&gt;
        </div>
        <span class="close empty">${closeIcon}</span>
        <div class="msg empty">empty tree 😭.</div>
      `;
    }

    #buildTree(tree: ElementSourceMeta[]) {
      let template = '';
      while (tree.length) {
        const meta = tree.shift()!;
        template = this.#buildTemplate(meta, template);
      }
      return template;
    }

    #buildTemplate(meta: ElementSourceMeta, subTree: string) {
      let tags = this.#createTag(meta, true);
      if (subTree) {
        tags += `
          <div class="tree">
            ${subTree}
          </div>  
          ${this.#createTag(meta)} 
        `;
      }
      return tags;
    }

    #createTag(meta: ElementSourceMeta, withFile?: boolean) {
      const dataset = Object.entries(meta).reduce(
        (str, [key, value]) => `${str} data-${key}="${value}"`,
        '',
      );
      return `
        <div class="tag" ${dataset}>
          <span class="name" ${dataset}>&lt;${meta.name}&gt;</span>
          ${withFile ? `<span class="file" ${dataset}>${meta.file}</span>` : ''}
        </div>
      `;
    }

    #handlePopupEvent = (e: PointerEvent) => {
      const element = <HTMLElement>e.target;
      const hasSource = Object.keys(element.dataset).length;
      if (!hasSource) {
        e.stopPropagation();
        return;
      }

      openEditor(
        <ElementSourceMeta>(<unknown>element.dataset),
        this.dispatchEvent.bind(this),
      );
      this.dispatchEvent(new CustomEvent('exit'));
    };
  }

  customElements.define(InternalElements.HTML_TREE_ELEMENT, TreeElement);
}
