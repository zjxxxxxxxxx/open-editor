import {
  getHtml,
  jsx,
  CSS_util,
  applyStyle,
  host,
  addClass,
  removeClass,
} from '../utils/html';
import { off, on } from '../utils/event';
import {
  SafeAreaObserver,
  type SafeAreaValue,
} from '../utils/SafeAreaObserver';
import gps from '../icons/gps';
import { InternalElements, CACHE_POS_TOP_ID } from '../constants';

export interface HTMLToggleElement extends HTMLElement {}

const CSS = postcss`
.oe-root {
  position: fixed;
  right: 0px;
  z-index: var(--z-index-toggle);
  padding: 4px;
  font-size: 0px;
}
.oe-overlay {
  position: fixed;
  top: 0px;
  left: 0px;
  width: 100vw;
  height: 100vh;
  display: none;
}
.oe-button {
  color: var(--text);
  background: var(--fill);
  box-shadow: 0 0 1px var(--fill-2);
  border: none;
  outline: none;
  border-radius: 999px;
}
.oe-active {
  color: var(--cyan);
  box-shadow: 0 0 30px 3px var(--cyan);
}
.oe-dnd {
  cursor: ns-resize;
}
.oe-dnd .oe-overlay {
  display: block;
}
.oe-dnd .oe-button {
  transform: scale(1.1);
  opacity: 0.8;
  cursor: ns-resize;
}
`;

export function defineToggleElement() {
  class ToggleElement extends HTMLElement implements HTMLToggleElement {
    static get observedAttributes() {
      return ['active'];
    }

    private root!: HTMLElement;
    private overlay!: HTMLElement;
    private button!: HTMLElement;
    private dnding = false;
    private isTouchScreen!: boolean;

    constructor() {
      super();

      host(this, {
        css: CSS,
        html: jsx(
          'div',
          {
            ref: (el) => (this.root = el),
            className: 'oe-root',
          },
          jsx('div', {
            ref: (el) => (this.overlay = el),
            className: 'oe-overlay',
          }),
          jsx('button', {
            ref: (el) => (this.button = el),
            className: 'oe-button',
            __html: gps,
          }),
        ),
      });
    }

    attributeChangedCallback(_: never, __: never, newValue: string) {
      if (newValue === 'true') {
        addClass(this.button, 'oe-active');
      } else {
        removeClass(this.button, 'oe-active');
      }
    }

    connectedCallback() {
      this.updatePosTop();
      this.updateSize();

      on('resize', this.updatePosTop);
      on('resize', this.updateSize);
      on('longpress', this.startDnD, {
        target: this.button,
        wait: 200,
      });
      on('click', this.dispatchToggle, {
        target: this.button,
      });

      SafeAreaObserver.observe(this.updatePosRight);
    }

    disconnectedCallback() {
      off('resize', this.updatePosTop);
      off('resize', this.updateSize);
      off('longpress', this.startDnD, {
        target: this.button,
        wait: 200,
      });
      off('click', this.dispatchToggle, {
        target: this.button,
      });

      SafeAreaObserver.unobserve(this.updatePosRight);
    }

    private startDnD = () => {
      this.dnding = true;
      addClass(this.root, 'oe-dnd');
      on('pointermove', this.changePosTop);
      on('pointerup', this.stopDnD);
    };

    private stopDnD = () => {
      // Modify when the click e is complete
      setTimeout(() => (this.dnding = false));
      removeClass(this.root, 'oe-dnd');
      off('pointermove', this.changePosTop);
      off('pointerup', this.stopDnD);
    };

    private changePosTop = (e: PointerEvent) => {
      setCachePosTop(e.clientY);
      this.updatePosTop();
    };

    private updateSize = () => {
      if (
        this.isTouchScreen !==
        (this.isTouchScreen =
          Boolean(navigator.maxTouchPoints) || 'ontouchstart' in window)
      ) {
        // Display larger button on the touch screen
        const pad = CSS_util.px(this.isTouchScreen ? 3 : 2);
        const size = CSS_util.px(this.isTouchScreen ? 34 : 24);
        applyStyle(this.button, {
          padding: pad,
          width: size,
          height: size,
        });
      }
    };

    private updatePosRight = (value: SafeAreaValue) => {
      applyStyle(this.root, {
        right: CSS_util.px(value.right),
      });
    };

    private updatePosTop = () => {
      const { clientHeight: winH } = getHtml();
      const { offsetHeight: toggleH } = this.root;
      const { top, bottom } = SafeAreaObserver.value;
      const cachePosY = getCachePosTop();
      const minY = top;
      const maxY = winH - toggleH - bottom;
      const nextPosY = Math.min(Math.max(cachePosY - toggleH / 2, minY), maxY);
      applyStyle(this.root, {
        top: CSS_util.px(nextPosY),
      });
    };

    private dispatchToggle = () => {
      // Let the button lose focus to prevent the click event from being accidentally triggered by pressing the Enter key or the Space bar.
      this.button.blur();

      // Prevents the click event from being triggered by the end of the drag
      if (!this.dnding) {
        this.dispatchEvent(new CustomEvent('toggle'));
      }
    };
  }

  function getCachePosTop() {
    return +localStorage[CACHE_POS_TOP_ID] || 0;
  }

  function setCachePosTop(posY: number) {
    return (localStorage[CACHE_POS_TOP_ID] = posY);
  }

  customElements.define(InternalElements.HTML_TOGGLE_ELEMENT, ToggleElement);
}
