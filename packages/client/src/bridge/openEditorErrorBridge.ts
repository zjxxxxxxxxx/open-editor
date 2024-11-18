import { bridge } from '../utils/bridge';
import { topWindow } from '../utils/topWindow';
import { onMessage, postMessage } from '../utils/message';
import { OPEN_EDITOR_ERROR_CROSS_IFRAME } from '../constants';
import { getOptions } from '../options';

export const openEditorErrorBridge = bridge({
  setup() {
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
