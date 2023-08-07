import type { ComputedStyle } from '../utils/getComputedStyles';
import { applyStyle, cssUtils, createElement, appendChild } from '../utils/dom';
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

      this.#container = createElement('div');
      this.#element = createElement('span');
      this.#component = createElement('span');
      this.#file = createElement('div');

      applyStyle(this.#container, {
        position: 'fixed',
        zIndex: '10002',
        transform: 'translateZ(10002px)',
        padding: '10px 20px',
        display: 'none',
        maxWidth: `calc(100% - 44px - ${cssUtils.px(this.#offset * 2)})`,
        visibility: 'hidden',
        background: Colors.TOOLTIP_BG_COLOR,
        borderRadius: '4px',
        border: '2px solid transparent',
      });
      applyStyle(this.#element, {
        color: Colors.TOOLTIP_ELEMENT_COLOR,
        fontSize: '14px',
      });
      applyStyle(this.#component, {
        fontSize: '16px',
      });
      applyStyle(this.#file, {
        fontSize: '14px',
        fontWeight: '200',
        textDecoration: 'underline',
      });

      appendChild(this.#container, this.#element);
      appendChild(this.#container, this.#component);
      appendChild(this.#container, this.#file);
      appendChild(shadow, this.#container);
    }

    open() {
      applyStyle(this.#container, {
        display: 'inline-block',
        visibility: 'hidden',
      });
    }

    close() {
      applyStyle(this.#container, {
        display: 'none',
      });
    }

    #waitUpdateTimer?: number;

    update(activeElement?: HTMLElement, style?: ComputedStyle) {
      // before hidden
      applyStyle(this.#container, {
        visibility: 'hidden',
      });

      window.clearTimeout(this.#waitUpdateTimer);

      if (activeElement && style) {
        this.#waitUpdateTimer = window.setTimeout(() => {
          this.#updateText(activeElement);
          this.#updatePosition(style);

          // after visible
          applyStyle(this.#container, {
            visibility: 'visible',
          });
        }, 300);
      }
    }

    #updateText(activeElement: HTMLElement) {
      const source = resolveSource(activeElement);

      this.#element.innerText = `${source.element} in `;
      this.#component.innerText = `<${source.component ?? 'Unknown'}>`;
      this.#file.innerText = source.file ?? 'filename not found 😭.';

      if (source.file) {
        applyStyle(this.#container, {
          borderColor: Colors.TOOLTIP_BORDER_COLOR,
        });
        applyStyle(this.#component, {
          color: Colors.TOOLTIP_COMPONENT_COLOR,
        });
        applyStyle(this.#file, {
          color: Colors.TOOLTIP_FILE_COLOR,
        });
      } else {
        applyStyle(this.#container, {
          borderColor: Colors.ERROR,
        });
        applyStyle(this.#component, {
          color: Colors.ERROR,
        });
        applyStyle(this.#file, {
          color: Colors.ERROR,
        });
      }
    }

    #updatePosition(style: ComputedStyle) {
      const { clientWidth: windowWidth, clientHeight: windowHeight } =
        document.documentElement;
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
