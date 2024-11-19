import { bridge } from '../utils/bridge';
import { topWindow } from '../utils/topWindow';
import { postMessageAll, onMessage, postMessage } from '../utils/message';
import { INSPECTOR_EXIT_CROSS_IFRAME } from '../constants';
import { getOptions } from '../options';

export const inspectorExitBridge = bridge({
  setup() {
    const { crossIframe } = getOptions();
    if (crossIframe) {
      onMessage(INSPECTOR_EXIT_CROSS_IFRAME, (args) => {
        postMessageAll(INSPECTOR_EXIT_CROSS_IFRAME, args);
        inspectorExitBridge.emit(args, true);
      });
    }
  },
  emitMiddlewares: [
    (args, next, formTopWindow) => {
      const { crossIframe } = getOptions();
      if (crossIframe && !formTopWindow) {
        postMessage(INSPECTOR_EXIT_CROSS_IFRAME, args, topWindow);
      } else {
        next();
      }
    },
  ],
});
