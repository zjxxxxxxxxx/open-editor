import { mitt } from '../utils/mitt';
import { onMessage, postMessage } from '../utils/message';
import { IS_CROSS_ORIGIN, OPEN_EDITOR_ERROR_CROSS_IFRAME } from '../constants';
import { getOptions } from '../options';

export const openEditorErrorBridge = mitt({
  onBefore() {
    const { crossIframe } = getOptions();
    if (crossIframe && IS_CROSS_ORIGIN) {
      onMessage(OPEN_EDITOR_ERROR_CROSS_IFRAME, (args) => {
        openEditorErrorBridge.emit(args, true);
      });
    }
  },
  emitMiddlewares: [
    (_, next, formTopWindow) => {
      const { crossIframe } = getOptions();
      if (crossIframe && IS_CROSS_ORIGIN && !formTopWindow) {
        postMessage(OPEN_EDITOR_ERROR_CROSS_IFRAME, [], window.top);
      } else {
        next();
      }
    },
  ],
});
