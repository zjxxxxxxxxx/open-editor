import { InternalElements } from './constants';
import { defineElements } from './elements/defineElements';
import { Options, setOptions } from './options';

export function setupClient(options: Options) {
  if (typeof window === 'undefined') return;
  if (typeof customElements === 'undefined') {
    throw Error('@open-editor/client: customElements missing.');
  }

  setOptions(options);
  defineElements();

  const inspect = document.createElement(InternalElements.HTML_INSPECT_ELEMENT);
  document.body.appendChild(inspect);
}
