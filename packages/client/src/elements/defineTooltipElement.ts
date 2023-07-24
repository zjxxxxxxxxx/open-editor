import { InternalElements } from '../constants';
import { applyStyle, getWindowSize } from '../utils/element';
import { ComputedStyle } from '../utils/getComputedStyles';
import { resolveSource } from '../utils/resolveSource';

export interface HTMLTooltipElement extends HTMLElement {
  open(): void;
  close(): void;
  update(activeElement?: HTMLElement, style?: ComputedStyle): void;
}

export function defineTooltipElement() {
  class TooltipElement extends HTMLElement implements HTMLTooltipElement {
    #container: HTMLElement;
    #element: HTMLElement;
    #component: HTMLElement;

    #offset = 6;

    constructor() {
      super();

      const shadow = this.attachShadow({ mode: 'closed' });

      this.#container = document.createElement('div');
      this.#element = document.createElement('span');
      this.#component = document.createElement('span');

      applyStyle(this.#container, {
        position: 'fixed',
        zIndex: '10002',
        transform: 'translateZ(10002px)',
        padding: '10px',
        display: 'none',
        maxWidth: `calc(100% - 20px - ${this.#offset * 2}px)`,
        visibility: 'hidden',
        background: '#fff',
        borderRadius: '2px',
        boxShadow: '0px 2px 4px #aaa',
      });

      this.#container.appendChild(this.#element);
      this.#container.appendChild(this.#component);
      shadow.appendChild(this.#container);
    }

    open() {
      applyStyle(this.#container, {
        display: 'inline-block',
      });
    }

    close() {
      applyStyle(this.#container, {
        display: 'none',
      });
    }

    update(activeElement?: HTMLElement, style?: ComputedStyle) {
      // before hide
      applyStyle(this.#container, {
        visibility: 'hidden',
      });

      if (activeElement && style) {
        this.#updatePosition(activeElement, style);

        // after show
        applyStyle(this.#container, {
          visibility: 'visible',
        });
      }
    }

    #updatePosition(activeElement: HTMLElement, style: ComputedStyle) {
      const source = resolveSource(activeElement);
      if (source) {
        this.#element.innerText = `${source.element} in `;
        this.#component.innerText = `<${source.component}/>`;

        applyStyle(this.#component, {
          color: '#000',
        });
      } else {
        this.#element.innerText = '';
        this.#component.innerText = `Not found`;

        applyStyle(this.#component, {
          color: 'red',
        });
      }

      const { windowWidth, windowHeight } = getWindowSize();
      const { clientWidth: containeWidth, clientHeight: containerHeight } =
        this.#container;

      // on top
      if (style.top > containerHeight + this.#offset) {
        applyStyle(this.#container, {
          top: `${style.top - containerHeight - this.#offset}px`,
        });
      }
      // fixed bottom
      else if (style.bottom >= windowHeight) {
        applyStyle(this.#container, {
          top: `${windowHeight - containerHeight - this.#offset}px`,
        });
      }
      // on bottom
      else {
        applyStyle(this.#container, {
          top: `${style.bottom + this.#offset}px`,
        });
      }

      const minLeft = this.#offset;
      const maxLeft = windowWidth - containeWidth - this.#offset;
      applyStyle(this.#container, {
        left: `${Math.max(Math.min(style.left, maxLeft), minLeft)}px`,
      });
    }
  }

  customElements.define(InternalElements.HTML_TOOLTIP_ELEMENT, TooltipElement);
}
