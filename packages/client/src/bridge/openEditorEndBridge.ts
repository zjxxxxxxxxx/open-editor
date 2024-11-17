import { mitt } from '../utils/mitt';
import { onMessage, postMessage } from '../utils/message';
import { IS_SAME_ORIGIN, OPEN_EDITOR_END_CROSS_IFRAME } from '../constants';
import { getOptions } from '../options';

export const openEditorEndBridge = mitt({
  onBefore() {
    const { crossIframe } = getOptions();
    if (crossIframe && IS_SAME_ORIGIN) {
      onMessage(OPEN_EDITOR_END_CROSS_IFRAME, (args) => {
        Array.from(window.frames).forEach((frame) => {
          postMessage(OPEN_EDITOR_END_CROSS_IFRAME, args, frame);
        });
        openEditorEndBridge.emit(args, true);
      });
    }
  },
  emitMiddlewares: [
    (args, next, formTopWindow) => {
      const { crossIframe } = getOptions();
      if (crossIframe && IS_SAME_ORIGIN && !formTopWindow) {
        postMessage(OPEN_EDITOR_END_CROSS_IFRAME, args, window.top);
      } else {
        next();
      }
    },
  ],
});
