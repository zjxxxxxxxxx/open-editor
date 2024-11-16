import { HTML_INSPECT_ELEMENT } from '../constants';
import { InspectUI } from './InspectUI';
import { effectStyle } from '../styles/globalStyles';
import { appendChild, replaceChildren } from '../utils/dom';
import { openEditor } from './utils/openEditor';
import { on } from '../event';

export function setupUI() {
  if (document.querySelector(HTML_INSPECT_ELEMENT)) {
    return;
  }

  customElements.define(
    HTML_INSPECT_ELEMENT,
    class extends HTMLElement {
      declare readonly shadowRoot: ShadowRoot;

      constructor() {
        super();
        Object.defineProperty(this, 'shadowRoot', {
          value: this.attachShadow({ mode: 'closed' }),
        });
        this.showErrorOverlay = this.showErrorOverlay.bind(this);
      }

      public connectedCallback() {
        openEditor.onError(this.showErrorOverlay);
        effectStyle.mount();
        replaceChildren(
          this.shadowRoot,
          <>
            <link rel="stylesheet" href="./index.css" />
            <InspectUI showErrorOverlay={this.showErrorOverlay} />
          </>,
        );
      }

      private showErrorOverlay() {
        const errorOverlay = <div className="oe-error-overlay" />;
        const ani = errorOverlay.animate(
          [
            {},
            {
              boxShadow: 'inset 0 0 20px 10px var(--red)',
              background: 'var(--red-light)',
            },
            {},
          ],
          {
            duration: 600,
            easing: 'ease-out',
          },
        );

        const remove = () => errorOverlay.remove();
        on('finish', remove, { target: ani });

        appendChild(this.shadowRoot, errorOverlay);
      }
    },
  );

  appendChild(document.body, <HTML_INSPECT_ELEMENT />);
}
