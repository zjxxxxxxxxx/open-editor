import { ServerApis } from '@open-editor/shared';
import type { ElementSourceMeta } from '../resolve';
import { getOptions } from '../options';

type Listener = (e: CustomEvent<URL>) => void;

const listeners: Listener[] = [];

export function openEditor(
  source: ElementSourceMeta,
  dispatchEvent: (e: CustomEvent<URL>) => boolean,
) {
  const { protocol, hostname, port } = window.location;
  const { file, line = 1, column = 1 } = source;
  const { port: customPort } = getOptions();

  const openURL = new URL(`${protocol}//${hostname}`);
  openURL.pathname = `${ServerApis.OPEN_EDITOR}${file}`;
  openURL.searchParams.set('line', String(line));
  openURL.searchParams.set('column', String(column));
  openURL.port = customPort || port;

  // open-editor e
  const e = new CustomEvent('openeditor', {
    bubbles: true,
    cancelable: true,
    composed: true,
    detail: openURL,
  });

  // Dispatches a synthetic event event to target and returns true if either event's cancelable
  // attribute value is false or its preventDefault() method was not invoked, and false otherwise.
  if (dispatchEvent(e)) {
    fetch(openURL).catch(() => {
      listeners.forEach((listener) => listener(e));
      console.error(Error('@open-editor/client: open fail.'), openURL);
    });
  }
}

export function onOpenEditorError(listener: Listener) {
  listeners.push(listener);
}

export function offOpenEditorError(listener: Listener) {
  const index = listeners.indexOf(listener);
  if (index !== -1) {
    listeners.splice(index, 1);
  }
}
