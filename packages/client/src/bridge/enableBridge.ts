import { bridge } from '../utils/bridge';
import { topWindow } from '../utils/topWindow';
import { postMessageAll, onMessage, postMessage } from '../utils/message';
import { ENABLE_CROSS_IFRAME } from '../constants';
import { getOptions } from '../options';

export const enableBridge = bridge({
  setup() {
    const { crossIframe } = getOptions();
    if (crossIframe) {
      onMessage(ENABLE_CROSS_IFRAME, (args) => {
        postMessageAll(ENABLE_CROSS_IFRAME, args);
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
