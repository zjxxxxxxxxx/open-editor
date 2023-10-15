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
import { create_RAF } from '../utils/createRAF';
import { createStyleInject } from '../utils/createStyleInject';
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

const touchLockCSS = postcss`
html {
  touch-action: none !important;
}
`;

export function defineOverlayElement() {
  const touchLockStyle = createStyleInject(touchLockCSS);

  class OverlayElement extends HTMLElement implements HTMLOverlayElement {
    private tooltip: HTMLTooltipElement;

    private posttion: HTMLElement;
    private margin: HTMLElement;
    private border: HTMLElement;
    private padding: HTMLElement;
    private content: HTMLElement;
    private activeElement?: HTMLElement;

    constructor() {
      super();

      const shadow = this.attachShadow({ mode: 'closed' });
      shadow.innerHTML = `<style>${CSS}</style>`;

      this.posttion = create('div');
      this.posttion.classList.add('posttion');

      this.margin = create('div');
      this.margin.classList.add('margin');

      this.border = create('div');
      this.border.classList.add('border');

      this.padding = create('div');
      this.padding.classList.add('padding');

      this.content = create('div');
      this.content.classList.add('content');

      this.tooltip = <HTMLTooltipElement>(
        create(InternalElements.HTML_TOOLTIP_ELEMENT)
      );

      append(this.padding, this.content);
      append(this.border, this.padding);
      append(this.margin, this.border);
      append(this.posttion, this.margin);
      append(shadow, this.posttion);
      append(shadow, this.tooltip);
    }

    open = () => {
      touchLockStyle.insert();
      applyStyle(this.posttion, {
        display: 'block',
      });
      this.tooltip.open();

      on('scroll', this.update_RAF, captureOpts);
    };

    close = () => {
      touchLockStyle.remove();
      applyStyle(this.posttion, {
        display: 'none',
      });
      this.tooltip.close();
      this.update();

      off('scroll', this.update_RAF, captureOpts);
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
