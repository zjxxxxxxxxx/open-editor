import { mitt } from '../utils/mitt';
import { onMessage, postMessage } from '../utils/message';
import { CLOSE_TREE_CROSS_IFRAME, IS_SAME_ORIGIN } from '../constants';
import { getOptions } from '../options';

export const closeTreeBridge = mitt({
  onBefore() {
    const { crossIframe } = getOptions();
    if (crossIframe && IS_SAME_ORIGIN) {
      onMessage(CLOSE_TREE_CROSS_IFRAME, (args) => {
        closeTreeBridge.emit(args, true);
      });
    }
  },
  emitMiddlewares: [
    (_, next, formTopWindow) => {
      const { crossIframe } = getOptions();
      if (crossIframe && IS_SAME_ORIGIN && !formTopWindow) {
        postMessage(CLOSE_TREE_CROSS_IFRAME, [], window.top);
      } else {
        next();
      }
    },
  ],
});
