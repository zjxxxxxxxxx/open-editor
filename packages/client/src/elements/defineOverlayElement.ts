import { type RectStyle, getRectStyles } from '../utils/getRectStyles';
import { jsx, CSS_util, applyStyle, host } from '../utils/html';
import { off, on } from '../utils/event';
import { create_RAF } from '../utils/createRAF';
import { SafeAreaObserver } from '../utils/SafeAreaObserver';
import { InternalElements, capOpts } from '../constants';
import { type HTMLTooltipElement } from './defineTooltipElement';

export interface HTMLOverlayElement extends HTMLElement {
  open(): void;
  close(): void;
  update(activeEl?: HTMLElement): void;
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
    private activeEl?: HTMLElement;

    constructor() {
      super();

      host(this, {
        css: CSS,
        html: [
          jsx(
            'div',
            {
              ref: (el) => (this.posttion = el),
              className: 'posttion',
            },
            jsx(
              'div',
              {
                ref: (el) => (this.margin = el),
                className: 'margin',
              },
              jsx(
                'div',
                {
                  ref: (el) => (this.border = el),
                  className: 'border',
                },
                jsx(
                  'div',
                  {
                    ref: (el) => (this.padding = el),
                    className: 'padding',
                  },
                  jsx('div', {
                    ref: (el) => (this.content = el),
                    className: 'content',
                  }),
                ),
              ),
            ),
          ),
          jsx<HTMLTooltipElement>(InternalElements.HTML_TOOLTIP_ELEMENT, {
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

      SafeAreaObserver.observe(this.update_RAF);
      on('scroll', this.update_RAF, capOpts);
      on('resize', this.update_RAF, capOpts);
    };

    close = () => {
      applyStyle(this.posttion, {
        display: 'none',
      });
      this.tooltip.close();
      this.update();

      SafeAreaObserver.unobserve(this.update_RAF);
      off('scroll', this.update_RAF, capOpts);
      off('resize', this.update_RAF, capOpts);
    };

    update = (activeEl?: HTMLElement) => {
      this.activeEl = activeEl;
      this.update_RAF();
    };

    private update_RAF = create_RAF(() => {
      const styles = getRectStyles(this.activeEl);
      this.updateStyles(styles);
      this.tooltip.update(this.activeEl, styles.posttion);
    });

    private updateStyles(styles: Record<string, RectStyle>) {
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

  function applyRectStyle(el: HTMLElement, style: RectStyle) {
    applyStyle(el, {
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
