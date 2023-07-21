import { HTML_OVERLAY_ELEMENT } from '../constants';
import {
  ComputedStyle,
  emptyComputedStyle,
  getComputedStyles,
} from '../utils/getComputedStyles';

export interface HTMLOverlayElement extends HTMLElement {
  open(): void;
  close(): void;
  update(element: HTMLElement): void;
}

export function defineOverlayElement() {
  const overlayStyles = {
    margin: 'rgba(255, 155, 0, 0.3)',
    border: 'rgba(255, 200, 50, 0.3)',
    padding: 'rgba(77, 200, 0, 0.3)',
    content: 'rgba(120, 170, 210, 0.7)',
  };

  class OverlayElement extends HTMLElement implements HTMLOverlayElement {
    #posttionRect: HTMLElement;
    #marginRect: HTMLElement;
    #borderRect: HTMLElement;
    #paddingRect: HTMLElement;
    #contentRect: HTMLElement;

    #activeElement: HTMLElement;

    constructor() {
      super();

      const shadow = this.attachShadow({ mode: 'closed' });
      this.#posttionRect = document.createElement('div');
      this.#marginRect = document.createElement('div');
      this.#borderRect = document.createElement('div');
      this.#paddingRect = document.createElement('div');
      this.#contentRect = document.createElement('div');

      shadow.appendChild(this.#posttionRect);
      this.#posttionRect.appendChild(this.#marginRect);
      this.#marginRect.appendChild(this.#borderRect);
      this.#borderRect.appendChild(this.#paddingRect);
      this.#paddingRect.appendChild(this.#contentRect);

      this.#posttionRect.style.position = 'fixed';
      this.#posttionRect.style.zIndex = '10000';
      this.#posttionRect.style.transform = 'translateZ(10000px)';
      this.#posttionRect.style.display = 'none';
      this.#posttionRect.style.pointerEvents = 'none';

      this.#marginRect.style.borderColor = overlayStyles.margin;
      this.#borderRect.style.borderColor = overlayStyles.border;
      this.#paddingRect.style.borderColor = overlayStyles.padding;
      this.#contentRect.style.backgroundColor = overlayStyles.content;
    }

    connectedCallback() {
      window.addEventListener('resize', this.#reUpdate);
    }

    disconnectedCallback() {
      window.removeEventListener('resize', this.#reUpdate);
    }

    public open() {
      this.#updateStyles({
        posttion: emptyComputedStyle,
        margin: emptyComputedStyle,
        border: emptyComputedStyle,
        padding: emptyComputedStyle,
        content: emptyComputedStyle,
      });
      this.#posttionRect.style.display = 'block';
    }

    public close() {
      this.#activeElement = null;
      this.#posttionRect.style.display = 'none';
    }

    public update(element: HTMLElement) {
      this.#activeElement = element;
      this.#reUpdate();
    }

    #reUpdate = () => {
      if (this.#activeElement) {
        const styles = getComputedStyles(this.#activeElement);
        this.#updateStyles(styles);
      }
    };

    #updateStyles(styles: Record<string, ComputedStyle>) {
      this.#posttionRect.style.width = `${styles.posttion.width}px`;
      this.#posttionRect.style.height = `${styles.posttion.height}px`;
      this.#posttionRect.style.top = `${styles.posttion.top}px`;
      this.#posttionRect.style.left = `${styles.posttion.left}px`;

      this.#contentRect.style.width = `${styles.content.width}px`;
      this.#contentRect.style.height = `${styles.content.height}px`;

      wrapBoxRectStyle(this.#marginRect, styles.margin);
      wrapBoxRectStyle(this.#borderRect, styles.border);
      wrapBoxRectStyle(this.#paddingRect, styles.padding);
    }
  }

  customElements.define(HTML_OVERLAY_ELEMENT, OverlayElement);
}

function wrapBoxRectStyle(boxRect: HTMLElement, style: ComputedStyle) {
  boxRect.style.width = `${style.width}px`;
  boxRect.style.height = `${style.height}px`;
  boxRect.style.borderWidth = `${style.top}px ${style.right}px ${style.bottom}px ${style.left}px`;
  boxRect.style.borderStyle = 'solid';
}
