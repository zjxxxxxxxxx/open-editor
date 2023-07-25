import { applyStyle, cssUtils } from '../utils/element';
import type { ComputedStyle } from '../utils/getComputedStyles';
import { resolveSource } from '../utils/resolveSource';
import { Colors, InternalElements } from '../constants';

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
    #file: HTMLElement;

    #offset = 8;

    constructor() {
      super();

      const shadow = this.attachShadow({ mode: 'closed' });

      this.#container = document.createElement('div');
      this.#element = document.createElement('span');
      this.#component = document.createElement('span');
      this.#file = document.createElement('div');

      applyStyle(this.#container, {
        position: 'fixed',
        zIndex: '10002',
        transform: 'translateZ(10002px)',
        padding: '10px 20px',
        display: 'none',
        maxWidth: `calc(100% - 44px - ${cssUtils.px(this.#offset * 2)})`,
        visibility: 'hidden',
        background: Colors.TOOLTIP_BG,
        borderRadius: '4px',
        border: '2px solid',
        borderColor: Colors.SUCCESS,
      });
      applyStyle(this.#element, {
        color: Colors.TOOLTIP_ELEMENT_COLOR,
        fontSize: '14px',
      });
      applyStyle(this.#component, {
        color: Colors.SUCCESS,
        fontSize: '16px',
      });
      applyStyle(this.#file, {
        paddingTop: '5px',
        color: Colors.TOOLTIP_FILE_COLOR,
        fontSize: '14px',
        textDecoration: 'underline',
      });

      this.#container.appendChild(this.#element);
      this.#container.appendChild(this.#component);
      this.#container.appendChild(this.#file);

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
      // before hidden
      applyStyle(this.#container, {
        visibility: 'hidden',
      });

      if (activeElement && style) {
        this.#updateText(activeElement);
        this.#updatePosition(style);

        // after visible
        applyStyle(this.#container, {
          visibility: 'visible',
        });
      }
    }

    #updateText(activeElement: HTMLElement) {
      const source = resolveSource(activeElement);

      this.#element.innerText = `${source.element} in `;
      this.#component.innerText = `<${source.component || 'Anonymous'}>`;
      this.#file.innerText = source.file ?? '';

      if (source.file) {
        applyStyle(this.#container, {
          borderColor: Colors.SUCCESS,
        });
        applyStyle(this.#component, {
          color: Colors.SUCCESS,
        });
      } else {
        applyStyle(this.#container, {
          borderColor: Colors.ERROR,
        });
        applyStyle(this.#component, {
          color: Colors.ERROR,
        });
      }
    }

    #updatePosition(style: ComputedStyle) {
      const { innerWidth: windowWidth, innerHeight: windowHeight } = window;
      const { clientWidth: containerWidth, clientHeight: containerHeight } =
        this.#container;

      // on top
      if (style.top > containerHeight + this.#offset) {
        applyStyle(this.#container, {
          top: cssUtils.px(style.top - containerHeight - this.#offset),
        });
      }
      // on bottom
      else {
        const maxTop = windowHeight - containerHeight - this.#offset;
        applyStyle(this.#container, {
          top: cssUtils.px(Math.min(style.bottom + this.#offset, maxTop)),
        });
      }

      const minLeft = this.#offset;
      const maxLeft = windowWidth - containerWidth - this.#offset;
      applyStyle(this.#container, {
        left: cssUtils.px(Math.max(Math.min(style.left, maxLeft), minLeft)),
      });
    }
  }

  customElements.define(InternalElements.HTML_TOOLTIP_ELEMENT, TooltipElement);
}
