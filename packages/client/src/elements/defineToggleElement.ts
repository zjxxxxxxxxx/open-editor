import {
  getHtml,
  jsx,
  CSS_util,
  applyStyle,
  host,
  addClass,
  reomveClass,
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
  backdrop-filter: contrast(1.8) blur(32px);
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
    private dndPoint?: { pageY: number; posY: number };
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
        reomveClass(this.button, 'active');
      }
    }

    connectedCallback() {
      this.updatePosY_RAF();
      this.checkTouchScreen();

      SafeAreaObserver.observe(this.setSafeRight);
      on('click', this.dispatchToggle, {
        target: this.button,
      });
      on('longpress', this.startDnD, {
        target: this.button,
        wait: 300,
      });
      on('resize', this.updatePosY_RAF);
      on('resize', this.checkTouchScreen);
    }

    disconnectedCallback() {
      SafeAreaObserver.unobserve(this.setSafeRight);
      off('click', this.dispatchToggle, {
        target: this.button,
      });
      off('longpress', this.startDnD, {
        target: this.button,
        wait: 300,
      });
      off('resize', this.updatePosY_RAF);
      off('resize', this.checkTouchScreen);
    }

    private checkTouchScreen = () => {
      const isTouchScreen =
        Boolean(navigator.maxTouchPoints) || 'ontouchstart' in window;
      if (this.isTouchScreen !== (this.isTouchScreen = isTouchScreen)) {
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

    private setSafeRight = (value: SafeAreaValue) => {
      applyStyle(this.root, {
        right: CSS_util.px(value.right),
      });
    };

    private startDnD = (e: PointerEvent) => {
      this.dndPoint = {
        pageY: e.pageY,
        posY: getCachePosY(),
      };
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
      setTimeout(() => (this.dndPoint = undefined));
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

    private changePosY = (e: PointerEvent) => {
      const { pageY, posY } = this.dndPoint!;
      const nextPosY = e.pageY - pageY + posY;
      setCachePosY(nextPosY);
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
      // Prevents the click event from being triggered by the end of the drag
      if (!this.dndPoint) {
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
