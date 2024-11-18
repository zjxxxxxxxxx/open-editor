import { mitt } from '../utils/mitt';
import { topWindow } from '../utils/getTopWindow';
import { broadcastMessage, onMessage, postMessage } from '../utils/message';
import { ENABLE_CROSS_IFRAME } from '../constants';
import { getOptions } from '../options';

export const enableBridge = mitt({
  onBefore() {
    const { crossIframe } = getOptions();
    if (crossIframe) {
      onMessage(ENABLE_CROSS_IFRAME, (args) => {
        broadcastMessage(ENABLE_CROSS_IFRAME, args);
        enableBridge.emit(args, true);
      });
    }
  },
  emitMiddlewares: [
    (args, next, formTopWindow) => {
      const { crossIframe } = getOptions();
      if (crossIframe && !formTopWindow) {
        postMessage(ENABLE_CROSS_IFRAME, args, topWindow);
      } else {
        next();
      }
    },
  ],
});
