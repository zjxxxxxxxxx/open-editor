import { ServerApis } from '@open-editor/shared';
import type { SourceCodeMeta } from '../resolve';
import { getOptions } from '../options';
import { sendErrMsg } from './errorMessage';

type Listener = (err: any) => void;

const listeners: Listener[] = [];

export async function openEditor(
  source: SourceCodeMeta,
  dispatch: (e: CustomEvent<URL>) => boolean,
) {
  const { protocol, hostname, port } = window.location;
  const { file, line = 1, column = 1 } = source;
  const { port: customPort } = getOptions();

  const openURL = new URL(`${protocol}//${hostname}`);
  openURL.pathname = `${ServerApis.OPEN_EDITOR}${file}`;
  openURL.port = customPort || port;
  openURL.searchParams.set('line', String(line));
  openURL.searchParams.set('column', String(column));

  // open-editor event
  const e = new CustomEvent('openeditor', {
    bubbles: true,
    cancelable: true,
    composed: true,
    detail: openURL,
  });

  // Dispatches a synthetic event event to target and returns true if either event's cancelable
  // attribute value is false or its preventDefault() method was not invoked, and false otherwise.
  if (dispatch(e)) {
    return fetch(openURL)
      .then((res) => {
        if (!res.ok) return Promise.reject(res);
      })
      .catch((err) => {
        sendErrMsg('open fail');
        listeners.forEach((listener) => listener(err));
        return Promise.reject(err);
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
