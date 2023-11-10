import { append, jsx } from './utils/html';
import { defineElements } from './elements/defineElements';
import { CLIENT, InternalElements } from './constants';
import { Options, setOptions } from './options';

export function setupClient(options: Options) {
  if (!CLIENT) return;
  if (!document.querySelector(InternalElements.HTML_INSPECT_ELEMENT)) {
    setOptions(options);
    defineElements();
    append(document.body, jsx(InternalElements.HTML_INSPECT_ELEMENT));
  }
}
