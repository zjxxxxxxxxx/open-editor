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
import { create_RAF } from '../utils/createRAF';
import {
  SafeAreaObserver,
  type SafeAreaValue,
} from '../utils/SafeAreaObserver';
import gps from '../icons/gps';
import { InternalElements, CACHE_POS_Y_ID } from '../constants';

export interface HTMLToggleElement extends HTMLElement {}

const CSS = postcss`
.root {
  position: fixed;
  right: 0px;
  z-index: var(--z-index-toggle);
  padding: 4px;
  font-size: 0px;
}
.overlay {
  position: fixed;
  top: 0px;
  left: 0px;
  width: 100vw;
  height: 100vh;
  display: none;
}
.button {
  color: var(--text);
  background: var(--fill);
  box-shadow: 0 0 1px var(--fill-2);
  border: none;
  outline: none;
  border-radius: 999px;
}
.active {
  color: var(--cyan);
  box-shadow: 0 0 30px 3px var(--cyan);
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
            className: 'root',
          },
          jsx('div', {
            ref: (el) => (this.overlay = el),
            className: 'overlay',
          }),
          jsx('button', {
            ref: (el) => (this.button = el),
            className: 'button',
            __html: gps,
          }),
        ),
      });
    }

    attributeChangedCallback(_: never, __: never, newValue: string) {
      if (newValue === 'true') {
        addClass(this.button, 'active');
      } else {
        removeClass(this.button, 'active');
      }
    }

    connectedCallback() {
      this.updatePosY_RAF();
      this.updateToggleSize();
      SafeAreaObserver.observe(this.updateToggleRight);
      on('resize', this.updatePosY_RAF);
      on('resize', this.updateToggleSize);
      on('longpress', this.startDnD, {
        target: this.button,
        wait: 200,
      });
      on('click', this.dispatchToggle, {
        target: this.button,
      });
    }

    disconnectedCallback() {
      SafeAreaObserver.unobserve(this.updateToggleRight);
      off('resize', this.updatePosY_RAF);
      off('resize', this.updateToggleSize);
      off('longpress', this.startDnD, {
        target: this.button,
        wait: 200,
      });
      off('click', this.dispatchToggle, {
        target: this.button,
      });
    }

    private startDnD = () => {
      this.dnding = true;
      applyStyle(this.root, {
        cursor: 'ns-resize',
      });
      applyStyle(this.button, {
        cursor: 'ns-resize',
        opacity: '0.8',
        transform: 'scale(1.1)',
      });
      applyStyle(this.overlay, {
        display: 'block',
      });
      on('pointermove', this.changePosY);
      on('pointerup', this.stopDnD);
    };

    private stopDnD = () => {
      // Modify when the click e is complete
      setTimeout(() => (this.dnding = false));
      applyStyle(this.root, {
        cursor: null,
      });
      applyStyle(this.button, {
        cursor: null,
        opacity: null,
        transform: null,
      });
      applyStyle(this.overlay, {
        display: null,
      });
      off('pointermove', this.changePosY);
      off('pointerup', this.stopDnD);
    };

    private updateToggleSize = () => {
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

    private updateToggleRight = (value: SafeAreaValue) => {
      applyStyle(this.root, {
        right: CSS_util.px(value.right),
      });
    };

    private changePosY = (e: PointerEvent) => {
      setCachePosY(e.clientY);
      this.updatePosY_RAF();
    };

    private updatePosY_RAF = create_RAF(() => {
      const { clientHeight: winH } = getHtml();
      const { offsetHeight: toggleH } = this.root;
      const { top, bottom } = SafeAreaObserver.value;
      const cachePosY = getCachePosY();
      const minY = top;
      const maxY = winH - toggleH - bottom;
      const nextPosY = Math.min(Math.max(cachePosY - toggleH / 2, minY), maxY);
      applyStyle(this.root, {
        top: CSS_util.px(nextPosY),
      });
    });

    private dispatchToggle = () => {
      // Let the button lose focus to prevent the click event from being accidentally triggered by pressing the Enter key or the Space bar.
      this.button.blur();

      // Prevents the click event from being triggered by the end of the drag
      if (!this.dnding) {
        this.dispatchEvent(new CustomEvent('toggle'));
      }
    };
  }

  function getCachePosY() {
    return +localStorage[CACHE_POS_Y_ID] || 0;
  }

  function setCachePosY(posY: number) {
    return (localStorage[CACHE_POS_Y_ID] = posY);
  }

  customElements.define(InternalElements.HTML_TOGGLE_ELEMENT, ToggleElement);
}
