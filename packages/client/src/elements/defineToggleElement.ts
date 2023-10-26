import { create, append, getHtml } from '../utils/dom';
import { CSS_util, applyStyle, setShadowStyle } from '../utils/style';
import { off, on } from '../utils/event';
import { create_RAF } from '../utils/createRAF';
import { getSafeArea } from '../utils/getSafeArea';
import gps from '../icons/gps';
import { InternalElements, POS_Y_CACHE_ID } from '../constants';

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
  color: var(--toggle);
  background: var(--toggle-bg);
  transition: all 0.3s ease-out;
  border: none;
  border-radius: 999px;
  backdrop-filter: blur(8px);
}
@media (max-width: 960px) {
  .button {
    width: 32px;
    height: 32px;
  }
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

      const shadow = this.attachShadow({ mode: 'closed' });
      setShadowStyle(shadow, CSS);

      create(
        'div',
        {
          ref: (el) => (this.root = el),
          className: 'root',
        },
        create('div', {
          ref: (el) => (this.overlay = el),
          className: 'overlay',
        }),
        create('button', {
          ref: (el) => (this.button = el),
          className: 'button',
          title: 'open-editor-toggle',
          __html: gps,
        }),
      );

      append(shadow, this.root);
    }

    attributeChangedCallback(_: never, __: never, newValue: string) {
      if (newValue === 'true') {
        applyStyle(this.button, {
          color: 'var(--green)',
        });
      } else {
        applyStyle(this.button, {
          color: 'var(--toggle)',
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

    private startDnD = (event: PointerEvent) => {
      this.dndPoint = {
        pageY: event.pageY,
        posY: getCachePosY(),
      };
      applyStyle(this.root, {
        cursor: 'move',
      });
      applyStyle(this.button, {
        cursor: 'move',
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
      // Modify when the click event is complete
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

    private changePosY = (event: PointerEvent) => {
      const { pageY, posY } = this.dndPoint!;
      const nextPosY = event.pageY - pageY + posY;
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
    return +localStorage[POS_Y_CACHE_ID] || 0;
  }

  function setCachePosY(posY: number) {
    return (localStorage[POS_Y_CACHE_ID] = posY);
  }

  customElements.define(InternalElements.HTML_TOGGLE_ELEMENT, ToggleElement);
}
