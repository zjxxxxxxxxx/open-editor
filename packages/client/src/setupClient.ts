import { InternalElements } from './constants';
import { defineElements } from './elements/defineElements';
import { HTMLInspectElement } from './elements/defineInspectElement';
import { SetupClientOptions, setOptions } from './options';

export function setupClient(options: SetupClientOptions) {
  if (typeof window === 'undefined') return;
  defineElements();
  setOptions(options);

  window.addEventListener('DOMContentLoaded', () => {
    const root = document.createElement(
      InternalElements.HTML_INSPECT_ELEMENT,
    ) as HTMLInspectElement;
    document.body.appendChild(root);
  });
}
