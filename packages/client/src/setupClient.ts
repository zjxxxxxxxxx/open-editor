import { append, create } from './utils/document';
import { defineElements } from './elements/defineElements';

import { CLIENT, InternalElements } from './constants';
import { Options, setOptions } from './options';

export function setupClient(options: Options) {
  if (CLIENT && !isMounted()) {
    setOptions(options);
    defineElements();

    const inspect = create(InternalElements.HTML_INSPECT_ELEMENT);
    append(document.body, inspect);
  }
}

function isMounted() {
  return !!document.body.querySelector(InternalElements.HTML_INSPECT_ELEMENT);
}
