import { create, append, getHtml } from '../utils/dom';
import {
  CSS_util,
  applyStyle,
  createGlobalStyle,
  setShadowStyle,
} from '../utils/style';
import { off, on } from '../utils/event';
import { create_RAF } from '../utils/createRAF';
import { getSafeArea } from '../utils/getSafeArea';
import { Colors, InternalElements, POS_Y_CACHE_ID } from '../constants';

export interface HTMLToggleElement extends HTMLElement {}

const CSS = postcss`
.root {
  position: fixed;
  top: 0px;
  z-index: var(--z-index-toggle);
  padding: 8px;
  touch-action: none;
}
.button {
  padding: 2px;
  width: 20px;
  height: 20px;
  color: var(--toggle);
  background-color: var(--toggle-bg);
  transition: all 0.3s ease-out;
  border-radius: 50%;
}
@media (max-width: 960px) {
  .button {
    width: 26px;
    height: 26px;
  }
}
`;

const overrideCSS = postcss`
* {
  cursor: move !important;
}
`;

const toggleIcon = html`
  <svg
    viewBox="0 0 1024 1024"
    xmlns="http://www.w3.org/2000/svg"
    width="100%"
    height="100%"
    fill="currentColor"
  >
    <path
      d="M512 864A352 352 0 1 1 864 512 352.384 352.384 0 0 1 512 864z m0-640A288 288 0 1 0 800 512 288.341333 288.341333 0 0 0 512 224z"
    ></path>
    <path
      d="M512 672A160 160 0 1 1 672 512 160.170667 160.170667 0 0 1 512 672z m0-256A96 96 0 1 0 608 512 96.128 96.128 0 0 0 512 416zM480 170.666667V85.333333a32.213333 32.213333 0 0 1 32-32 32.213333 32.213333 0 0 1 32 32v85.333334a32.213333 32.213333 0 0 1-32 32 32.213333 32.213333 0 0 1-32-32zM85.333333 544a32.213333 32.213333 0 0 1-32-32 32.213333 32.213333 0 0 1 32-32h85.333334a32.213333 32.213333 0 0 1 32 32 32.213333 32.213333 0 0 1-32 32zM480 938.666667v-85.333334a32.213333 32.213333 0 0 1 32-32 32.213333 32.213333 0 0 1 32 32v85.333334a32.213333 32.213333 0 0 1-32 32 32.213333 32.213333 0 0 1-32-32zM853.333333 544a32.213333 32.213333 0 0 1-32-32 32.213333 32.213333 0 0 1 32-32h85.333334a32.213333 32.213333 0 0 1 32 32 32.213333 32.213333 0 0 1-32 32z"
    ></path>
  </svg>
`;

export function defineToggleElement() {
  const overrideStyle = createGlobalStyle(overrideCSS);

  class ToggleElement extends HTMLElement implements HTMLToggleElement {
    static get observedAttributes() {
      return ['active'];
    }

    private root!: HTMLElement;
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
          ref: (el) => (this.button = el),
          className: 'button',
          title: 'open-editor-toggle',
          __html: toggleIcon,
        }),
      );

      append(shadow, this.root);
    }

    attributeChangedCallback(_: never, __: never, newValue: string) {
      if (newValue === 'true') {
        applyStyle(this.button, {
          color: Colors.TOGGLE_ACTIVE_COLOR,
          filter: `drop-shadow(0 0 8px ${Colors.TOGGLE_ACTIVE_SHADOW})`,
        });
      } else {
        applyStyle(this.button, {
          color: Colors.TOGGLE_COLOR,
          filter: 'none',
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
      });
      on('pointerup', this.stopDnD);
      on('pointermove', this.changePosY);
      on('resize', this.updatePosY_RAF);
    }

    disconnectedCallback() {
      off('click', this.dispatchToggle, {
        target: this.button,
      });
      off('longpress', this.startDnD, {
        target: this.button,
      });
      off('pointerup', this.stopDnD);
      off('pointermove', this.changePosY);
      off('resize', this.updatePosY_RAF);
    }

    private startDnD = (event: PointerEvent) => {
      this.dndPoint = {
        pageY: event.pageY,
        posY: getCachePosY(),
      };
      applyStyle(this.root, {
        cursor: 'move',
        opacity: '0.8',
        transform: 'scale(1.1)',
      });
      overrideStyle.insert();
    };

    private stopDnD = () => {
      if (this.dndPoint) {
        // Modify when the click event is complete
        setTimeout(() => (this.dndPoint = undefined));
        applyStyle(this.root, {
          cursor: null,
          opacity: null,
          transform: null,
        });
        overrideStyle.remove();
      }
    };

    private changePosY = (event: PointerEvent) => {
      if (this.dndPoint) {
        event.preventDefault();

        const { pageY, posY } = this.dndPoint;
        const nextPosY = event.pageY - pageY + posY;
        setCachePosY(nextPosY);
        this.updatePosY_RAF();
      }
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
