import {
  ComputedStyle,
  emptyComputedStyles,
  getComputedStyles,
} from '../utils/getComputedStyles';
import { applyStyle, cssUtil, create, append } from '../utils/document';
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

    constructor() {
      super();

      const shadow = this.attachShadow({ mode: 'closed' });

      this.#tooltip = <HTMLTooltipElement>(
        create(InternalElements.HTML_TOOLTIP_ELEMENT)
      );
      this.#posttionRect = create('div');
      this.#marginRect = create('div');
      this.#borderRect = create('div');
      this.#paddingRect = create('div');
      this.#contentRect = create('div');

      applyStyle(this.#posttionRect, {
        position: 'fixed',
        zIndex: '100000',
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

      append(this.#paddingRect, this.#contentRect);
      append(this.#borderRect, this.#paddingRect);
      append(this.#marginRect, this.#borderRect);
      append(this.#posttionRect, this.#marginRect);
      append(shadow, this.#posttionRect);
      append(shadow, this.#tooltip);
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

      applyStyle(this.#posttionRect, {
        display: 'none',
      });
    }

    public update(element: HTMLElement) {
      const styles = element ? getComputedStyles(element) : emptyComputedStyles;
      this.#tooltip.update(element, styles.posttion);
      this.#updateStyles(styles);
    }

    #updateStyles(styles: Record<string, ComputedStyle>) {
      applyStyle(this.#posttionRect, {
        width: cssUtil.px(styles.posttion.width),
        height: cssUtil.px(styles.posttion.height),
        top: cssUtil.px(styles.posttion.top),
        left: cssUtil.px(styles.posttion.left),
      });
      applyStyle(this.#contentRect, {
        width: cssUtil.px(styles.content.width),
        height: cssUtil.px(styles.content.height),
      });
      applyRectStyle(this.#marginRect, styles.margin);
      applyRectStyle(this.#borderRect, styles.border);
      applyRectStyle(this.#paddingRect, styles.padding);
    }
  }

  function applyRectStyle(rect: HTMLElement, style: ComputedStyle) {
    applyStyle(rect, {
      width: cssUtil.px(style.width),
      height: cssUtil.px(style.height),
      borderTopWidth: cssUtil.px(style.top),
      borderRightWidth: cssUtil.px(style.right),
      borderBottomWidth: cssUtil.px(style.bottom),
      borderLeftWidth: cssUtil.px(style.left),
      borderStyle: 'solid',
    });
  }

  customElements.define(InternalElements.HTML_OVERLAY_ELEMENT, OverlayElement);
}
