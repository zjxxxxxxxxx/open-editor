import { appendChild } from './utils/ui';
import { defineElements } from './elements';
import { InternalElements } from './constants';
import { type Options, setOptions } from './options';

export function setupClient(userOpts: Options) {
  if (!document.querySelector(InternalElements.HTML_INSPECT_ELEMENT)) {
    setOptions(userOpts);
    defineElements();
    appendChild(document.body, <InternalElements.HTML_INSPECT_ELEMENT />);
  }
}
