import { getHtml, jsx, CSS_util, applyStyle, host } from '../utils/html';
import { off, on } from '../utils/event';
import { create_RAF } from '../utils/createRAF';
import { getSafeArea } from '../utils/getSafeArea';
import gps from '../icons/gps';
import { InternalElements, CACHE_POS_Y_ID } from '../constants';

export interface HTMLToggleElement extends HTMLElement {}

const CSS = postcss`
.root {
  position: fixed;
  right: 0px;
  z-index: var(--z-index-toggle);
  padding: 2px;
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
  padding: 0px;
  width: 24px;
  height: 24px;
  color: var(--text-2);
  background: var(--fill);
  box-shadow: 0 0 1px var(--fill-3);
  border: none;
  outline: none;
  border-radius: 999px;
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

      // Display larger button on the touch screen
      if ('ontouchstart' in window || navigator.maxTouchPoints) {
        applyStyle(this.button, {
          width: '32px',
          height: '32px',
        });
      }
    }

    attributeChangedCallback(_: never, __: never, newValue: string) {
      if (newValue === 'true') {
        applyStyle(this.button, {
          color: 'var(--text)',
        });
      } else {
        applyStyle(this.button, {
          color: null,
        });
      }
    }

    connectedCallback() {
      this.updatePosY_RAF();
      applyStyle(this.root, {
        right: CSS_util.px(getSafeArea().right),
      });
      on('click', this.dispatchToggle, {
        target: this.button,
      });
      on('longpress', this.startDnD, {
        target: this.button,
        wait: 300,
      });
      on('resize', this.updatePosY_RAF);
    }

    disconnectedCallback() {
      off('click', this.dispatchToggle, {
        target: this.button,
      });
      off('longpress', this.startDnD, {
        target: this.button,
        wait: 300,
      });
      off('resize', this.updatePosY_RAF);
    }

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
        opacity: '0.6',
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
      const { top, bottom } = getSafeArea();
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
