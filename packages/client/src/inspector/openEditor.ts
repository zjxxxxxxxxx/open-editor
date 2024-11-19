import { ServerApis } from '@open-editor/shared';
import { logError } from '../utils/logError';
import type { CodeSourceMeta } from '../resolve';
import { getOptions } from '../options';

export async function openEditor(
  source: CodeSourceMeta,
  dispatch: (e: CustomEvent<URL>) => boolean,
): Promise<void> {
  const opts = getOptions();
  const { protocol, hostname, port } = location;
  const { file, line = 1, column = 1 } = source;

  const openURL = new URL(`${protocol}//${hostname}`);
  openURL.pathname = ServerApis.OPEN_EDITOR;
  openURL.port = opts.port || port;
  openURL.searchParams.set('f', encodeURIComponent(file));
  openURL.searchParams.set('l', String(line));
  openURL.searchParams.set('c', String(column));

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
        logError(`${file}:${line}:${column} open fail.`);
        return Promise.reject(err);
      });
  }
}
