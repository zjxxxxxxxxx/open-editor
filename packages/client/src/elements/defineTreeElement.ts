import { append, applyStyle, create, off, on } from '../utils/document';
import { openEditor } from '../utils/openEditor';
import { ElementSourceMeta, resolveSource } from '../resolve';
import { InternalElements } from '../constants';

export interface HTMLTreeElement extends HTMLElement {
  open(element: HTMLElement): void;
  close(): void;
}

const css = `
.root {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  z-index: 1000000 !important;
  display: none;
  width: 100vw !important;
  height: 100vh !important;
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

.tree {
  max-height: calc(100vh - 156px);
  white-space: nowrap;
  overflow: scroll;
  scrollbar-width: none;
}

.tree::-webkit-scrollbar {
  display: none;
}

.sub-tree {
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

.msg {
  font-size: 14px;
  font-weight: 200;
  text-decoration: underline;
}

.component:hover > *,
.component:hover ~ .component > * {
  text-decoration: underline;
}

.name {
  font-size: 14px;
  font-weight: 300;
  color: var(--green);
}

.file {
  font-size: 12px;
  font-weight: 200;
  color: var(--cyan);
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
      shadow.innerHTML = `<style style="display: none;">${css}</style>`;

      this.#root = create('div');
      this.#root.classList.add('root');

      this.#popup = create('div');
      this.#popup.classList.add('popup');

      append(this.#root, this.#popup);
      append(shadow, this.#root);
    }

    connectedCallback() {
      on('click', this.close, {
        target: this.#root,
      });
      on('click', this.#handleEvent, {
        target: this.#popup,
      });
    }

    disconnectedCallback() {
      off('click', this.close, {
        target: this.#root,
      });
      off('click', this.#handleEvent, {
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
        this.#popup.classList.remove('empty');
        this.#popup.innerHTML = `
          <div class="title">
            <span class="element">${
              source.element
            } in </span> &lt;Component Tree&gt;
          </div>
          <span class="close">${closeIcon}</span>
          <div class="tree">
            ${this.#buildTree(source.tree)}
          </div>
        `;
      } else {
        this.#popup.classList.add('empty');
        this.#popup.innerHTML = `
          <div class="title empty">
            <span class="element">${source.element} in </span> &lt;Component Tree&gt;
          </div>
          <span class="close empty">${closeIcon}</span>
          <div class="msg empty">empty tree 😭.</div>
        `;
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

    #buildTree(tree: ElementSourceMeta[]) {
      let template = '';
      while (tree.length) {
        const item = tree.shift()!;
        template = this.#createTag(item, template);
      }
      return template;
    }

    #createTag(component: ElementSourceMeta, child: string) {
      const dataset = `data-file="${component.file}" data-line="${component.line}" data-column="${component.column}"`;
      let tag = `
        <div class="component" ${dataset}>
          <span class="name" ${dataset}>&lt;${component.name}&gt;</span>
          <span class="file" ${dataset}>${component.file}</span>
        </div>
      `;
      if (child) {
        tag += `
          <div class="sub-tree">
            ${child}
          </div>  
          <div class="component" ${dataset}>
            <span class="name" ${dataset}>&lt;/${component.name}&gt;</span>
          </div>  
        `;
      }
      return tag;
    }

    #handleEvent = (e: PointerEvent) => {
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
