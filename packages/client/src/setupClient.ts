import { appendChild, createElement } from './utils/dom';
import { defineElements } from './elements/defineElements';

import { CLIENT, InternalElements } from './constants';
import { Options, setOptions } from './options';

export function setupClient(options: Options) {
  if (CLIENT) {
    setOptions(options);

    if (typeof customElements === 'undefined') {
      throw Error(
        '@open-editor/client: current browser not support customElements.',
      );
    }

    defineElements();

    const inspect = createElement(InternalElements.HTML_INSPECT_ELEMENT);
    appendChild(document.body, inspect);
  }
}
