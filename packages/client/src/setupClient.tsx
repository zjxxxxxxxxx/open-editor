import { appendChild } from './utils/dom';
import { InternalElements } from './constants';
import { type Options, setOptions } from './options';
import { defineElements } from './elements';

export function setupClient(userOpts: Options) {
  if (!document.querySelector(InternalElements.HTML_INSPECT_ELEMENT)) {
    setOptions(userOpts);
    defineElements();
    appendChild(document.body, <InternalElements.HTML_INSPECT_ELEMENT />);
  }
}
