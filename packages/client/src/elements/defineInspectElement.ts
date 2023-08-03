import { ServerApis } from '@open-editor/shared';
import { setupListenersOnWindow } from '../utils/setupListenersOnWindow';
import { resolveSource } from '../utils/resolveSource';
import { applyAttrs } from '../utils/element';
import { isValidElement } from '../utils/isValidElement';
import { InternalElements } from '../constants';
import { getOptions } from '../options';
import { HTMLOverlayElement } from './defineOverlayElement';
import { HTMLPointerElement } from './definePointerElement';

export interface HTMLInspectElement extends HTMLElement {}

const theme = `<style>
:host {
  --black: #181818;
  --white: #ffffff;
  --grey: #abb2bf;
  --red: #ff5555;
  --green: #00dc82;
  --cyan: #1DE0B1;

  --element: var(--black);
  --pointer: var(--black);
  --bg-color: var(--white);
}

@media (prefers-color-scheme: dark) {
  :host {
    --black: #181818;
    --white: #ffffff;
    --grey: #abb2bf;
    --red: #ff5555;
    --green: #00dc82;
    --cyan: #2dd9da;
  
    --element: var(--grey);
    --pointer: var(--grey);
    --bg-color: var(--black);
  }
}
</style>`;

export function defineRootElement() {
  class InspectElement extends HTMLElement implements HTMLInspectElement {
    #mouseStyle!: HTMLElement;
    #overlay: HTMLOverlayElement;
    #pointer: HTMLPointerElement;

    #__active__!: boolean;

    get #active() {
      return this.#__active__;
    }

    set #active(value) {
      this.#__active__ = value;
      applyAttrs(this.#pointer, {
        active: value,
      });
    }

    #mousePoint!: MouseEvent;

    constructor() {
      super();

      const shadow = this.attachShadow({ mode: 'closed' });
      shadow.innerHTML = theme;

      this.#overlay = document.createElement(
        InternalElements.HTML_OVERLAY_ELEMENT,
      ) as HTMLOverlayElement;
      this.#pointer = document.createElement(
        InternalElements.HTML_POINTER_ELEMENT,
      ) as HTMLPointerElement;

      const options = getOptions();
      if (options.enablePointer) {
        applyAttrs(this.#pointer, {
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

      this.#lockMouseStyle();
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

    #lockMouseStyle() {
      if (!this.#mouseStyle) {
        const style = document.createElement('style');
        style.innerHTML = `*:hover {
          cursor: default;
        }`;
        this.#mouseStyle = style;
      }
      document.head.appendChild(this.#mouseStyle);
    }

    #unlockMouseStyle() {
      this.#mouseStyle.remove();
    }

    #cleanupListenersOnWindow?: () => void;

    #cleanupHandlers() {
      if (!this.#active) return;
      this.#active = false;

      this.#unlockMouseStyle();
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
