import { Colors, InternalElements } from '../constants';
import {
  ComputedStyle,
  emptyComputedStyles,
  getComputedStyles,
} from '../utils/getComputedStyles';
import { applyStyle } from '../utils/element';

export interface HTMLOverlayElement extends HTMLElement {
  open(): void;
  close(): void;
  update(element: HTMLElement): void;
}

export function defineOverlayElement() {
  class OverlayElement extends HTMLElement implements HTMLOverlayElement {
    #posttionRect: HTMLElement;
    #marginRect: HTMLElement;
    #borderRect: HTMLElement;
    #paddingRect: HTMLElement;
    #contentRect: HTMLElement;

    #activeElement?: HTMLElement;

    constructor() {
      super();

      const shadow = this.attachShadow({ mode: 'closed' });
      this.#posttionRect = document.createElement('div');
      this.#marginRect = document.createElement('div');
      this.#borderRect = document.createElement('div');
      this.#paddingRect = document.createElement('div');
      this.#contentRect = document.createElement('div');

      shadow.appendChild(this.#posttionRect);
      this.#posttionRect.appendChild(this.#marginRect);
      this.#marginRect.appendChild(this.#borderRect);
      this.#borderRect.appendChild(this.#paddingRect);
      this.#paddingRect.appendChild(this.#contentRect);

      applyStyle(this.#posttionRect, {
        position: 'fixed',
        zIndex: '10000',
        opacity: '0.5',
        transform: 'translateZ(10000px)',
        display: 'none',
        pointerEvents: 'none',
      });
      applyStyle(this.#marginRect, {
        borderColor: Colors.OVERLAY_MARGIN_RECT,
      });
      applyStyle(this.#borderRect, {
        borderColor: Colors.OVERLAY_BORDER_RECT,
      });
      applyStyle(this.#paddingRect, {
        borderColor: Colors.OVERLAY_PADDING_RECT,
      });
      applyStyle(this.#contentRect, {
        background: Colors.OVERLAY_CONTENT_RECT,
      });
    }

    connectedCallback() {
      window.addEventListener('resize', this.#reUpdate);
      window.addEventListener('scroll', this.#reUpdate);
    }

    disconnectedCallback() {
      window.removeEventListener('resize', this.#reUpdate);
      window.removeEventListener('scroll', this.#reUpdate);
    }

    public open() {
      this.#updateStyles(emptyComputedStyles);
      applyStyle(this.#posttionRect, {
        display: 'block',
      });
    }

    public close() {
      this.#activeElement = undefined;
      applyStyle(this.#posttionRect, {
        display: 'none',
      });
    }

    public update(element: HTMLElement) {
      this.#activeElement = element;
      this.#reUpdate();
    }

    #reUpdate = () => {
      if (this.#activeElement) {
        const styles = getComputedStyles(this.#activeElement);
        this.#updateStyles(styles);
      } else {
        this.#updateStyles(emptyComputedStyles);
      }
    };

    #updateStyles(styles: Record<string, ComputedStyle>) {
      applyStyle(this.#posttionRect, {
        width: `${styles.posttion.width}px`,
        height: `${styles.posttion.height}px`,
        top: `${styles.posttion.top}px`,
        left: `${styles.posttion.left}px`,
      });
      applyStyle(this.#contentRect, {
        width: `${styles.content.width}px`,
        height: `${styles.content.height}px`,
      });
      applyRectStyle(this.#marginRect, styles.margin);
      applyRectStyle(this.#borderRect, styles.border);
      applyRectStyle(this.#paddingRect, styles.padding);
    }
  }

  function applyRectStyle(rect: HTMLElement, style: ComputedStyle) {
    applyStyle(rect, {
      width: `${style.width}px`,
      height: `${style.height}px`,
      borderWidth: `${style.top}px ${style.right}px ${style.bottom}px ${style.left}px`,
      borderStyle: 'solid',
    });
  }

  customElements.define(InternalElements.HTML_OVERLAY_ELEMENT, OverlayElement);
}
