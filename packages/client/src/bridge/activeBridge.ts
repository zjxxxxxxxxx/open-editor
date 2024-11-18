import { bridge } from '../utils/bridge';
import { topWindow } from '../utils/topWindow';
import { postMessageAll, onMessage, postMessage } from '../utils/message';
import { ACTIVE_CROSS_IFRAME } from '../constants';
import { getOptions } from '../options';

export const activeBridge = bridge<[string]>({
  setup() {
    const { crossIframe } = getOptions();
    if (crossIframe) {
      onMessage<[string]>(ACTIVE_CROSS_IFRAME, (args) => {
        postMessageAll(ACTIVE_CROSS_IFRAME, args);
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
