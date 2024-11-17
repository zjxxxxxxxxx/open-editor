import { mitt } from '../utils/mitt';
import { onMessage, postMessage } from '../utils/message';
import { IS_CROSS_ORIGIN, OPEN_EDITOR_START_CROSS_IFRAME } from '../constants';
import { getOptions } from '../options';

export const openEditorStartBridge = mitt({
  onBefore() {
    const { crossIframe } = getOptions();
    if (crossIframe && IS_CROSS_ORIGIN) {
      onMessage(OPEN_EDITOR_START_CROSS_IFRAME, (args) => {
        Array.from(window.frames).forEach((frame) => {
          postMessage(OPEN_EDITOR_START_CROSS_IFRAME, args, frame);
        });
        openEditorStartBridge.emit(args, true);
      });
    }
  },
  emitMiddlewares: [
    (args, next, formTopWindow) => {
      const { crossIframe } = getOptions();
      if (crossIframe && IS_CROSS_ORIGIN && !formTopWindow) {
        postMessage(OPEN_EDITOR_START_CROSS_IFRAME, args, window.top);
      } else {
        next();
      }
    },
  ],
});
