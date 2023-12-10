import { append } from './utils/ui';
import { defineElements } from './elements';
import { CLIENT, InternalElements } from './constants';
import { Options, setOptions } from './options';

export function setupClient(userOpts: Options) {
  if (!CLIENT) return;
  if (!document.querySelector(InternalElements.HTML_INSPECT_ELEMENT)) {
    setOptions(userOpts);
    defineElements();
    append(document.body, <InternalElements.HTML_INSPECT_ELEMENT />);
  }
}
