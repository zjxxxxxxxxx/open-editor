import { Colors, InternalElements } from '../constants';
import { applyStyle } from '../utils/element';

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
      applyStyle(this.#button, {
        position: 'fixed',
        top: '0px',
        right: '0px',
        zIndex: '10001',
        transform: 'translateZ(10001px)',
        display: 'none',
        padding: '8px',
        width: '24px',
        height: '24px',
        cursor: 'pointer',
      });
      applyStyle(this.#button, {
        color: Colors.POINTER_DEFAULT,
        filter: `drop-shadow(0 0 1px ${Colors.POINTER_DEFAULT_SHADOW})`,
      });

      this.#button.innerHTML = `
        <svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
          <path d="M512 337.45454563c-96 0-174.54545437 78.54545438-174.54545437 174.54545437s78.54545438 174.54545437 174.54545437 174.54545437 174.54545437-78.54545438 174.54545437-174.54545437-78.54545438-174.54545437-174.54545437-174.54545437zM900.36363594 468.36363594C878.54545437 285.09090874 734.54545438 141.09090877 555.63636406 123.63636406V32h-87.27272812v91.63636406C285.09090874 141.09090877 141.09090877 285.09090874 123.63636406 468.36363594H32v87.27272812h91.63636406C145.45454563 738.90909126 289.45454562 882.90909123 468.36363594 900.36363594V992h87.27272812v-91.63636406C738.90909126 878.54545437 882.90909123 734.54545438 900.36363594 555.63636406H992v-87.27272812h-91.63636406zM512 817.45454562C341.81818156 817.45454562 206.54545438 682.18181844 206.54545438 512S341.81818156 206.54545438 512 206.54545438 817.45454562 341.81818156 817.45454562 512 682.18181844 817.45454562 512 817.45454562z" fill="currentColor"></path>
        </svg>
      `;

      shadow.appendChild(this.#button);
    }

    attributeChangedCallback(name: string, _: never, newValue: string) {
      switch (name) {
        case 'enable':
          if (newValue === 'true') {
            applyStyle(this.#button, {
              display: 'block',
            });
          } else {
            applyStyle(this.#button, {
              display: 'none',
            });
          }
          break;

        case 'active':
          if (newValue === 'true') {
            applyStyle(this.#button, {
              color: Colors.POINTER_ACTIVE,
              filter: '',
            });
          } else {
            applyStyle(this.#button, {
              color: Colors.POINTER_DEFAULT,
              filter: `drop-shadow(0 0 1px ${Colors.POINTER_DEFAULT_SHADOW})`,
            });
          }
          break;
      }
    }

    connectedCallback() {
      this.#button.addEventListener('click', this.#dispatchToggle);
    }

    disconnectedCallback() {
      this.#button.removeEventListener('click', this.#dispatchToggle);
    }

    #dispatchToggle = () => {
      this.dispatchEvent(new CustomEvent('toggle'));
    };
  }

  customElements.define(InternalElements.HTML_POINTER_ELEMENT, PointerElement);
}
