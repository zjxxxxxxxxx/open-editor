import { OPEN_EDITOR_ERROR_CROSS_IFRAME } from '../constants';
import { on } from '../event';
import { getOptions } from '../options';
import { mitt } from '../utils/mitt';

export const openEditorErrorBridge = mitt({
  onBefore() {
    const { crossIframe } = getOptions();
    if (crossIframe) {
      on('message', (e) => {
        if (e.data === OPEN_EDITOR_ERROR_CROSS_IFRAME) {
          openEditorErrorBridge.emit([], true);
        }
      });
    }
  },
  emitMiddlewares: [
    (_, next, formTopWindow) => {
      const { crossIframe } = getOptions();
      if (crossIframe && !formTopWindow) {
        window.top?.postMessage(OPEN_EDITOR_ERROR_CROSS_IFRAME);
      } else {
        next();
      }
    },
  ],
});
