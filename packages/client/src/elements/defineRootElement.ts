import { ServerApis } from '@open-editor/shared';
import { InternalElements } from '../constants';
import { HTMLOverlayElement } from './defineOverlayElement';
import { HTMLPointerElement } from './definePointerElement';
import { setupListenersOnWindow } from '../utils/setupListenersOnWindow';
import { resolveSource } from '../utils/resolveSource';
import { applyAttribute } from '../utils/element';

export interface HTMLRootElementOptions {
  /**
   * render the pointer into the browser
   */
  enablePointer?: boolean;
  /**
   * internal server address
   */
  serverAddress: string;
}

export interface HTMLRootElement extends HTMLElement {
  setOptions(options: HTMLRootElementOptions): void;
}

export function defineRootElement() {
  class RootElement extends HTMLElement implements HTMLRootElement {
    #options!: HTMLRootElementOptions;
    #overlay: HTMLOverlayElement;
    #pointer: HTMLPointerElement;

    #_active!: boolean;

    get #active() {
      return this.#_active;
    }

    set #active(value) {
      this.#_active = value;
      applyAttribute(this.#pointer, {
        active: value,
      });
    }

    #mousePoint!: MouseEvent;

    constructor() {
      super();

      const shadow = this.attachShadow({ mode: 'closed' });
      this.#overlay = document.createElement(
        InternalElements.HTML_OVERLAY_ELEMENT,
      ) as HTMLOverlayElement;
      this.#pointer = document.createElement(
        InternalElements.HTML_POINTER_ELEMENT,
      ) as HTMLPointerElement;

      shadow.appendChild(this.#overlay);
      shadow.appendChild(this.#pointer);
    }

    public setOptions(options: HTMLRootElementOptions) {
      this.#options = options;

      if (options.enablePointer) {
        applyAttribute(this.#pointer, {
          enable: true,
        });
      }
    }

    connectedCallback() {
      window.addEventListener('keydown', this.#onKeydown);
      window.addEventListener('mousemove', this.#onMousePointChange);

      this.#pointer.addEventListener('toggle', this.#toggleActive);
    }

    disconnectedCallback() {
      window.removeEventListener('keydown', this.#onKeydown);
      window.removeEventListener('mousemove', this.#onMousePointChange);

      this.#pointer.removeEventListener('toggle', this.#toggleActive);

      this.#cleanupHandlers();
    }

    #onMousePointChange = (event: MouseEvent) => {
      this.#mousePoint = event;
    };

    #onKeydown = (event: KeyboardEvent) => {
      // toggle
      if (event.altKey && event.metaKey && event.keyCode === 79) {
        this.#toggleActive();
      }
      // stop
      else if (event.keyCode === 27) {
        this.#cleanupHandlers();
      }
    };

    #toggleActive = () => {
      if (!this.#active) {
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

    #cleanupListenersOnWindow?: () => void;

    #cleanupHandlers() {
      if (!this.#active) return;
      this.#active = false;

      this.#overlay.close();
      this.#cleanupListenersOnWindow?.();
    }

    #openEditor(element: HTMLElement) {
      const { serverAddress } = this.#options;
      const source = resolveSource(element);
      if (source) {
        fetch(`${serverAddress}${ServerApis.OPEN_EDITOR}${source.file}`).then(
          () => {
            this.#cleanupHandlers();
          },
        );
      }
    }
  }

  customElements.define(InternalElements.HTML_ROOT_ELEMENT, RootElement);
}
