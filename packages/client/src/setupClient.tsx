if (typeof window === 'undefined') {
  throw Error(
    '@open-editor/client: Does not support running on the server side.',
  );
}

import { appendChild } from './utils/ui';
import { defineElements } from './elements';
import { InternalElements } from './constants';
import { Options, setOptions } from './options';

export function setupClient(userOpts: Options) {
  if (!document.querySelector(InternalElements.HTML_INSPECT_ELEMENT)) {
    setOptions(userOpts);
    defineElements();
    appendChild(document.body, <InternalElements.HTML_INSPECT_ELEMENT />);
  }
}
