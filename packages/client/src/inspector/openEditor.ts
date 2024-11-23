import { ServerApis } from '@open-editor/shared';
import { logError } from '../utils/logError';
import { dispatchEvent } from '../utils/dispatchEvent';
import { openEditorEndBridge, openEditorErrorBridge, openEditorStartBridge } from '../bridge';
import { type CodeSourceMeta } from '../resolve';
import { getOptions } from '../options';
import { OPEN_EDITOR_EVENT } from '../constants';

export async function openEditor(meta?: CodeSourceMeta) {
  const openURL = createOpenURL(meta);
  if (dispatchEvent(OPEN_EDITOR_EVENT, openURL)) {
    if (!meta) {
      logError('file not found.');
      openEditorErrorBridge.emit([], true);
      return;
    }

    try {
      openEditorStartBridge.emit();
      await fetch(openURL).then((res) => {
        if (!res.ok) return Promise.reject(res);
      });
    } catch (err) {
      const { file, line = 1, column = 1 } = meta;
      logError(`${file}:${line}:${column} open fail.`);
      openEditorErrorBridge.emit();
      return Promise.reject(err);
    } finally {
      openEditorEndBridge.emit();
    }
  }
}

export function createOpenURL(meta?: CodeSourceMeta) {
  const opts = getOptions();
  const { protocol, hostname, port } = location;
  const { file = '', line = 1, column = 1 } = meta ?? {};

  const openURL = new URL(`${protocol}//${hostname}`);
  openURL.pathname = ServerApis.OPEN_EDITOR;
  openURL.port = opts.port || port;
  openURL.searchParams.set('f', encodeURIComponent(file));
  openURL.searchParams.set('l', String(line));
  openURL.searchParams.set('c', String(column));
  return openURL;
}
