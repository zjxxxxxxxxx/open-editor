import { mitt } from '../utils/mitt';
import { onMessage, postMessage } from '../utils/message';
import { ENABLE_CROSS_IFRAME, IS_CROSS_ORIGIN } from '../constants';
import { getOptions } from '../options';

export const enableBridge = mitt({
  onBefore() {
    const { crossIframe } = getOptions();
    if (crossIframe && IS_CROSS_ORIGIN) {
      onMessage(ENABLE_CROSS_IFRAME, (args) => {
        Array.from(window.frames).forEach((frame) => {
          postMessage(ENABLE_CROSS_IFRAME, args, frame);
        });
        enableBridge.emit(args, true);
      });
    }
  },
  emitMiddlewares: [
    (args, next, formTopWindow) => {
      const { crossIframe } = getOptions();
      if (crossIframe && IS_CROSS_ORIGIN && !formTopWindow) {
        postMessage(ENABLE_CROSS_IFRAME, args, window.top);
      } else {
        next();
      }
    },
  ],
});
