import { bridge } from '../utils/bridge';
import { topWindow } from '../utils/topWindow';
import { postMessageAll, onMessage, postMessage } from '../utils/message';
import { OPEN_EDITOR_START_CROSS_IFRAME } from '../constants';
import { getOptions } from '../options';

export const openEditorStartBridge = bridge({
  setup() {
    const { crossIframe } = getOptions();
    if (crossIframe) {
      onMessage(OPEN_EDITOR_START_CROSS_IFRAME, (args) => {
        postMessageAll(OPEN_EDITOR_START_CROSS_IFRAME, args, true);
        openEditorStartBridge.emit(args, true);
      });
    }
  },
  emitMiddlewares: [
    (args, next, formTopWindow) => {
      const { crossIframe } = getOptions();
      if (crossIframe && !formTopWindow) {
        postMessage(OPEN_EDITOR_START_CROSS_IFRAME, args, topWindow);
      } else {
        next();
      }
    },
  ],
});
