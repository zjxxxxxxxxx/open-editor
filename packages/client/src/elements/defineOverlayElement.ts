import { type RectBox, getRectBoxs } from '../utils/getRectBoxs';
import { jsx, CSS_util, applyStyle, host } from '../utils/html';
import { off, on } from '../utils/event';
import { SafeAreaObserver } from '../utils/SafeAreaObserver';
import { InternalElements, capOpts } from '../constants';
import { type HTMLTooltipElement } from './defineTooltipElement';

export interface HTMLOverlayElement extends HTMLElement {
  open(): void;
  close(): void;
  update(activeEl?: HTMLElement): void;
}

const CSS = postcss`
.position {
  position: fixed;
  z-index: var(--z-index-overlay);
  display: none;
  pointer-events: none;
  will-change: width, height, top, left;
}
.position div {
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
    private position!: HTMLElement;
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
              ref: (el) => (this.position = el),
              className: 'position',
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
      applyStyle(this.position, {
        display: 'block',
      });
      this.tooltip.open();

      SafeAreaObserver.observe(this._update);
      on('scroll', this._update, capOpts);
      on('resize', this._update, capOpts);
    };

    close = () => {
      applyStyle(this.position, {
        display: 'none',
      });
      this.tooltip.close();
      this.update();

      SafeAreaObserver.unobserve(this._update);
      off('scroll', this._update, capOpts);
      off('resize', this._update, capOpts);
    };

    update = (activeEl?: HTMLElement) => {
      this.activeEl = activeEl;
      this._update();
    };

    private _update = () => {
      const boxs = getRectBoxs(this.activeEl);
      this.updateBoxs(boxs);
      this.tooltip.update(this.activeEl, boxs.position);
    };

    private updateBoxs(boxs: Record<string, RectBox>) {
      applyStyle(this.position, {
        width: CSS_util.px(boxs.position.width),
        height: CSS_util.px(boxs.position.height),
        top: CSS_util.px(boxs.position.top),
        left: CSS_util.px(boxs.position.left),
      });
      applyRectBox(this.margin, boxs.margin);
      applyRectBox(this.border, boxs.border);
      applyRectBox(this.padding, boxs.padding);
      applyRectBox(this.content, boxs.content);
    }
  }

  function applyRectBox(el: HTMLElement, box: RectBox) {
    applyStyle(el, {
      width: CSS_util.px(box.width),
      height: CSS_util.px(box.height),
      borderTopWidth: CSS_util.px(box.top),
      borderRightWidth: CSS_util.px(box.right),
      borderBottomWidth: CSS_util.px(box.bottom),
      borderLeftWidth: CSS_util.px(box.left),
    });
  }

  customElements.define(InternalElements.HTML_OVERLAY_ELEMENT, OverlayElement);
}
