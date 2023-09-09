import {
  ComputedStyle,
  emptyComputedStyles,
  getComputedStyles,
} from '../utils/getComputedStyles';
import {
  applyStyle,
  CSS_util,
  create,
  append,
  on,
  off,
} from '../utils/document';
import { Colors, InternalElements, ZIndex } from '../constants';
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

      this.#posttionRect = create('div');
      applyStyle(this.#posttionRect, {
        position: 'fixed',
        zIndex: ZIndex.overlay,
        display: 'none',
        pointerEvents: 'none',
      });

      this.#marginRect = create('div');
      applyStyle(this.#marginRect, {
        borderColor: Colors.OVERLAY_MARGIN_RECT,
      });

      this.#borderRect = create('div');
      applyStyle(this.#borderRect, {
        borderColor: Colors.OVERLAY_BORDER_RECT,
      });

      this.#paddingRect = create('div');
      applyStyle(this.#paddingRect, {
        borderColor: Colors.OVERLAY_PADDING_RECT,
      });

      this.#contentRect = create('div');
      applyStyle(this.#contentRect, {
        background: Colors.OVERLAY_CONTENT_RECT,
      });

      this.#tooltip = <HTMLTooltipElement>(
        create(InternalElements.HTML_TOOLTIP_ELEMENT)
      );

      append(this.#paddingRect, this.#contentRect);
      append(this.#borderRect, this.#paddingRect);
      append(this.#marginRect, this.#borderRect);
      append(this.#posttionRect, this.#marginRect);
      append(shadow, this.#posttionRect);
      append(shadow, this.#tooltip);
    }

    public open = () => {
      this.#updateStyles(emptyComputedStyles);
      applyStyle(this.#posttionRect, {
        display: 'block',
      });
      on('scroll', this.#update_RAF, {
        target: window,
        capture: true,
      });
      this.#tooltip.open();
    };

    public close = () => {
      applyStyle(this.#posttionRect, {
        display: 'none',
      });
      off('scroll', this.#update_RAF, {
        target: window,
        capture: true,
      });
      this.#tooltip.close();
    };

    public update = (element: HTMLElement) => {
      this.#activeElement = element;
      this.#update();
    };

    #update = () => {
      const styles = this.#activeElement
        ? getComputedStyles(this.#activeElement)
        : emptyComputedStyles;
      this.#updateStyles(styles);
      this.#tooltip.update(this.#activeElement, styles.posttion);
    };

    #last_RAF = 0;
    #update_RAF = () => {
      cancelAnimationFrame(this.#last_RAF);
      this.#last_RAF = requestAnimationFrame(() => {
        if (this.#activeElement) {
          this.#update();
        }
      });
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
