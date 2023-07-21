import { HTML_POINTER_ELEMENT } from '../constants';

export interface HTMLPointerElement extends HTMLElement {}

export function definePointerElement() {
  class PointerElement extends HTMLElement implements HTMLPointerElement {
    static get observedAttributes() {
      return ['enable', 'active'];
    }

    #button: HTMLElement;

    constructor() {
      super();

      const shadow = this.attachShadow({ mode: 'closed' });
      this.#button = document.createElement('div');

      shadow.appendChild(this.#button);
    }

    attributeChangedCallback(name, _, newValue) {
      switch (name) {
        case 'enable':
          if (newValue === 'true') {
            this.#button.style.display = 'block';
          } else {
            this.#button.style.color = 'none';
          }
          break;
        case 'active':
          if (newValue === 'true') {
            this.#button.style.color = '#61dafb';
          } else {
            this.#button.style.color = '#666666';
          }
          break;
      }
    }

    connectedCallback() {
      this.#button.addEventListener('click', this.#dispatchActiveChange);
    }

    disconnectedCallback() {
      this.#button.removeEventListener('click', this.#dispatchActiveChange);
    }

    #dispatchActiveChange = () => {
      this.dispatchEvent(
        new CustomEvent('activechange', {
          detail: this.getAttribute('active') !== 'true',
        }),
      );
    };
  }

  customElements.define(HTML_POINTER_ELEMENT, PointerElement);
}
