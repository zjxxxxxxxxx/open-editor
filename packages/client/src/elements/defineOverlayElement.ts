import {
  ComputedStyle,
  emptyComputedStyles,
  getComputedStyles,
} from '../utils/getComputedStyles';
import {
  applyStyle,
  cssUtils,
  createElement,
  addEventListener,
  removeEventListener,
  appendChild,
} from '../utils/dom';
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

      this.#tooltip = <HTMLTooltipElement>(
        createElement(InternalElements.HTML_TOOLTIP_ELEMENT)
      );
      this.#posttionRect = createElement('div');
      this.#marginRect = createElement('div');
      this.#borderRect = createElement('div');
      this.#paddingRect = createElement('div');
      this.#contentRect = createElement('div');

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

      appendChild(this.#paddingRect, this.#contentRect);
      appendChild(this.#borderRect, this.#paddingRect);
      appendChild(this.#marginRect, this.#borderRect);
      appendChild(this.#posttionRect, this.#marginRect);
      appendChild(shadow, this.#posttionRect);
      appendChild(shadow, this.#tooltip);
    }

    connectedCallback() {
      addEventListener('resize', this.#reUpdate);
      addEventListener('scroll', this.#reUpdate);
    }

    disconnectedCallback() {
      removeEventListener('resize', this.#reUpdate);
      removeEventListener('scroll', this.#reUpdate);
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
      this.#tooltip.update(this.#activeElement, styles.posttion);
      this.#updateStyles(styles);
    };

    #updateStyles(styles: Record<string, ComputedStyle>) {
      applyStyle(this.#posttionRect, {
        width: cssUtils.px(styles.posttion.width),
        height: cssUtils.px(styles.posttion.height),
        top: cssUtils.px(styles.posttion.top),
        left: cssUtils.px(styles.posttion.left),
      });
      applyStyle(this.#contentRect, {
        width: cssUtils.px(styles.content.width),
        height: cssUtils.px(styles.content.height),
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
      borderTopWidth: cssUtils.px(style.top),
      borderRightWidth: cssUtils.px(style.right),
      borderBottomWidth: cssUtils.px(style.bottom),
      borderLeftWidth: cssUtils.px(style.left),
      borderStyle: 'solid',
    });
  }

  customElements.define(InternalElements.HTML_OVERLAY_ELEMENT, OverlayElement);
}
