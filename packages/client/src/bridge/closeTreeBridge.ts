import { mitt } from '../utils/mitt';
import { topWindow } from '../utils/getTopWindow';
import { onMessage, postMessage } from '../utils/message';
import { CLOSE_TREE_CROSS_IFRAME } from '../constants';
import { getOptions } from '../options';

export const closeTreeBridge = mitt({
  onBefore() {
    const { crossIframe } = getOptions();
    if (crossIframe) {
      onMessage(CLOSE_TREE_CROSS_IFRAME, (args) => {
        closeTreeBridge.emit(args, true);
      });
    }
  },
  emitMiddlewares: [
    (_, next, formTopWindow) => {
      const { crossIframe } = getOptions();
      if (crossIframe && !formTopWindow) {
        postMessage(CLOSE_TREE_CROSS_IFRAME, [], topWindow);
      } else {
        next();
      }
    },
  ],
});
