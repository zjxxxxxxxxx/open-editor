import {
  HTML_OVERLAY_ELEMENT,
  HTML_POINTER_ELEMENT,
  HTML_ROOT_ELEMENT,
} from '../constants';
import { HTMLOverlayElement } from './defineOverlayElement';
import { HTMLPointerElement } from './definePointerElement';
import { setupListenersOnWindow } from '../utils/setupListenersOnWindow';
import { resolveFilename } from '../utils/resolveFilename';
import { OPEN_EDITOR_PATH } from '@open-editor/shared';

export interface HTMLRootElementOptions {
  enablePointer: boolean;
  port: number;
}

export interface HTMLRootElement extends HTMLElement {
  setOptions(options: HTMLRootElementOptions): void;
}

export function defineRootElement() {
  class RootElement extends HTMLElement implements HTMLRootElement {
    #options: HTMLRootElementOptions;
    #overlay: HTMLOverlayElement;
    #pointer: HTMLPointerElement;

    #_active: boolean;

    get #active() {
      return this.#_active;
    }

    set #active(value) {
      this.#_active = value;
      this.#pointer?.setAttribute('active', String(value));
    }

    #mousePoint: MouseEvent;

    constructor() {
      super();

      const shadow = this.attachShadow({ mode: 'closed' });
      this.#overlay = document.createElement(
        HTML_OVERLAY_ELEMENT,
      ) as HTMLOverlayElement;
      this.#pointer = document.createElement(
        HTML_POINTER_ELEMENT,
      ) as HTMLPointerElement;

      shadow.appendChild(this.#overlay);
      shadow.appendChild(this.#pointer);
    }

    public setOptions(options: HTMLRootElementOptions) {
      this.#options = options;

      if (options.enablePointer) {
        this.#pointer.setAttribute('enable', 'true');
      }
    }

    connectedCallback() {
      window.addEventListener('keydown', this.#onKeydown);
      window.addEventListener('mousemove', this.#onMousePointChange);

      this.#pointer.addEventListener('activechange', this.#onActiveChange);
    }

    disconnectedCallback() {
      window.removeEventListener('keydown', this.#onKeydown);
      window.removeEventListener('mousemove', this.#onMousePointChange);

      this.#pointer.removeEventListener('activechange', this.#onActiveChange);

      this.#cleanupHandlers();
    }

    #onMousePointChange = (event: MouseEvent) => {
      this.#mousePoint = event;
    };

    #onKeydown = (event: KeyboardEvent) => {
      // start
      if (event.altKey && event.shiftKey && event.keyCode === 79) {
        this.#setupHandlers();
      }
      // stop
      else if (event.keyCode === 27) {
        this.#cleanupHandlers();
      }
    };

    #onActiveChange = (event: CustomEvent) => {
      if (event.detail) {
        this.#setupHandlers();
      } else {
        this.#cleanupHandlers();
      }
    };

    #setupHandlers() {
      if (this.#active) return;
      this.#active = true;

      this.#overlay.open();
      this.#cleanupListenersOnWindow = setupListenersOnWindow({
        onChangeElement: (element) => {
          this.#overlay.update(element);
        },
        onOpenEditor: (element) => {
          this.#openEditor(element);
        },
      });

      const { x, y } = this.#mousePoint;
      const initElement = document.elementFromPoint(x, y) as HTMLElement;
      if (initElement) {
        this.#overlay.update(initElement);
      }
    }

    #cleanupListenersOnWindow: () => void;

    #cleanupHandlers() {
      if (!this.#active) return;
      this.#active = false;

      this.#overlay.close();
      this.#cleanupListenersOnWindow();
    }

    #openEditor(element: HTMLElement) {
      const { port } = this.#options;
      const filename = resolveFilename(element);
      if (filename) {
        fetch(`http://localhost:${port}${OPEN_EDITOR_PATH}${filename}`).then(
          () => {
            this.#cleanupHandlers();
          },
        );
      }
    }
  }

  customElements.define(HTML_ROOT_ELEMENT, RootElement);
}
