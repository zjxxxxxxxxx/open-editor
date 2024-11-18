import { mitt } from '../utils/mitt';
import { topWindow } from '../utils/getTopWindow';
import { broadcastMessage, onMessage, postMessage } from '../utils/message';
import { EXIT_CROSS_IFRAME } from '../constants';
import { getOptions } from '../options';

export const exitBridge = mitt({
  onBefore() {
    const { crossIframe } = getOptions();
    if (crossIframe) {
      onMessage(EXIT_CROSS_IFRAME, (args) => {
        broadcastMessage(EXIT_CROSS_IFRAME, args);
        exitBridge.emit(args, true);
      });
    }
  },
  emitMiddlewares: [
    (args, next, formTopWindow) => {
      const { crossIframe } = getOptions();
      if (crossIframe && !formTopWindow) {
        postMessage(EXIT_CROSS_IFRAME, args, topWindow);
      } else {
        next();
      }
    },
  ],
});
