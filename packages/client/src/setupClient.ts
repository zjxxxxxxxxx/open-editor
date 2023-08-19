import { append, create } from './utils/document';
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

    const inspect = create(InternalElements.HTML_INSPECT_ELEMENT);
    append(document.body, inspect);
  }
}
