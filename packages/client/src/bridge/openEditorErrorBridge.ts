import { mitt } from '../utils/mitt';
import { topWindow } from '../utils/getTopWindow';
import { onMessage, postMessage } from '../utils/message';
import { OPEN_EDITOR_ERROR_CROSS_IFRAME } from '../constants';
import { getOptions } from '../options';

export const openEditorErrorBridge = mitt({
  onBefore() {
    const { crossIframe } = getOptions();
    if (crossIframe) {
      onMessage(OPEN_EDITOR_ERROR_CROSS_IFRAME, (args) => {
        openEditorErrorBridge.emit(args, true);
      });
    }
  },
  emitMiddlewares: [
    (_, next, formTopWindow) => {
      const { crossIframe } = getOptions();
      if (crossIframe && !formTopWindow) {
        postMessage(OPEN_EDITOR_ERROR_CROSS_IFRAME, [], topWindow);
      } else {
        next();
      }
    },
  ],
});
