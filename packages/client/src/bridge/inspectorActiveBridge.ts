import { bridge } from '../utils/bridge';
import { topWindow } from '../utils/topWindow';
import { postMessageAll, onMessage, postMessage } from '../utils/message';
import { INSPECTOR_ACTIVE_CROSS_IFRAME } from '../constants';
import { getOptions } from '../options';

export const inspectorActiveBridge = bridge<[string]>({
  setup() {
    const { crossIframe } = getOptions();
    if (crossIframe) {
      onMessage<[string]>(INSPECTOR_ACTIVE_CROSS_IFRAME, (args) => {
        postMessageAll(INSPECTOR_ACTIVE_CROSS_IFRAME, args);
        inspectorActiveBridge.emit(args, true);
      });
    }
  },
  emitMiddlewares: [
    (args, next, formTopWindow) => {
      const { crossIframe } = getOptions();
      if (crossIframe && !formTopWindow) {
        postMessage(INSPECTOR_ACTIVE_CROSS_IFRAME, args, topWindow);
      } else {
        next();
      }
    },
  ],
});
