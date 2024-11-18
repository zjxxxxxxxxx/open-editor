import { isStr } from '@open-editor/shared';
import { on } from '../event';

export function onMessage<Args extends any[] = []>(
  type: string,
  cb: (args: Args) => void,
) {
  on('message', ({ data }) => {
    if (isStr(data) && data.startsWith(type)) {
      cb(JSON.parse(data.replace(type, '')));
    }
  });
}

export function postMessage(
  type: string,
  args: any[] = [],
  target?: Window | null,
) {
  target?.postMessage(`${type}${JSON.stringify(args)}`, '*');
}

export function broadcastMessage(
  type: string,
  args: any[] = [],
  corssOrigin: boolean = false,
) {
  Array.from(window.frames).forEach((frame) => {
    try {
      if (corssOrigin || frame.document) {
        postMessage(type, args, frame);
      }
    } catch {
      if (corssOrigin) {
        postMessage(type, args, frame);
      }
    }
  });
}
