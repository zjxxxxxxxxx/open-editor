import { mitt } from '../utils/mitt';
import { topWindow } from '../utils/getTopWindow';
import { broadcastMessage, onMessage, postMessage } from '../utils/message';
import { ACTIVE_CROSS_IFRAME } from '../constants';
import { getOptions } from '../options';

export const activeBridge = mitt<[string]>({
  onBefore() {
    const { crossIframe } = getOptions();
    if (crossIframe) {
      onMessage<[string]>(ACTIVE_CROSS_IFRAME, (args) => {
        broadcastMessage(ACTIVE_CROSS_IFRAME, args);
        activeBridge.emit(args, true);
      });
    }
  },
  emitMiddlewares: [
    (args, next, formTopWindow) => {
      const { crossIframe } = getOptions();
      if (crossIframe && !formTopWindow) {
        postMessage(ACTIVE_CROSS_IFRAME, args, topWindow);
      } else {
        next();
      }
    },
  ],
});
