import { crossIframeBridge } from '../utils/crossIframeBridge';
import { topWindow, whenTopWindow } from '../utils/topWindow';
import { onMessage, postMessage } from '../utils/message';
import { type CodeSourceMeta } from '../resolve';
import { OPEN_EDITOR_CROSS_IFRAME } from '../constants';

export const openEditorBridge = crossIframeBridge<[CodeSourceMeta?]>({
  setup() {
    onMessage<[CodeSourceMeta?]>(OPEN_EDITOR_CROSS_IFRAME, (args) => {
      openEditorBridge.emit(args, true);
    });
  },
  emitMiddlewares: [
    (args, next) => {
      whenTopWindow(next, () => {
        postMessage(OPEN_EDITOR_CROSS_IFRAME, args, topWindow);
      });
    },
  ],
});
