import { ServerApis } from '@open-editor/shared';
import { getOptions } from '../options';
import { ElementSourceMeta } from './resolveSource';

export function openEditor(
  source: ElementSourceMeta,
  dispatchEvent: (evt: CustomEvent) => boolean,
) {
  const { protocol, hostname, port } = window.location;
  const { file, line = 1, column = 1 } = source;
  const { port: customPort } = getOptions();

  const openURL = new URL(`${protocol}//${hostname}`);
  openURL.pathname = `${ServerApis.OPEN_EDITOR}${file}`;
  openURL.searchParams.set('line', String(line));
  openURL.searchParams.set('column', String(column));
  openURL.port = customPort || port;

  // open-editor event
  const event = new CustomEvent('openeditor', {
    bubbles: true,
    cancelable: true,
    composed: true,
    detail: openURL,
  });

  // Dispatches a synthetic event event to target and returns true if either event's cancelable
  // attribute value is false or its preventDefault() method was not invoked, and false otherwise.
  if (dispatchEvent(event)) {
    fetch(openURL).catch(() => {
      console.error(
        new Error('@open-editor/client: open fail.', {
          cause: false,
        }),
        openURL,
      );
    });
  }
}
