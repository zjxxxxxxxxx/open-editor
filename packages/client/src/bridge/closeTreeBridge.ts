import { mitt } from '../utils/mitt';
import { CLOSE_TREE_CROSS_IFRAME } from '../constants';
import { getOptions } from '../options';
import { on } from '../event';

export const closeTreeBridge = mitt({
  onBefore() {
    const { crossIframe } = getOptions();
    if (crossIframe) {
      on('message', (e) => {
        if (e.data === CLOSE_TREE_CROSS_IFRAME) {
          closeTreeBridge.emit([], true);
        }
      });
    }
  },
  emitMiddlewares: [
    (_, next, formTopWindow) => {
      const { crossIframe } = getOptions();
      if (crossIframe && !formTopWindow) {
        window.top?.postMessage(CLOSE_TREE_CROSS_IFRAME);
      } else {
        next();
      }
    },
  ],
});
