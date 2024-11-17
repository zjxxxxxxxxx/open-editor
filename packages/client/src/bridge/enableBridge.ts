import { mitt } from '../utils/mitt';
import { ENABLE_CROSS_IFRAME } from '../constants';
import { getOptions } from '../options';
import { on } from '../event';

export const enableBridge = mitt({
  onBefore() {
    const { crossIframe } = getOptions();
    if (crossIframe) {
      on('message', (e) => {
        if (e.data === ENABLE_CROSS_IFRAME) {
          Array.from(window.frames).forEach((frame) =>
            frame.postMessage(ENABLE_CROSS_IFRAME),
          );
          enableBridge.emit([], true);
        }
      });
    }
  },
  emitMiddlewares: [
    (_, next, formTopWindow) => {
      const { crossIframe } = getOptions();
      if (crossIframe && !formTopWindow) {
        window.top?.postMessage(ENABLE_CROSS_IFRAME);
      } else {
        next();
      }
    },
  ],
});
