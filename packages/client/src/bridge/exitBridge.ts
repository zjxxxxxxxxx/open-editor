import { mitt } from '../utils/mitt';
import { onMessage, postMessage } from '../utils/message';
import { EXIT_CROSS_IFRAME, IS_SAME_ORIGIN } from '../constants';
import { getOptions } from '../options';

export const exitBridge = mitt({
  onBefore() {
    const { crossIframe } = getOptions();
    if (crossIframe && IS_SAME_ORIGIN) {
      onMessage(EXIT_CROSS_IFRAME, (args) => {
        Array.from(window.frames).forEach((frame) => {
          postMessage(EXIT_CROSS_IFRAME, args, frame);
        });
        exitBridge.emit(args, true);
      });
    }
  },
  emitMiddlewares: [
    (args, next, formTopWindow) => {
      const { crossIframe } = getOptions();
      if (crossIframe && IS_SAME_ORIGIN && !formTopWindow) {
        postMessage(EXIT_CROSS_IFRAME, args, window.top);
      } else {
        next();
      }
    },
  ],
});
