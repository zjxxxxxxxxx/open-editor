import { crossIframeBridge } from '../utils/crossIframeBridge';
import { topWindow, whenTopWindow } from '../utils/topWindow';
import { onMessage, postMessage } from '../utils/message';
import { OPEN_EDITOR_ERROR_CROSS_IFRAME } from '../constants';

export const openEditorErrorBridge = crossIframeBridge({
  setup() {
    onMessage(OPEN_EDITOR_ERROR_CROSS_IFRAME, (args) => {
      openEditorErrorBridge.emit(args, true);
    });
  },
  emitMiddlewares: [
    (args, next) => {
      whenTopWindow(next, () => {
        postMessage(OPEN_EDITOR_ERROR_CROSS_IFRAME, args, topWindow);
      });
    },
  ],
});
