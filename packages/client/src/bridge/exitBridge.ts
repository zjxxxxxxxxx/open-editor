import { bridge } from '../utils/bridge';
import { topWindow } from '../utils/topWindow';
import { postMessageAll, onMessage, postMessage } from '../utils/message';
import { EXIT_CROSS_IFRAME } from '../constants';
import { getOptions } from '../options';

export const exitBridge = bridge({
  setup() {
    const { crossIframe } = getOptions();
    if (crossIframe) {
      onMessage(EXIT_CROSS_IFRAME, (args) => {
        postMessageAll(EXIT_CROSS_IFRAME, args);
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
