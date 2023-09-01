import {
  ComputedStyle,
  emptyComputedStyles,
  getComputedStyles,
} from '../utils/getComputedStyles';
import { applyStyle, CSS_util, create, append } from '../utils/document';
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

    public open = () => {
      this.#tooltip.open();

      this.#updateStyles(emptyComputedStyles);
      applyStyle(this.#posttionRect, {
        display: 'block',
      });
    };

    public close = () => {
      this.#tooltip.close();

      applyStyle(this.#posttionRect, {
        display: 'none',
      });
    };

    public update = (element: HTMLElement) => {
      const styles = element ? getComputedStyles(element) : emptyComputedStyles;
      this.#tooltip.update(element, styles.posttion);
      this.#updateStyles(styles);
    };

    #updateStyles(styles: Record<string, ComputedStyle>) {
      applyStyle(this.#posttionRect, {
        width: CSS_util.px(styles.posttion.width),
        height: CSS_util.px(styles.posttion.height),
        top: CSS_util.px(styles.posttion.top),
        left: CSS_util.px(styles.posttion.left),
      });
      applyStyle(this.#contentRect, {
        width: CSS_util.px(styles.content.width),
        height: CSS_util.px(styles.content.height),
      });
      this.#applyRectStyle(this.#marginRect, styles.margin);
      this.#applyRectStyle(this.#borderRect, styles.border);
      this.#applyRectStyle(this.#paddingRect, styles.padding);
    }

    #applyRectStyle(rect: HTMLElement, style: ComputedStyle) {
      applyStyle(rect, {
        width: CSS_util.px(style.width),
        height: CSS_util.px(style.height),
        borderTopWidth: CSS_util.px(style.top),
        borderRightWidth: CSS_util.px(style.right),
        borderBottomWidth: CSS_util.px(style.bottom),
        borderLeftWidth: CSS_util.px(style.left),
        borderStyle: 'solid',
      });
    }
  }

  customElements.define(InternalElements.HTML_OVERLAY_ELEMENT, OverlayElement);
}
