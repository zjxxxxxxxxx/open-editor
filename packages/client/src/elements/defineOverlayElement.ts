import {
  ComputedStyle,
  emptyComputedStyles,
  getComputedStyles,
} from '../utils/getComputedStyles';
import { applyStyle, cssUtils } from '../utils/element';
import { Colors, InternalElements } from '../constants';
import type { HTMLTooltipElement } from './defineTooltipElement';

export interface HTMLOverlayElement extends HTMLElement {
  open(): void;
  close(): void;
  update(element?: HTMLElement): void;
}

export function defineOverlayElement() {
  class OverlayElement extends HTMLElement implements HTMLOverlayElement {
    #tooltip: HTMLTooltipElement;

    #posttionRect: HTMLElement;
    #marginRect: HTMLElement;
    #borderRect: HTMLElement;
    #paddingRect: HTMLElement;
    #contentRect: HTMLElement;

    #activeElement?: HTMLElement;

    constructor() {
      super();

      const shadow = this.attachShadow({ mode: 'closed' });
      this.#tooltip = document.createElement(
        InternalElements.HTML_TOOLTIP_ELEMENT,
      ) as HTMLTooltipElement;
      this.#posttionRect = document.createElement('div');
      this.#marginRect = document.createElement('div');
      this.#borderRect = document.createElement('div');
      this.#paddingRect = document.createElement('div');
      this.#contentRect = document.createElement('div');

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

      shadow.appendChild(this.#tooltip);
      shadow.appendChild(this.#posttionRect);
      this.#posttionRect.appendChild(this.#marginRect);
      this.#marginRect.appendChild(this.#borderRect);
      this.#borderRect.appendChild(this.#paddingRect);
      this.#paddingRect.appendChild(this.#contentRect);
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
      this.#tooltip.open();

      this.#updateStyles(emptyComputedStyles);
      applyStyle(this.#posttionRect, {
        display: 'block',
      });
    }

    public close() {
      this.#tooltip.close();

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
      const styles = this.#activeElement
        ? getComputedStyles(this.#activeElement)
        : emptyComputedStyles;
      this.#updateStyles(styles);
    };

    #updateStyles(styles: Record<string, ComputedStyle>) {
      this.#tooltip.update(this.#activeElement, styles.posttion);

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
      width: cssUtils.px(style.width),
      height: cssUtils.px(style.height),
      borderWidth: `${cssUtils.px(style.top)} ${cssUtils.px(
        style.right,
      )} ${cssUtils.px(style.bottom)} ${cssUtils.px(style.left)}`,
      borderStyle: 'solid',
    });
  }

  customElements.define(InternalElements.HTML_OVERLAY_ELEMENT, OverlayElement);
}
