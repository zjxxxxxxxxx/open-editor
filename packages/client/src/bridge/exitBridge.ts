import { mitt } from '../utils/mitt';
import { EXIT_CROSS_IFRAME } from '../constants';
import { getOptions } from '../options';
import { on } from '../event';

export const exitBridge = mitt({
  onBefore() {
    const { crossIframe } = getOptions();
    if (crossIframe) {
      on('message', (e) => {
        if (e.data === EXIT_CROSS_IFRAME) {
          Array.from(window.frames).forEach((frame) =>
            frame.postMessage(EXIT_CROSS_IFRAME),
          );
          exitBridge.emit([], true);
        }
      });
    }
  },
  emitMiddlewares: [
    (_, next, formTopWindow) => {
      const { crossIframe } = getOptions();
      if (crossIframe && !formTopWindow) {
        window.top?.postMessage(EXIT_CROSS_IFRAME);
      } else {
        next();
      }
    },
  ],
});
