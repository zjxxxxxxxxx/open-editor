import {
  addEventListener,
  appendChild,
  applyStyle,
  createElement,
  removeEventListener,
} from '../utils/dom';
import { Colors, InternalElements } from '../constants';

export interface HTMLPointerElement extends HTMLElement {}

export function definePointerElement() {
  class PointerElement extends HTMLElement implements HTMLPointerElement {
    static get observedAttributes() {
      return ['enable', 'active'];
    }

    #container: HTMLElement;
    #button: HTMLElement;

    constructor() {
      super();

      const shadow = this.attachShadow({ mode: 'closed' });

      this.#container = createElement('div');
      applyStyle(this.#container, {
        position: 'fixed',
        top: '0px',
        right: '0px',
        zIndex: '10001',
        transform: 'translateZ(10001px)',
        display: 'none',
        padding: '6px',
      });

      this.#button = createElement('div');
      applyStyle(this.#button, {
        padding: '2px',
        width: '18px',
        height: '18px',
        cursor: 'pointer',
        borderRadius: '50%',
        backdropFilter: 'blur(2px)',
        color: Colors.POINTER_COLOR,
        backgroundColor: Colors.POINTER_BG_COLOR,
      });

      this.#button.title = 'open-editor-inspect';
      this.#button.innerHTML = `
      <svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" fill="currentColor">
        <path d="M512 864A352 352 0 1 1 864 512 352.384 352.384 0 0 1 512 864z m0-640A288 288 0 1 0 800 512 288.341333 288.341333 0 0 0 512 224z"></path>
        <path d="M512 672A160 160 0 1 1 672 512 160.170667 160.170667 0 0 1 512 672z m0-256A96 96 0 1 0 608 512 96.128 96.128 0 0 0 512 416zM480 170.666667V85.333333a32.213333 32.213333 0 0 1 32-32 32.213333 32.213333 0 0 1 32 32v85.333334a32.213333 32.213333 0 0 1-32 32 32.213333 32.213333 0 0 1-32-32zM85.333333 544a32.213333 32.213333 0 0 1-32-32 32.213333 32.213333 0 0 1 32-32h85.333334a32.213333 32.213333 0 0 1 32 32 32.213333 32.213333 0 0 1-32 32zM480 938.666667v-85.333334a32.213333 32.213333 0 0 1 32-32 32.213333 32.213333 0 0 1 32 32v85.333334a32.213333 32.213333 0 0 1-32 32 32.213333 32.213333 0 0 1-32-32zM853.333333 544a32.213333 32.213333 0 0 1-32-32 32.213333 32.213333 0 0 1 32-32h85.333334a32.213333 32.213333 0 0 1 32 32 32.213333 32.213333 0 0 1-32 32z"></path>
      </svg>`;

      appendChild(this.#container, this.#button);
      appendChild(shadow, this.#container);
    }

    attributeChangedCallback(name: string, _: never, newValue: string) {
      switch (name) {
        case 'enable':
          if (newValue === 'true') {
            applyStyle(this.#container, {
              display: 'block',
            });
          } else {
            applyStyle(this.#container, {
              display: 'none',
            });
          }
          break;

        case 'active':
          if (newValue === 'true') {
            applyStyle(this.#button, {
              color: Colors.POINTER_ACTIVE_COLOR,
              boxShadow: `0px 0px 12px ${Colors.POINTER_ACTIVE_COLOR}`,
            });
          } else {
            applyStyle(this.#button, {
              color: Colors.POINTER_COLOR,
              boxShadow: 'none',
            });
          }
          break;
      }
    }

    connectedCallback() {
      addEventListener('click', this.#dispatchToggle, {
        target: this.#button,
      });
    }

    disconnectedCallback() {
      removeEventListener('click', this.#dispatchToggle, {
        target: this.#button,
      });
    }

    #dispatchToggle = () => {
      this.dispatchEvent(new CustomEvent('toggle'));
    };
  }

  customElements.define(InternalElements.HTML_POINTER_ELEMENT, PointerElement);
}
