import { isTopWindow } from '../utils/getTopWindow';
import { appendChild, replaceChildren } from '../utils/dom';
import { openEditorErrorBridge } from '../bridge';
import { on } from '../event';
import { HTML_INSPECT_ELEMENT } from '../constants';
import { getOptions } from '../options';
import { ToggleUI } from './ToggleUI';
import { OverlayUI } from './OverlayUI';
import { TooltipUI } from './TooltipUI';
import { TreeUI } from './TreeUI';

export function setupUI() {
  const { crossIframe, displayToggle } = getOptions();

  if (
    (crossIframe && !isTopWindow) ||
    document.querySelector(HTML_INSPECT_ELEMENT)
  ) {
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
      }

      public connectedCallback() {
        openEditorErrorBridge.on(() => {
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
          on('finish', () => errorOverlay.remove(), { target: ani });
          appendChild(this.shadowRoot, errorOverlay);
        });

        replaceChildren(
          this.shadowRoot,
          <>
            <link rel="stylesheet" href="./index.css" />
            {displayToggle && <ToggleUI />}
            <OverlayUI />
            <TooltipUI />
            <TreeUI />
          </>,
        );
      }
    },
  );

  appendChild(document.body, <HTML_INSPECT_ELEMENT />);
}
