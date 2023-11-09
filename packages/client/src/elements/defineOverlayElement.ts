import {
  ComputedStyle,
  emptyComputedStyles,
  getComputedStyles,
} from '../utils/getComputedStyles';
import { create } from '../utils/dom';
import { CSS_util, applyStyle } from '../utils/style';
import { off, on } from '../utils/event';
import { create_RAF } from '../utils/createRAF';
import { initCustomElement } from '../utils/initCustomElement';
import { InternalElements, captureOpts } from '../constants';
import type { HTMLTooltipElement } from './defineTooltipElement';

export interface HTMLOverlayElement extends HTMLElement {
  open(): void;
  close(): void;
  update(activeElement?: HTMLElement): void;
}

const CSS = postcss`
.posttion {
  position: fixed;
  z-index: var(--z-index-overlay);
  display: none;
  pointer-events: none;
  will-change: width, height, top, left;
}
.posttion div {
  will-change: width, height, border;
}
.margin {
  border: 0px solid var(--overlay-margin);
}
.border {
  border: 0px solid var(--overlay-border);
}
.padding {
  border: 0px solid var(--overlay-padding);
}
.content {
  background: var(--overlay-content);
}
`;

export function defineOverlayElement() {
  class OverlayElement extends HTMLElement implements HTMLOverlayElement {
    private posttion!: HTMLElement;
    private margin!: HTMLElement;
    private border!: HTMLElement;
    private padding!: HTMLElement;
    private content!: HTMLElement;
    private tooltip!: HTMLTooltipElement;
    private activeElement?: HTMLElement;

    constructor() {
      super();

      initCustomElement({
        root: this,
        style: CSS,
        children: [
          create(
            'div',
            {
              ref: (el) => (this.posttion = el),
              className: 'posttion',
            },
            create(
              'div',
              {
                ref: (el) => (this.margin = el),
                className: 'margin',
              },
              create(
                'div',
                {
                  ref: (el) => (this.border = el),
                  className: 'border',
                },
                create(
                  'div',
                  {
                    ref: (el) => (this.padding = el),
                    className: 'padding',
                  },
                  create('div', {
                    ref: (el) => (this.content = el),
                    className: 'content',
                  }),
                ),
              ),
            ),
          ),
          create<HTMLTooltipElement>(InternalElements.HTML_TOOLTIP_ELEMENT, {
            ref: (el) => (this.tooltip = el),
          }),
        ],
      });
    }

    open = () => {
      applyStyle(this.posttion, {
        display: 'block',
      });
      this.tooltip.open();

      on('scroll', this.update_RAF, captureOpts);
      on('resize', this.update_RAF, captureOpts);
    };

    close = () => {
      applyStyle(this.posttion, {
        display: 'none',
      });
      this.tooltip.close();
      this.update();

      off('scroll', this.update_RAF, captureOpts);
      off('resize', this.update_RAF, captureOpts);
    };

    update = (activeElement?: HTMLElement) => {
      this.activeElement = activeElement;
      this.update_RAF();
    };

    private update_RAF = create_RAF(() => {
      const styles = this.activeElement
        ? getComputedStyles(this.activeElement)
        : emptyComputedStyles;
      this.updateStyles(styles);
      this.tooltip.update(this.activeElement, styles.posttion);
    });

    private updateStyles(styles: Record<string, ComputedStyle>) {
      applyStyle(this.posttion, {
        width: CSS_util.px(styles.posttion.width),
        height: CSS_util.px(styles.posttion.height),
        top: CSS_util.px(styles.posttion.top),
        left: CSS_util.px(styles.posttion.left),
      });
      applyRectStyle(this.margin, styles.margin);
      applyRectStyle(this.border, styles.border);
      applyRectStyle(this.padding, styles.padding);
      applyRectStyle(this.content, styles.content);
    }
  }

  function applyRectStyle(element: HTMLElement, style: ComputedStyle) {
    applyStyle(element, {
      width: CSS_util.px(style.width),
      height: CSS_util.px(style.height),
      borderTopWidth: CSS_util.px(style.top),
      borderRightWidth: CSS_util.px(style.right),
      borderBottomWidth: CSS_util.px(style.bottom),
      borderLeftWidth: CSS_util.px(style.left),
    });
  }

  customElements.define(InternalElements.HTML_OVERLAY_ELEMENT, OverlayElement);
}
