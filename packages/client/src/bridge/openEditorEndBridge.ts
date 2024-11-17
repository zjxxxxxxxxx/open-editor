import { mitt } from '../utils/mitt';
import { OPEN_EDITOR_END_CROSS_IFRAME } from '../constants';
import { on } from '../event';
import { getOptions } from '../options';

export const openEditorEndBridge = mitt({
  onBefore() {
    const { crossIframe } = getOptions();
    if (crossIframe) {
      on('message', (e) => {
        if (e.data === OPEN_EDITOR_END_CROSS_IFRAME) {
          Array.from(window.frames).forEach((frame) =>
            frame.postMessage(OPEN_EDITOR_END_CROSS_IFRAME),
          );
          openEditorEndBridge.emit([], true);
        }
      });
    }
  },
  emitMiddlewares: [
    (_, next, formTopWindow) => {
      const { crossIframe } = getOptions();
      if (crossIframe && !formTopWindow) {
        window.top?.postMessage(OPEN_EDITOR_END_CROSS_IFRAME);
      } else {
        next();
      }
    },
  ],
});
