import { ServerApis } from '@open-editor/shared';
import { setupListenersOnWindow } from '../utils/setupListenersOnWindow';
import { resolveSource } from '../utils/resolveSource';
import { applyAttribute } from '../utils/element';
import { isValidElement } from '../utils/isValidElement';
import { InternalElements } from '../constants';
import { getOptions } from '../options';
import { HTMLOverlayElement } from './defineOverlayElement';
import { HTMLPointerElement } from './definePointerElement';

export interface HTMLInspectElement extends HTMLElement {}

export function defineRootElement() {
  class InspectElement extends HTMLElement implements HTMLInspectElement {
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

      const options = getOptions();
      if (options.enablePointer) {
        applyAttribute(this.#pointer, {
          enable: true,
        });
      }

      shadow.appendChild(this.#overlay);
      shadow.appendChild(this.#pointer);
    }

    connectedCallback() {
      window.addEventListener('keydown', this.#onKeydown);
      window.addEventListener('mousemove', this.#changeMousePoint);

      this.#pointer.addEventListener('toggle', this.#toggleActive);
    }

    disconnectedCallback() {
      window.removeEventListener('keydown', this.#onKeydown);
      window.removeEventListener('mousemove', this.#changeMousePoint);

      this.#pointer.removeEventListener('toggle', this.#toggleActive);

      this.#cleanupHandlers();
    }

    #changeMousePoint = (event: MouseEvent) => {
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

      if (this.#mousePoint) {
        const { x, y } = this.#mousePoint;
        const initElement = document.elementFromPoint(x, y) as HTMLElement;
        if (isValidElement(initElement)) {
          this.#overlay.update(initElement);
        }
      }
    }

    #cleanupListenersOnWindow?: () => void;

    #cleanupHandlers() {
      if (!this.#active) return;
      this.#active = false;

      this.#overlay.close();
      this.#cleanupListenersOnWindow?.();
    }

    async #openEditor(element: HTMLElement) {
      const { file } = resolveSource(element);
      if (file) {
        let openURL = `${ServerApis.OPEN_EDITOR}${file}`;

        const { serverAddress } = getOptions();
        if (serverAddress) {
          openURL = `${serverAddress}${openURL}`;
        }

        await fetch(openURL);
        this.#cleanupHandlers();
      }
    }
  }

  customElements.define(InternalElements.HTML_INSPECT_ELEMENT, InspectElement);
}
