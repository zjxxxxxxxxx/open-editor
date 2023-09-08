import { on, off, applyStyle, create, append } from '../utils/document';
import { Colors, InternalElements } from '../constants';

export interface HTMLToggleElement extends HTMLElement {}

const CSS = `
.container {
  position: fixed;
  top: 0px;
  right: 0px;
  z-index: 1000001;
  padding: 6px;
}

.button {
  padding: 2px;
  width: 18px;
  height: 18px;
  color: var(--toggle);
  background-color: var(--toggle-bg);
  transition: all 0.3s ease-out;
  border-radius: 50%;
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

    #container: HTMLElement;
    #button: HTMLElement;

    constructor() {
      super();

      const shadow = this.attachShadow({ mode: 'closed' });
      shadow.innerHTML = `<style>${CSS}</style>`;

      this.#container = create('div');
      this.#container.classList.add('container');

      this.#button = create('div');
      this.#button.classList.add('button');
      this.#button.title = 'open-editor-toggle';
      this.#button.innerHTML = toggleIcon;

      append(this.#container, this.#button);
      append(shadow, this.#container);
    }

    public attributeChangedCallback(_: never, __: never, newValue: string) {
      if (newValue === 'true') {
        applyStyle(this.#button, {
          color: Colors.TOGGLE_ACTIVE_COLOR,
          filter: `drop-shadow(0 0 8px ${Colors.TOGGLE_ACTIVE_SHADOW})`,
        });
      } else {
        applyStyle(this.#button, {
          color: Colors.TOGGLE_COLOR,
          filter: 'none',
        });
      }
    }

    public connectedCallback() {
      on('click', this.#dispatchToggle, {
        target: this.#button,
      });
    }

    public disconnectedCallback() {
      off('click', this.#dispatchToggle, {
        target: this.#button,
      });
    }

    #dispatchToggle = () => {
      this.dispatchEvent(new CustomEvent('toggle'));
    };
  }

  customElements.define(InternalElements.HTML_TOGGLE_ELEMENT, ToggleElement);
}
