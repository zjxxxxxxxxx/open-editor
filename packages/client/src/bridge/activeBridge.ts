import { mitt } from '../utils/mitt';
import { onMessage, postMessage } from '../utils/message';
import { IS_SAME_ORIGIN, ACTIVE_CROSS_IFRAME } from '../constants';
import { getOptions } from '../options';

export const activeBridge = mitt<[string]>({
  onBefore() {
    const { crossIframe } = getOptions();
    if (crossIframe && IS_SAME_ORIGIN) {
      onMessage<[string]>(ACTIVE_CROSS_IFRAME, (args) => {
        Array.from(window.frames).forEach((frame) => {
          postMessage(ACTIVE_CROSS_IFRAME, args, frame);
        });
        activeBridge.emit(args, true);
      });
    }
  },
  emitMiddlewares: [
    (args, next, formTopWindow) => {
      const { crossIframe } = getOptions();
      if (crossIframe && IS_SAME_ORIGIN && !formTopWindow) {
        postMessage(ACTIVE_CROSS_IFRAME, args, window.top);
      } else {
        next();
      }
    },
  ],
});
