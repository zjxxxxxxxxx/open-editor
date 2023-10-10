import {
  on,
  off,
  applyStyle,
  create,
  append,
  CSS_util,
} from '../utils/document';
import { create_RAF } from '../utils/createRAF';
import { getSafeArea } from '../utils/safeArea';
import { Colors, InternalElements } from '../constants';

export interface HTMLToggleElement extends HTMLElement {}

const CSS = `
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

const toggleIcon = `
<svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" fill="currentColor">
  <path d="M512 864A352 352 0 1 1 864 512 352.384 352.384 0 0 1 512 864z m0-640A288 288 0 1 0 800 512 288.341333 288.341333 0 0 0 512 224z"></path>
  <path d="M512 672A160 160 0 1 1 672 512 160.170667 160.170667 0 0 1 512 672z m0-256A96 96 0 1 0 608 512 96.128 96.128 0 0 0 512 416zM480 170.666667V85.333333a32.213333 32.213333 0 0 1 32-32 32.213333 32.213333 0 0 1 32 32v85.333334a32.213333 32.213333 0 0 1-32 32 32.213333 32.213333 0 0 1-32-32zM85.333333 544a32.213333 32.213333 0 0 1-32-32 32.213333 32.213333 0 0 1 32-32h85.333334a32.213333 32.213333 0 0 1 32 32 32.213333 32.213333 0 0 1-32 32zM480 938.666667v-85.333334a32.213333 32.213333 0 0 1 32-32 32.213333 32.213333 0 0 1 32 32v85.333334a32.213333 32.213333 0 0 1-32 32 32.213333 32.213333 0 0 1-32-32zM853.333333 544a32.213333 32.213333 0 0 1-32-32 32.213333 32.213333 0 0 1 32-32h85.333334a32.213333 32.213333 0 0 1 32 32 32.213333 32.213333 0 0 1-32 32z"></path>
</svg>
`;

export function defineToggleElement() {
  class ToggleElement extends HTMLElement implements HTMLToggleElement {
    static get observedAttributes() {
      return ['active'];
    }

    private cacheId = '__open_editor_toggle_pos_y__';
    private touch?: { pageY: number; posY: number };
    private active = false;
    private root: HTMLElement;
    private button: HTMLElement;

    constructor() {
      super();

      const shadow = this.attachShadow({ mode: 'closed' });
      shadow.innerHTML = `<style>${CSS}</style>`;

      this.root = create('div');
      this.root.classList.add('root');

      this.button = create('div');
      this.button.classList.add('button');
      this.button.title = 'open-editor-toggle';
      this.button.innerHTML = toggleIcon;

      append(this.root, this.button);
      append(shadow, this.root);
    }

    attributeChangedCallback(_: never, __: never, newValue: string) {
      if (newValue === 'true') {
        this.active = true;
        applyStyle(this.button, {
          color: Colors.TOGGLE_ACTIVE_COLOR,
          filter: `drop-shadow(0 0 8px ${Colors.TOGGLE_ACTIVE_SHADOW})`,
        });
      } else {
        this.active = false;
        applyStyle(this.button, {
          color: Colors.TOGGLE_COLOR,
          filter: 'none',
        });
      }
    }

    connectedCallback() {
      applyStyle(this.root, {
        right: CSS_util.px(getSafeArea().right),
      });
      this.updatePosY_RAF();

      on('click', this.dispatchToggle, {
        target: this.button,
      });
      on('resize', this.updatePosY_RAF);
      on('pointerdown', this.saveTouch, {
        target: this.root,
      });
      on('pointerup', this.cleanTouch);
      on('pointermove', this.changePosY);
    }

    disconnectedCallback() {
      off('click', this.dispatchToggle, {
        target: this.button,
      });
      off('resize', this.updatePosY_RAF);
      off('pointerdown', this.saveTouch, {
        target: this.root,
      });
      off('pointerup', this.cleanTouch);
      off('pointermove', this.changePosY);
    }

    private saveTouch = (e: PointerEvent) => {
      this.touch = {
        pageY: e.pageY,
        posY: parseInt(localStorage[this.cacheId]) || 0,
      };
    };

    private cleanTouch = () => {
      this.touch = undefined;
    };

    private changePosY = (e: PointerEvent) => {
      if (this.touch && !this.active) {
        e.preventDefault();
        localStorage[this.cacheId] =
          e.pageY - this.touch.pageY + this.touch.posY;
        this.updatePosY_RAF();
      }
    };

    private updatePosY_RAF = create_RAF(() => {
      const { clientHeight: winH } = document.documentElement;
      const { offsetHeight: toggleH } = this.root;
      const { top, bottom } = getSafeArea();
      const cachePosY = parseInt(localStorage[this.cacheId]) || 0;

      const minY = top;
      const maxY = winH - toggleH - bottom;
      const y = Math.min(Math.max(cachePosY - toggleH / 2, minY), maxY);
      applyStyle(this.root, {
        top: CSS_util.px(y),
      });
    });

    private dispatchToggle = () => {
      this.dispatchEvent(new CustomEvent('toggle'));
    };
  }

  customElements.define(InternalElements.HTML_TOGGLE_ELEMENT, ToggleElement);
}
