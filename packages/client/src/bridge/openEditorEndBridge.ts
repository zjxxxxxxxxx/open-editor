import { mitt } from '../utils/mitt';
import { topWindow } from '../utils/getTopWindow';
import { broadcastMessage, onMessage, postMessage } from '../utils/message';
import { OPEN_EDITOR_END_CROSS_IFRAME } from '../constants';
import { getOptions } from '../options';

export const openEditorEndBridge = mitt({
  onBefore() {
    const { crossIframe } = getOptions();
    if (crossIframe) {
      onMessage(OPEN_EDITOR_END_CROSS_IFRAME, (args) => {
        broadcastMessage(OPEN_EDITOR_END_CROSS_IFRAME, args, true);
        openEditorEndBridge.emit(args, true);
      });
    }
  },
  emitMiddlewares: [
    (args, next, formTopWindow) => {
      const { crossIframe } = getOptions();
      if (crossIframe && !formTopWindow) {
        postMessage(OPEN_EDITOR_END_CROSS_IFRAME, args, topWindow);
      } else {
        next();
      }
    },
  ],
});
