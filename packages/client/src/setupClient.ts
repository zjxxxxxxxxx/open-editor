import { HTML_ROOT_ELEMENT } from './constants';
import { defineElements } from './elements/defineElements';
import { HTMLRootElement } from './elements/defineRootElement';

export interface SetupClientOptions {
  /**
   * render the pointer into the browser
   */
  enablePointer?: boolean;
  /**
   *
   */
  port: number;
}

export function setupClient(options: SetupClientOptions) {
  if (typeof window === 'undefined') return;
  defineElements();

  window.addEventListener('DOMContentLoaded', () => {
    const { enablePointer = true, port } = options;
    const root = document.createElement(HTML_ROOT_ELEMENT) as HTMLRootElement;
    root.setOptions({
      enablePointer,
      port,
    });
    document.body.appendChild(root);
  });
}
