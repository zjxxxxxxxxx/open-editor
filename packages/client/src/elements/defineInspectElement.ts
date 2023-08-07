import { ServerApis } from '@open-editor/shared';
import { setupListenersOnWindow } from '../utils/setupListenersOnWindow';
import { resolveSource } from '../utils/resolveSource';
import {
  applyAttrs,
  createElement,
  addEventListener,
  removeEventListener,
  appendChild,
} from '../utils/dom';
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
  --cyan: #2dd9da;

  --element: var(--black);
  --pointer: var(--black);
  --pointer-bg: #ffffffcc;
  --bg-color: var(--white);
}

@media (prefers-color-scheme: dark) {
  :host {  
    --element: var(--grey);
    --pointer: var(--white);
    --pointer-bg: #181818cc;
    --bg-color: var(--black);
  }
}
</style>`;

export function defineInspectElement() {
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

      this.#overlay = <HTMLOverlayElement>(
        createElement(InternalElements.HTML_OVERLAY_ELEMENT)
      );
      this.#pointer = <HTMLPointerElement>(
        createElement(InternalElements.HTML_POINTER_ELEMENT)
      );

      const options = getOptions();
      if (options.enablePointer) {
        applyAttrs(this.#pointer, {
          enable: true,
        });
      }

      appendChild(shadow, this.#overlay);
      appendChild(shadow, this.#pointer);
    }

    connectedCallback() {
      addEventListener('keydown', this.#onKeydown);
      addEventListener('mousemove', this.#changeMousePoint);

      addEventListener.call(this.#pointer, 'toggle', this.#toggleActive);
    }

    disconnectedCallback() {
      removeEventListener('keydown', this.#onKeydown);
      removeEventListener('mousemove', this.#changeMousePoint);

      removeEventListener.call(this.#pointer, 'toggle', this.#toggleActive);

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
      this.#lockMouseStyle();
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
        const initElement = <HTMLElement>document.elementFromPoint(x, y);
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
      this.#unlockMouseStyle();
      this.#cleanupListenersOnWindow?.();
    }

    #lockMouseStyle() {
      if (!this.#mouseStyle) {
        const style = createElement('style');
        style.innerHTML = `*:hover {
          cursor: default;
        }`;
        this.#mouseStyle = style;
      }
      requestAnimationFrame(() => appendChild(document.head, this.#mouseStyle));
    }

    #unlockMouseStyle() {
      this.#mouseStyle.remove();
    }

    async #openEditor(element: HTMLElement) {
      const { file, line = 0, column = 0 } = resolveSource(element);
      if (file) {
        let openURL = `${ServerApis.OPEN_EDITOR}${file}?line=${line}&column=${column}`;

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
