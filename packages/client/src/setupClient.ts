import { InternalElements } from './constants';
import { defineElements } from './elements/defineElements';
import { HTMLRootElement } from './elements/defineRootElement';

export interface SetupClientOptions {
  /**
   * render the pointer into the browser
   */
  enablePointer?: boolean;
  /**
   * internal server address
   */
  serverAddress: string;
}

export function setupClient(options: SetupClientOptions) {
  if (typeof window === 'undefined') return;
  defineElements();

  window.addEventListener('DOMContentLoaded', () => {
    const { enablePointer = true, serverAddress } = options;
    const root = document.createElement(
      InternalElements.HTML_ROOT_ELEMENT,
    ) as HTMLRootElement;
    root.setOptions({
      enablePointer,
      serverAddress,
    });
    document.body.appendChild(root);
  });
}
