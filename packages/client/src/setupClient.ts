import { InternalElements } from './constants';
import { defineElements } from './elements/defineElements';
import { HTMLInspectElement } from './elements/defineInspectElement';

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
      InternalElements.HTML_INSPECT_ELEMENT,
    ) as HTMLInspectElement;
    root.setOptions({
      enablePointer,
      serverAddress,
    });
    document.body.appendChild(root);
  });
}
